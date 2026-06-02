import { Router } from 'express';
import { uploadDocuments } from '../controllers/upload.controller';
import { protect } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { uploadLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// auth first, then rate limit, then parse files
router.post(
  '/',
  protect,
  uploadLimiter,
  upload.array('documents', 5), 
  uploadDocuments
);

export default router;