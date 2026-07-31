import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { getPresignedDownloadUrl } from '@/lib/storage/storageService';
import { prisma } from '@/lib/db/prisma';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { writeAuditLog, extractIp } from '@/lib/audit';
import type { NextAuthRequest } from 'next-auth';

// 100 downloads per hour per user
const DOWNLOAD_LIMIT = { limit: 100, windowMs: 60 * 60 * 1000 };

export const GET = auth(async (req: NextAuthRequest) => {
  const session = req.auth;
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = rateLimit(`download:${userId}`, DOWNLOAD_LIMIT);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many download requests. Please wait before trying again.' },
      { status: 429, headers: rlHeaders },
    );
  }

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json(
      { error: 'Missing key parameter.' },
      { status: 400, headers: rlHeaders },
    );
  }

  // Ownership check: key prefix AND database ownership verification
  if (!key.startsWith(`${userId}/`)) {
    await writeAuditLog({
      userId,
      action: 'DOWNLOAD',
      resource: key,
      success: false,
      ipAddress: extractIp(req),
      userAgent: req.headers.get('user-agent') ?? undefined,
      metadata: { reason: 'forbidden' },
    });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: rlHeaders });
  }

  // Verify ownership via database record
  const document = await prisma.document.findFirst({
    where: { s3Key: key, userId, deletedAt: null },
  });

  if (!document) {
    return NextResponse.json(
      { error: 'Document not found.' },
      { status: 404, headers: rlHeaders },
    );
  }

  const url = await getPresignedDownloadUrl(key);

  await writeAuditLog({
    userId,
    action: 'DOWNLOAD',
    resource: key,
    success: true,
    ipAddress: extractIp(req),
    userAgent: req.headers.get('user-agent') ?? undefined,
    metadata: { documentId: document.id },
  });

  return NextResponse.json({ url }, { headers: rlHeaders });
});
