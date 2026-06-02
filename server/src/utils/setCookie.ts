import { Response } from 'express';
import { env } from '../config/env';

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  const isProd = env.NODE_ENV === 'production';

  res.cookie('access_token', accessToken, {
    httpOnly: true,             // XSS protection
    secure:   isProd,           // HTTPS only in production
    sameSite: 'strict',         // CSRF protection
    maxAge:   15 * 60 * 1000,   // 15 minutes
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
    path:     '/api/auth/refresh',  // only sent to refresh endpoint
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
};