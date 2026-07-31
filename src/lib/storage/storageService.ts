import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  type _Object,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { s3Client, S3_BUCKET } from './s3Client';

/**
 * Build a safe, collision-resistant S3 key for a new upload.
 * Format: `<userId>/<uuid>-<sanitisedOriginalName>`
 */
export function buildS3Key(userId: string, originalFileName: string): string {
  const sanitised = originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${userId}/${randomUUID()}-${sanitised}`;
}

/**
 * Upload a file/blob to S3-compatible storage.
 */
export async function uploadObject(
  key: string,
  body: Buffer | Uint8Array | Blob | ReadableStream,
  contentType: string,
): Promise<void> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body as Buffer,
      ContentType: contentType,
      // Server-side encryption
      ServerSideEncryption: 'AES256',
    }),
  );
}

/**
 * Generate a pre-signed URL for downloading an object.
 * Defaults to 1 hour expiry.
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Delete an object from storage.
 */
export async function deleteObject(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }),
  );
}

/**
 * List ALL objects under a given prefix, handling S3 pagination transparently.
 * Returns the raw S3 object list entries.
 */
export async function listObjects(prefix: string): Promise<_Object[]> {
  const results: _Object[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    if (response.Contents) {
      results.push(...response.Contents);
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return results;
}

/**
 * Check that the S3 bucket is reachable by listing a single key.
 * Used by the health-check endpoint.
 */
export async function checkS3Health(): Promise<boolean> {
  try {
    await s3Client.send(
      new ListObjectsV2Command({ Bucket: S3_BUCKET, MaxKeys: 1 }),
    );
    return true;
  } catch {
    return false;
  }
}
