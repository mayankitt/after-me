/**
 * Audit logging service.
 *
 * Every security-relevant action (upload, download, delete, account deletion)
 * is written to the append-only `audit_logs` table.  The application never
 * deletes audit rows — only the DBA can, under a documented retention policy.
 *
 * Falls back to a structured console log when the database is unavailable so
 * that audit events are never silently lost.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

export type AuditAction =
  | 'UPLOAD'
  | 'DOWNLOAD'
  | 'DELETE'
  | 'DELETE_ACCOUNT'
  | 'LOGIN'
  | 'LOGOUT';

export interface AuditEvent {
  userId: string;
  action: AuditAction;
  resource?: string;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Write an audit event to the database.
 * Never throws — failures are logged so a DB outage cannot break the happy path.
 */
export async function writeAuditLog(event: AuditEvent): Promise<void> {
  const { userId, action, resource, ipAddress, userAgent, success = true, metadata } = event;

  // Always emit a structured log line regardless of DB availability
  logger.info('AUDIT', { userId, action, resource, success, ipAddress });

  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource: resource ?? null,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        success,
    metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch (err) {
    // Log but do not propagate — a DB write failure must never block the user
    logger.error('Failed to persist audit log', {
      userId,
      action,
      resource,
      error: String(err),
    });
  }
}

/** Extract the real client IP from Next.js request headers. */
export function extractIp(req: Request): string | undefined {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    undefined
  );
}
