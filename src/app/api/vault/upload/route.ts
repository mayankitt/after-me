import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authConfig';
import { validateFile, MAX_FILE_SIZE_BYTES } from '@/lib/storage/fileValidation';
import { uploadObject, buildS3Key } from '@/lib/storage/storageService';
import { prisma } from '@/lib/db/prisma';
import { rateLimit, rateLimitHeaders } from '@/lib/rate-limit';
import { writeAuditLog, extractIp } from '@/lib/audit';
import { logger } from '@/lib/logger';
import type { NextAuthRequest } from 'next-auth';

// 10 uploads per hour per user
const UPLOAD_LIMIT = { limit: 10, windowMs: 60 * 60 * 1000 };

export const POST = auth(async (req: NextAuthRequest) => {
  const session = req.auth;
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  const rl = rateLimit(`upload:${userId}`, UPLOAD_LIMIT);
  const rlHeaders = rateLimitHeaders(rl);
  if (!rl.success) {
    await writeAuditLog({
      userId,
      action: 'UPLOAD',
      success: false,
      ipAddress: extractIp(req),
      userAgent: req.headers.get('user-agent') ?? undefined,
      metadata: { reason: 'rate_limited' },
    });
    return NextResponse.json(
      { error: 'Too many uploads. Please wait before uploading again.' },
      { status: 429, headers: rlHeaders },
    );
  }

  let file: File | null = null;
  let name: string;
  let type: string;
  let category: string;
  let isRequired: boolean;

  try {
    const formData = await req.formData();
    file = formData.get('file') as File | null;
    name = formData.get('name') as string;
    type = formData.get('type') as string;
    category = formData.get('category') as string;
    isRequired = formData.get('isRequired') === 'true';
  } catch {
    return NextResponse.json(
      { error: 'Invalid form data.' },
      { status: 400, headers: rlHeaders },
    );
  }

  if (!file) {
    return NextResponse.json(
      { error: 'No file provided.' },
      { status: 400, headers: rlHeaders },
    );
  }

  // Convert to buffer once (needed for validation and upload)
  const buffer = Buffer.from(await file.arrayBuffer());

  // File validation: size + MIME allowlist + magic bytes
  const validation = validateFile(buffer, file.type || 'application/octet-stream', buffer.length);
  if (!validation.valid) {
    await writeAuditLog({
      userId,
      action: 'UPLOAD',
      success: false,
      ipAddress: extractIp(req),
      userAgent: req.headers.get('user-agent') ?? undefined,
      metadata: { reason: 'validation_failed', error: validation.error, fileName: file.name },
    });
    return NextResponse.json(
      { error: validation.error },
      { status: 422, headers: rlHeaders },
    );
  }

  // Enforce size header consistency
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'File exceeds the 50 MB size limit.' },
      { status: 413, headers: rlHeaders },
    );
  }

  const key = buildS3Key(userId, file.name);

  try {
    await uploadObject(key, buffer, file.type || 'application/octet-stream');
  } catch (err) {
    logger.error('S3 upload failed', { userId, key, error: String(err) });
    await writeAuditLog({
      userId,
      action: 'UPLOAD',
      resource: key,
      success: false,
      ipAddress: extractIp(req),
      userAgent: req.headers.get('user-agent') ?? undefined,
      metadata: { error: String(err) },
    });
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 502, headers: rlHeaders },
    );
  }

  // Persist metadata to database
  const document = await prisma.document.create({
    data: {
      userId,
      s3Key: key,
      name: name || file.name,
      fileName: file.name,
      type: type || file.name.split('.').pop() || 'Unknown',
      category: category || 'Other',
      contentType: file.type || 'application/octet-stream',
      size: buffer.length,
      isRequired,
    },
  });

  await writeAuditLog({
    userId,
    action: 'UPLOAD',
    resource: key,
    success: true,
    ipAddress: extractIp(req),
    userAgent: req.headers.get('user-agent') ?? undefined,
    metadata: { documentId: document.id, size: buffer.length, category },
  });

  return NextResponse.json({ success: true, document }, { status: 201, headers: rlHeaders });
});
