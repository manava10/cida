import dotenv from 'dotenv';

let cached;
export function loadEnv() {
  if (cached) return cached;
  dotenv.config();
  const env = {
    PORT: process.env.PORT || 4000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cida',
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  };
  const usingDefault = !process.env.MONGODB_URI;
  // eslint-disable-next-line no-console
  console.log(
    `[env] cwd=${process.cwd()} MONGODB_URI=${usingDefault ? 'DEFAULT_LOCAL' : (env.MONGODB_URI.startsWith('mongodb+srv://') ? 'ATLAS_SRV' : 'CUSTOM')} PORT=${env.PORT} GOOGLE_API_KEY=${env.GOOGLE_API_KEY ? 'PRESENT' : 'EMPTY'} GEMINI_MODEL=${env.GEMINI_MODEL}`
  );
  cached = env;
  return env;
}


