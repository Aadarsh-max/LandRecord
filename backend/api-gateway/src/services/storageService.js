import { Client } from "minio";
import { randomUUID } from "crypto";

const isProduction = !!process.env.B2_ENDPOINT;

const minioClient = isProduction
  ? new Client({
      endPoint: process.env.B2_ENDPOINT,
      port: 443,
      useSSL: true,
      accessKey: process.env.B2_KEY_ID,
      secretKey: process.env.B2_APPLICATION_KEY,
      region: process.env.B2_REGION || "us-west-004"
    })
  : new Client({
      endPoint: (process.env.MINIO_ENDPOINT || "localhost:9000").split(":")[0],
      port: parseInt((process.env.MINIO_ENDPOINT || "localhost:9000").split(":")[1] || "9000", 10),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
      secretKey: process.env.MINIO_SECRET_KEY || "minioadmin"
    });

const BUCKET_NAME = process.env.MINIO_BUCKET || "land-records";
let bucketReady = false;

async function ensureBucket() {
  if (bucketReady) return;
  const exists = await minioClient.bucketExists(BUCKET_NAME).catch(() => false);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);
  }
  bucketReady = true;
}

export async function uploadDocumentFile(fileBuffer, originalFilename, mimeType) {
  await ensureBucket();
  const extension = originalFilename.split(".").pop();
  const objectKey = `documents/${randomUUID()}.${extension}`;

  await minioClient.putObject(BUCKET_NAME, objectKey, fileBuffer, fileBuffer.length, {
    "Content-Type": mimeType || "application/octet-stream"
  });

  return objectKey;
}

export async function getDocumentFileUrl(objectKey, expirySeconds = 3600) {
  return minioClient.presignedGetObject(BUCKET_NAME, objectKey, expirySeconds);
}