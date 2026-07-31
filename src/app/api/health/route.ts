/**
 * Health check endpoint — used by load balancers and uptime monitors.
 *
 * GET /api/health
 *
 * Returns 200 when all critical dependencies are reachable, 503 otherwise.
 * The response body contains per-service status so dashboards can pinpoint
 * which dependency is degraded.
 */
import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db/prisma';
import { checkS3Health } from '@/lib/storage/storageService';

interface HealthStatus {
  status: 'ok' | 'degraded';
  timestamp: string;
  services: {
    database: 'ok' | 'error';
    storage: 'ok' | 'error';
  };
}

export const dynamic = 'force-dynamic'; // Never cache health checks

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const [dbOk, s3Ok] = await Promise.all([checkDatabaseHealth(), checkS3Health()]);

  const allOk = dbOk && s3Ok;

  const body: HealthStatus = {
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: dbOk ? 'ok' : 'error',
      storage: s3Ok ? 'ok' : 'error',
    },
  };

  return NextResponse.json(body, { status: allOk ? 200 : 503 });
}
