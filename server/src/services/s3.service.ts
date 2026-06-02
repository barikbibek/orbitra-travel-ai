import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

// Only initialise S3 client if credentials exist
const s3 = env.AWS_ACCESS_KEY_ID
  ? new S3Client({
      region: env.AWS_REGION!,
      credentials: {
        accessKeyId:     env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export const isS3Enabled = (): boolean => s3 !== null;

// Upload buffer directly to S3
export const uploadToS3 = async (
  buffer:      Buffer,
  key:         string,
  contentType: string
): Promise<string> => {
  if (!s3 || !env.AWS_BUCKET_NAME) {
    throw new AppError('S3 is not configured', 500);
  }

  await s3.send(new PutObjectCommand({
    Bucket:      env.AWS_BUCKET_NAME,
    Key:         key,
    Body:        buffer,
    ContentType: contentType,
  }));

  
  return `https://${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
};

export const getPresignedUrl = async (key: string): Promise<string> => {
  if (!s3 || !env.AWS_BUCKET_NAME) {
    throw new AppError('S3 is not configured', 500);
  }

  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.AWS_BUCKET_NAME, Key: key }),
    { expiresIn: 3600 }
  );
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  if (!s3 || !env.AWS_BUCKET_NAME) return;

  await s3.send(new DeleteObjectCommand({
    Bucket: env.AWS_BUCKET_NAME,
    Key:    key,
  }));
};