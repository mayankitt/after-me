import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { deleteObject } from '@/lib/storage/storageService';
import { prisma } from '@/lib/db/prisma';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { writeAuditLog, extractIp } from '@/lib/audit';
import { logger } from '@/lib/logger';
import type { NextAuthRequest } from 'next-auth';

// 120 list requests per minute per user; 30 deletes per hour per user
const LIST_LIMIT = { limit: 120, windowMs: 60 * 1000 };
const DELETE_LIMIT = { limit: 30, windowMs: 60 * 60 * 1000 };

export const GET = auth(async (req: NextAuthRequest) => {
  const session = req.auth;
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = rateLimit(`list:${userId}`, LIST_LIMIT);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429, headers: rlHeaders },
    );
  }

  const documents = await prisma.document.findMany({
    where: { userId, deletedAt: null },
    orderBy: { uploadedAt: 'desc' },
    select: {
      id: true,
      s3Key: true,
      name: true,
      type: true,
      category: true,
      contentType: true,
      size: true,
      isRequired: true,
      uploadedAt: true,
    },
  });

  return NextResponse.json(
    {
      documents: documents.map((d) => ({
        key: d.s3Key,
        name: d.name,
        type: d.type,
        category: d.category,
        contentType: d.contentType,
        size: d.size,
        isRequired: d.isRequired,
        uploadDate: d.uploadedAt.toISOString(),
      })),
    },
    { headers: rlHeaders },
  );
});

export const DELETE = auth(async (req: NextAuthRequest) => {
  const session = req.auth;
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = rateLimit(`delete:${userId}`, DELETE_LIMIT);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many delete requests. Please wait before trying again.' },
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

  // Ownership check — must belong to this user
  if (!key.startsWith(`${userId}/`)) {
    await writeAuditLog({
      userId,
      action: 'DELETE',
      resource: key,
      success: false,
      ipAddress: extractIp(req),
      userAgent: req.headers.get('user-agent') ?? undefined,
      metadata: { reason: 'forbidden' },
    });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: rlHeaders });
  }

  // Verify the document exists in our database and belongs to this user
  const document = await prisma.document.findFirst({
    where: { s3Key: key, userId, deletedAt: null },
  });

  if (!document) {
    return NextResponse.json(
      { error: 'Document not found.' },
      { status: 404, headers: rlHeaders },
    );
  }

  try {
    await deleteObject(key);
  } catch (err) {
    logger.error('S3 delete failed', { userId, key, error: String(err) });
    await writeAuditLog({
      userId,
      action: 'DELETE',
      resource: key,
      success: false,
      ipAddress: extractIp(req),
      userAgent: req.headers.get('user-agent') ?? undefined,
      metadata: { error: String(err) },
    });
    return NextResponse.json(
      { error: 'Delete failed. Please try again.' },
      { status: 502, headers: rlHeaders },
    );
  }

  // Soft-delete in database (preserves audit trail)
  await prisma.document.update({
    where: { id: document.id },
    data: { deletedAt: new Date() },
  });

  await writeAuditLog({
    userId,
    action: 'DELETE',
    resource: key,
    success: true,
    ipAddress: extractIp(req),
    userAgent: req.headers.get('user-agent') ?? undefined,
    metadata: { documentId: document.id },
  });

  return NextResponse.json({ success: true }, { headers: rlHeaders });
});
