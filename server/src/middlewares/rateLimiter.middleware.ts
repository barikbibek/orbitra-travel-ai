import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Generic error response format
const handler = (req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
  });
};

// Strict — for auth routes (login/register)
// Prevents brute force attacks on passwords
export const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              10,              // 10 attempts per window
  standardHeaders:  true,           // return RateLimit-* headers
  legacyHeaders:    false,
  handler,
});

// Moderate — for upload + AI generation routes
// AI calls are expensive — prevent abuse
export const uploadLimiter = rateLimit({
  windowMs:         60 * 60 * 1000, // 1 hour
  max:              20,              // 20 uploads per hour
  standardHeaders:  true,
  legacyHeaders:    false,
  handler,
});

// General API — loose, just prevents hammering
export const apiLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              100,
  standardHeaders:  true,
  legacyHeaders:    false,
  handler,
});