import { Client } from 'minio';

// Initialize MinIO client
const minioClient = new Client({
  endPoint: '192.168.140.3',
  port: 9000,
  useSSL: false,
  accessKey: 'picture-picker-dev-runtime',
  secretKey: 'picture-picker-dev-pass'
});

const BUCKET_NAME = 'picture-picker-dev';

// Ensure bucket exists
export async function ensureBucketExists() {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    throw new Error(`Bucket ${BUCKET_NAME} does not exist`);
  }
}

// Upload file to MinIO
export async function uploadFile(file: Buffer, fileName: string, contentType: string) {
  await ensureBucketExists();
  
  const objectName = `${Date.now()}-${fileName}`;
  await minioClient.putObject(
    BUCKET_NAME,
    objectName,
    file,
    file.length,
    { 'Content-Type': contentType }
  );

  return {
    url: `http://192.168.140.3:9000/${BUCKET_NAME}/${objectName}`,
    objectName
  };
}

// Delete file from MinIO
export async function deleteFile(objectName: string) {
  await minioClient.removeObject(BUCKET_NAME, objectName);
}

// Get file URL
export function getFileUrl(objectName: string) {
  return `http://192.168.140.3:9000/${BUCKET_NAME}/${objectName}`;
} 