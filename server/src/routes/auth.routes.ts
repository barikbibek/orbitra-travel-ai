import { Router } from 'express';
import {
  register,
  login,
  logout,
  refresh,
  getMe,
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// strongly rate limited 
router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);

router.post('/refresh', refresh);

router.post('/logout', protect, logout);
router.get('/me',      protect, getMe);

export default router;