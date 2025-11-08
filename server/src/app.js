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

// CORS configuration - support multiple origins (production + Vercel preview deployments)
const allowedOrigins = env.CLIENT_ORIGIN 
  ? env.CLIENT_ORIGIN.split(',').map(origin => origin.trim().replace(/\/$/, ''))
  : ['http://localhost:5173'];

app.use(
  helmet({
    frameguard: false,
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "frame-ancestors": ["'self'", ...allowedOrigins, "*.vercel.app"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.some(allowed => origin === allowed || origin.startsWith(allowed))) {
      return callback(null, true);
    }
    
    // Allow Vercel preview deployments (pattern: *.vercel.app)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Allow localhost for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true 
}));
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
app.get("/", (req, res) => {
  res.send("Server is running!");
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


