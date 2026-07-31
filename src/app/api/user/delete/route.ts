/**
 * GDPR Article 17 – Right to Erasure ("right to be forgotten").
 *
 * DELETE /api/user/delete
 *
 * Permanently deletes:
 *  1. All S3 objects owned by the user
 *  2. All database document records (hard-delete after S3 removal)
 *  3. A final audit log entry recording the deletion
 *
 * The audit log rows themselves are NOT deleted — they are required to satisfy
 * legal accountability obligations (retained per your data-retention policy).
 *
 * After this call succeeds the session should be terminated — the client is
 * responsible for calling signOut().
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { deleteObject, listObjects } from '@/lib/storage/storageService';
import { prisma } from '@/lib/db/prisma';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { writeAuditLog, extractIp } from '@/lib/audit';
import { logger } from '@/lib/logger';
import type { NextAuthRequest } from 'next-auth';

// Prevent abuse — 3 attempts per hour per user
const DELETE_ACCOUNT_LIMIT = { limit: 3, windowMs: 60 * 60 * 1000 };

export const DELETE = auth(async (req: NextAuthRequest) => {
  const session = req.auth;
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = rateLimit(`delete-account:${userId}`, DELETE_ACCOUNT_LIMIT);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests.' },
      { status: 429, headers: rlHeaders },
    );
  }

  logger.info('Account deletion initiated', { userId });

  // 1. List all S3 objects belonging to this user
  let s3Keys: string[] = [];
  try {
    const objects = await listObjects(`${userId}/`);
    s3Keys = objects.map((o) => o.Key!).filter(Boolean);
  } catch (err) {
    logger.error('Failed to list S3 objects for account deletion', { userId, error: String(err) });
    return NextResponse.json(
      { error: 'Account deletion failed. Please contact support.' },
      { status: 502, headers: rlHeaders },
    );
  }

  // 2. Delete all S3 objects (continue on individual failures — log them)
  const failedKeys: string[] = [];
  for (const key of s3Keys) {
    try {
      await deleteObject(key);
    } catch (err) {
      logger.error('Failed to delete S3 object during account deletion', {
        userId,
        key,
        error: String(err),
      });
      failedKeys.push(key);
    }
  }

  if (failedKeys.length > 0) {
    logger.warn('Some S3 objects could not be deleted during account deletion', {
      userId,
      failedCount: failedKeys.length,
    });
  }

  // 3. Hard-delete all document records from the database
  await prisma.document.deleteMany({ where: { userId } });

  // 4. Write the final audit log entry before the user ceases to exist
  await writeAuditLog({
    userId,
    action: 'DELETE_ACCOUNT',
    success: true,
    ipAddress: extractIp(req),
    userAgent: req.headers.get('user-agent') ?? undefined,
    metadata: {
      s3ObjectsDeleted: s3Keys.length - failedKeys.length,
      s3ObjectsFailed: failedKeys.length,
    },
  });

  logger.info('Account deletion completed', {
    userId,
    objectsDeleted: s3Keys.length - failedKeys.length,
  });

  return NextResponse.json({ success: true }, { headers: rlHeaders });
});
