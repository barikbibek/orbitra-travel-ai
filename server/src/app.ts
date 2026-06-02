import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { apiLimiter } from './middlewares/rateLimiter.middleware';

import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';
import itineraryRoutes from './routes/itinerary.routes';

const app = express();

//security headers
app.use(helmet());

const allowedOrigins = [env.CLIENT_URL, 'https://10xlab.online', 'http://10xlab.online', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// global rate limiter
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/itineraries', itineraryRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// global error handler, must be last
app.use(errorMiddleware);

export default app;