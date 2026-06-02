import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { AppError } from '../utils/AppError';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Filter — reject unsupported file types early
const fileFilter = (
  req:  Request,
  file: Express.Multer.File,
  cb:   FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDFs and images are allowed', 400) as any, false);
  }
};

// Memory storage — we stream directly to S3
// If S3 env vars absent, swap to diskStorage below
export const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

// For local fallback (no S3)
// export const upload = multer({
//   storage: multer.diskStorage({
//     destination: 'uploads/',
//     filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
//   }),
//   limits:  { fileSize: MAX_FILE_SIZE },
//   fileFilter,
// });