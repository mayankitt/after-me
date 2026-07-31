/**
 * Health check route — unit tests.
 *
 * We mock both the database and S3 health-check functions so the test runs
 * without any real infrastructure.
 */

// Mock modules before importing the route
jest.mock('@/lib/db/prisma', () => ({
  checkDatabaseHealth: jest.fn(),
  prisma: {},
}));

jest.mock('@/lib/storage/storageService', () => ({
  checkS3Health: jest.fn(),
  buildS3Key: jest.fn(),
  uploadObject: jest.fn(),
  getPresignedDownloadUrl: jest.fn(),
  deleteObject: jest.fn(),
  listObjects: jest.fn(),
}));

import { GET } from '@/app/api/health/route';
import { checkDatabaseHealth } from '@/lib/db/prisma';
import { checkS3Health } from '@/lib/storage/storageService';

const mockDbHealth = checkDatabaseHealth as jest.MockedFunction<typeof checkDatabaseHealth>;
const mockS3Health = checkS3Health as jest.MockedFunction<typeof checkS3Health>;

describe('GET /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 and status ok when all services are healthy', async () => {
    mockDbHealth.mockResolvedValue(true);
    mockS3Health.mockResolvedValue(true);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.services.database).toBe('ok');
    expect(body.services.storage).toBe('ok');
    expect(body.timestamp).toBeDefined();
  });

  it('returns 503 and status degraded when the database is down', async () => {
    mockDbHealth.mockResolvedValue(false);
    mockS3Health.mockResolvedValue(true);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services.database).toBe('error');
    expect(body.services.storage).toBe('ok');
  });

  it('returns 503 and status degraded when S3 is down', async () => {
    mockDbHealth.mockResolvedValue(true);
    mockS3Health.mockResolvedValue(false);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services.database).toBe('ok');
    expect(body.services.storage).toBe('error');
  });

  it('returns 503 when both services are down', async () => {
    mockDbHealth.mockResolvedValue(false);
    mockS3Health.mockResolvedValue(false);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.services.database).toBe('error');
    expect(body.services.storage).toBe('error');
  });
});
