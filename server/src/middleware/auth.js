import jwt from 'jsonwebtoken';
import { loadEnv } from '../config/env.js';

const { JWT_SECRET } = loadEnv();

export function issueJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function setAuthCookie(res, token, req) {
  // Detect production: Render always uses HTTPS, so if request is secure or NODE_ENV is production
  // For cross-origin (frontend on Vercel, backend on Render):
  // - sameSite: 'none' allows cross-origin cookies (requires secure: true)
  // - secure: true is required for sameSite: 'none' and for HTTPS
  // - Don't set domain - let browser handle it for cross-origin
  const isProd = process.env.NODE_ENV === 'production' || 
                 (req && (req.secure || req.get('x-forwarded-proto') === 'https'));
  const isLocalhost = req && (req.hostname === 'localhost' || req.hostname === '127.0.0.1');
  
  res.cookie('cida_token', token, {
    httpOnly: true,
    secure: isProd && !isLocalhost, // true in production (HTTPS required)
    sameSite: (isProd && !isLocalhost) ? 'none' : 'lax', // 'none' for cross-origin in prod, 'lax' for same-origin
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

export function clearAuthCookie(res, req) {
  const isProd = process.env.NODE_ENV === 'production' || 
                 (req && (req.secure || req.get('x-forwarded-proto') === 'https'));
  const isLocalhost = req && (req.hostname === 'localhost' || req.hostname === '127.0.0.1');
  
  res.clearCookie('cida_token', { 
    path: '/',
    secure: isProd && !isLocalhost,
    sameSite: (isProd && !isLocalhost) ? 'none' : 'lax'
  });
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.cida_token;
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.auth) return res.status(401).json({ error: 'unauthorized' });
    if (!roles.includes(req.auth.role)) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}


