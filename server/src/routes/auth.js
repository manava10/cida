import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { issueJwt, setAuthCookie, clearAuthCookie, requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const existing = await User.findOne({ email }).lean();
  if (existing) return res.status(409).json({ error: 'email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash, name, role: 'viewer' });
  const token = issueJwt({ userId: user._id.toString(), email: user.email, role: user.role });
  setAuthCookie(res, token);
  res.status(201).json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = issueJwt({ userId: user._id.toString(), email: user.email, role: user.role });
  setAuthCookie(res, token);
  res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

router.post('/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.auth.userId).lean();
  if (!user) return res.status(404).json({ error: 'not found' });
  res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

export default router;


