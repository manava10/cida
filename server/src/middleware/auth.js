import jwt from 'jsonwebtoken';
import { loadEnv } from '../config/env.js';

const { JWT_SECRET } = loadEnv();

export function issueJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('cida_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookie(res) {
  res.clearCookie('cida_token', { path: '/' });
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


