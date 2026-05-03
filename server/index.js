/**
 * VoteAI Backend Server
 * Express.js with Gemini AI, rate limiting, security middleware.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { chatRouter } from './routes/chat.js';
import { quizRouter } from './routes/quiz.js';
import { healthRouter } from './routes/health.js';
import { rateLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

/* Security */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com", "https://maps.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.googleapis.com", "https://*.gstatic.com", "https://*.googleusercontent.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://*.googleapis.com", "https://*.google.com", "https://firestore.googleapis.com", "https://*.firebaseio.com", "https://generativelanguage.googleapis.com", "wss://*.firebaseio.com"],
      frameSrc: ["'self'", "https://accounts.google.com", "https://*.firebaseapp.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || [
    'http://localhost:5173',
    'http://localhost:8080',
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400,
}));

/* Body parsing */
app.use(express.json({ limit: '1mb' }));

/* Serve static files from dist */
app.use(express.static(path.join(__dirname, '../dist')));

/* Rate limiting */
app.use('/api/', rateLimiter);

/* Routes */
app.use('/api', healthRouter);
app.use('/api', chatRouter);
app.use('/api', quizRouter);

/* Client-side routing catch-all */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

/* Error handler */
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ VoteAI server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Gemini: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️ No API key (fallback mode)'}`);
});

export default app;
