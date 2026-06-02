import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { setAuthCookies, clearAuthCookies } from '../utils/setCookie';
import { env } from '../config/env';

// generates token first
const signAccessToken = (userId: string): string =>
  jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });

const signRefreshToken = (userId: string): string =>
  jwt.sign({ userId }, env.REFRESH_TOKEN_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as any });


export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError('Name, email and password are required', 400);
  }

  const exists = await User.findOne({ email });
  if (exists) throw new AppError('Email already registered', 409);

  const user = await User.create({ name, email, password });

  const accessToken  = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email },
  });
});


export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // explicitly select password cuz it's excluded by default
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid credentials', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid credentials', 401);

  const accessToken  = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// this is for refresh token
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refresh_token;
  if (!token) throw new AppError('No refresh token', 401);

  let decoded: any;
  try {
    decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.userId);
  if (!user) throw new AppError('User not found', 401);

  // rotate both tokens on every refresh
  const newAccessToken  = signAccessToken(user._id.toString());
  const newRefreshToken = signRefreshToken(user._id.toString());

  setAuthCookies(res, newAccessToken, newRefreshToken);

  res.json({ success: true });
});


export const logout = asyncHandler(async (req: Request, res: Response) => {
  clearAuthCookies(res);
  res.json({ success: true, message: 'Logged out successfully' });
});


export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    user: {
      id:    req.user!._id,
      name:  req.user!.name,
      email: req.user!.email,
    },
  });
});