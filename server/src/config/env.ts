import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT:                z.string().default('5000'),
    NODE_ENV:            z.enum(['development', 'production', 'test']).default('development'),

    MONGODB_URI:         z.string().min(1, 'MONGODB_URI is required'),
    REDIS_URL: z.string().default('redis://localhost:6379'),

    JWT_SECRET:          z.string().min(32, 'JWT_SECRET must be a strong secret'),
    JWT_EXPIRES_IN:      z.string().default('15m'),
    REFRESH_TOKEN_SECRET: z.string().min(32, 'REFRESH_TOKEN_SECRET must be a strong and long secret'),
    REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),

    AWS_ACCESS_KEY_ID:     z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION:            z.string().optional(),
    AWS_BUCKET_NAME:       z.string().optional(),

    GEMINI_API_KEY:      z.string().min(1, 'GEMINI_API_KEY is required'),

    CLIENT_URL:          z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  process.exit(1);  // crash early
}

export const env = parsed.data;