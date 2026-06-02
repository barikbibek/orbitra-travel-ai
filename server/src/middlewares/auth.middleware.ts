import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

interface JwtPayload {
  userId: string;
  iat:    number;
  exp:    number;
}

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.access_token;

    if (!token) throw new AppError('Not authenticated', 401);

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Attach fresh user to request — catches deleted accounts
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) throw new AppError('User no longer exists', 401);

    req.user = user;
    next();
  }
);