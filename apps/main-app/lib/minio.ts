import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'hr-manager-uploads';

export async function ensureBucketExists() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME);
      console.log(`Bucket ${BUCKET_NAME} created successfully`);
    }
  } catch (error) {
    console.error('Error checking/creating bucket:', error);
    throw error;
  }
}

export async function uploadFile(file: Buffer, fileName: string, contentType: string) {
  try {
    await ensureBucketExists();
    
    const metaData = {
      'Content-Type': contentType,
      'X-Amz-Meta-Upload-Date': new Date().toISOString()
    };
    
    await minioClient.putObject(BUCKET_NAME, fileName, file, file.length, metaData);
    
    return {
      fileName,
      storageUrl: `/api/uploads/${fileName}`,
      mimeType: contentType,
      sizeBytes: file.length
    };
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw error;
  }
}

export async function deleteFile(fileName: string) {
  try {
    await minioClient.removeObject(BUCKET_NAME, fileName);
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    throw error;
  }
}

export async function getFileStream(fileName: string) {
  try {
    return await minioClient.getObject(BUCKET_NAME, fileName);
  } catch (error) {
    console.error('Error getting file from MinIO:', error);
    throw error;
  }
}

export { minioClient, BUCKET_NAME };