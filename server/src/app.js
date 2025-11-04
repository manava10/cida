import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { loadEnv } from './config/env.js';

const env = loadEnv();
const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 200
  })
);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// routes
import authRoutes from './routes/auth.js';
app.use('/api/auth', authRoutes);
import documentRoutes from './routes/documents.js';
app.use('/api/documents', documentRoutes);
import processingRoutes from './routes/processing.js';
app.use('/api', processingRoutes);
import searchRoutes from './routes/search.js';
app.use('/api/search', searchRoutes);
import aiRoutes from './routes/ai.js';
app.use('/api/ai', aiRoutes);

export default app;


