import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  type _Object,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from './s3Client';

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
 * List objects under a given prefix (e.g. `userId/`).
 * Returns the raw S3 object list entries.
 */
export async function listObjects(prefix: string): Promise<_Object[]> {
  const response = await s3Client.send(
    new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix }),
  );
  return response.Contents ?? [];
}
