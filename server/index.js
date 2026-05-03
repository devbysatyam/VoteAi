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

const app = express();
const PORT = process.env.PORT || 3001;

/* Security */
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));

/* Body parsing */
app.use(express.json({ limit: '1mb' }));

/* Rate limiting */
app.use('/api/', rateLimiter);

/* Routes */
app.use('/api', healthRouter);
app.use('/api', chatRouter);
app.use('/api', quizRouter);

/* Error handler */
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ VoteAI server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Gemini: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️ No API key (fallback mode)'}`);
});

export default app;
