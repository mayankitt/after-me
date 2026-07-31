import { S3Client } from '@aws-sdk/client-s3';
import { env } from '@/lib/env';

const region = env.S3_REGION;
const endpoint = env.S3_ENDPOINT; // undefined for AWS S3; set for MinIO/R2/B2/etc.

export const s3Client = new S3Client({
  region,
  ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

export const S3_BUCKET = env.S3_BUCKET_NAME;
