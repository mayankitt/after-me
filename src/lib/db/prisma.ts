/**
 * Prisma client singleton.
 *
 * Next.js hot-reloading creates new module instances in development, which
 * would exhaust the database connection pool if we created a new PrismaClient
 * on every reload.  We store one instance on the global object so it survives
 * hot-reloads, but create a fresh client in production (where there are no
 * hot-reloads and we want a clean state per deployment).
 */
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Verify that the database is reachable.  Returns true on success.
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    logger.error('Database health check failed', { error: String(err) });
    return false;
  }
}
