import { S3Client } from '@aws-sdk/client-s3';

const region = process.env.S3_REGION ?? 'us-east-1';
const endpoint = process.env.S3_ENDPOINT; // undefined for AWS S3; set for MinIO/R2/B2/etc.

export const s3Client = new S3Client({
  region,
  ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
  },
});

export const S3_BUCKET = process.env.S3_BUCKET_NAME ?? 'afterme-vault';
