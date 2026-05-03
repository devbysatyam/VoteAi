/**
 * Vercel Serverless API — wraps the Express server for Vercel deployment.
 * Handles /api/* routes as a single serverless function.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { chatRouter } from '../server/routes/chat.js';
import { quizRouter } from '../server/routes/quiz.js';
import { healthRouter } from '../server/routes/health.js';
import { rateLimiter } from '../server/middleware/rateLimit.js';
import { errorHandler } from '../server/middleware/errorHandler.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api/', rateLimiter);
app.use('/api', healthRouter);
app.use('/api', chatRouter);
app.use('/api', quizRouter);
app.use(errorHandler);

export default app;
