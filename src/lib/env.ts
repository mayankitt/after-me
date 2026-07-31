/**
 * Environment variable validation.
 * Fails fast at startup with a clear, actionable error if required variables
 * are missing or malformed.  Import this module (or any module that imports it)
 * early in the application lifecycle.
 *
 * During Next.js builds (NEXT_PHASE=phase-production-build) or when
 * SKIP_ENV_VALIDATION=1 is set, validation is skipped so CI pipelines can
 * build without real runtime credentials.  The real values are required at
 * actual request time.
 */
import { z } from 'zod';

const envSchema = z.object({
  // Auth
  KEYCLOAK_CLIENT_ID: z.string().min(1, 'KEYCLOAK_CLIENT_ID is required'),
  KEYCLOAK_CLIENT_SECRET: z.string().min(1, 'KEYCLOAK_CLIENT_SECRET is required'),
  KEYCLOAK_ISSUER: z.string().url('KEYCLOAK_ISSUER must be a valid URL'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

  // S3-compatible storage
  S3_ACCESS_KEY_ID: z.string().min(1, 'S3_ACCESS_KEY_ID is required'),
  S3_SECRET_ACCESS_KEY: z.string().min(1, 'S3_SECRET_ACCESS_KEY is required'),
  S3_BUCKET_NAME: z.string().min(1, 'S3_BUCKET_NAME is required'),
  S3_REGION: z.string().default('us-east-1'),
  S3_ENDPOINT: z.string().url().optional(), // leave unset for AWS S3

  // Database
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid PostgreSQL connection URL (e.g. ******host/db)'),

  // Optional observability
  SENTRY_DSN: z.string().url().optional(),

  // Runtime
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
});

export type Env = z.infer<typeof envSchema>;

// Skip validation during Next.js builds or when explicitly opted out.
// Real values are validated on first request.
const skipValidation =
  process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.SKIP_ENV_VALIDATION === '1';

let _env: Env | null = null;

function getEnv(): Env {
  if (_env) return _env;

  if (skipValidation) {
    // Return a partial object during build — values are placeholders only
    _env = process.env as unknown as Env;
    return _env;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `\n\n❌ Invalid environment variables:\n${issues}\n\nSee .env.local.example for the full list of required variables.\n`,
    );
  }

  _env = parsed.data;
  return _env;
}

// Proxy-based env object: validation runs on first property access,
// not at module-import time, making it safe for Next.js page data collection.
export const env = new Proxy({} as Env, {
  get(_target, prop) {
    return getEnv()[prop as keyof Env];
  },
});
