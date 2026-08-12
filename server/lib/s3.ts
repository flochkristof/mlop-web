import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env"; // Import the validated env

const credentials = {
  accessKeyId: env.STORAGE_ACCESS_KEY_ID,
  secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
};
const forcePathStyle = env.STORAGE_PUBLIC_ENDPOINT !== undefined;

// Use the internal endpoint for server-side storage operations.
const s3Client = new S3Client({
  region: "auto",
  endpoint: env.STORAGE_ENDPOINT,
  credentials,
  forcePathStyle,
});

// Presigned URLs need an endpoint that is reachable by the browser.
const publicS3Client = new S3Client({
  region: "auto",
  endpoint: env.STORAGE_PUBLIC_ENDPOINT ?? env.STORAGE_ENDPOINT,
  credentials,
  forcePathStyle,
});

/**
 * Generates a presigned URL for viewing an R2 image
 * @param key - The object key (path) in the bucket
 * @param expiresIn - URL expiration time in seconds (default: 5 days)
 * @returns Promise<string> - The presigned URL
 */
async function getS3Url(
  key: string,
  expiresIn: number = 3600 * 24 * 5
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: env.STORAGE_BUCKET,
      Key: key,
    });

    const signedUrl = await getSignedUrl(publicS3Client, command, {
      expiresIn: expiresIn,
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating R2 presigned URL:", error);
    throw new Error("Failed to generate R2 image URL");
  }
}

export const getImageUrl = async (
  tenantId: string,
  projectName: string,
  runId: number,
  logName: string,
  fileName: string
) => {
  const key = `${tenantId}/${projectName}/${runId}/${logName}/${fileName}`;
  return await getS3Url(key);
};

/**
 * Deletes every object stored under a run, i.e. all keys prefixed with
 * `${tenantId}/${projectName}/${runId}/` (see getImageUrl for the key layout).
 * @returns the number of objects deleted
 */
export const deleteRunFiles = async (
  tenantId: string,
  projectName: string,
  runId: number | bigint
) => {
  const prefix = `${tenantId}/${projectName}/${runId}/`;
  let continuationToken: string | undefined = undefined;
  let deleted = 0;

  do {
    const listed: ListObjectsV2CommandOutput = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: env.STORAGE_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    const objects = (listed.Contents ?? [])
      .map((object) => object.Key)
      .filter((key): key is string => !!key)
      .map((key) => ({ Key: key }));

    if (objects.length > 0) {
      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: env.STORAGE_BUCKET,
          Delete: { Objects: objects, Quiet: true },
        })
      );
      deleted += objects.length;
    }

    continuationToken = listed.IsTruncated
      ? listed.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return deleted;
};

export async function uploadFileToR2(
  key: string,
  buffer: Buffer
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: env.STORAGE_BUCKET,
    Key: key,
    Body: buffer,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("Error uploading file to R2:", error);
    throw new Error("Failed to upload file to R2");
  }
}
