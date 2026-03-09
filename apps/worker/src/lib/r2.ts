/**
 * R2 upload helpers.
 *
 * Cloudflare R2 does not natively support presigned URLs via the Workers binding
 * (only via S3-compatible API). This module handles direct uploads through the Worker
 * and generates the object key for the stored file.
 */

/** Generate a scoped R2 key for a response file upload */
export function generateR2Key(
  tenantId: string,
  formId: string,
  responseId: string,
  filename: string
): string {
  const ext = filename.split(".").pop() ?? "bin";
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `uploads/${tenantId}/${formId}/${responseId}/${Date.now()}_${safeFilename}`;
}

/** Upload a file buffer to R2 */
export async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  body: ArrayBuffer,
  contentType: string
): Promise<R2Object> {
  return bucket.put(key, body, {
    httpMetadata: { contentType },
  });
}

/** Get a public (or private) URL for an R2 object.
 *  For private buckets, serve through the Worker. */
export function getR2Url(
  key: string,
  workerBaseUrl: string
): string {
  return `${workerBaseUrl}/api/public/files/${encodeURIComponent(key)}`;
}

/** Delete an object from R2 */
export async function deleteFromR2(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}
