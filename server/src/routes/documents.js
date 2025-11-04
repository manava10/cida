import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import mime from 'mime-types';
import { loadEnv } from '../config/env.js';
import { ensureDir } from '../utils/fs.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Document } from '../models/Document.js';
import { AuditEvent } from '../models/AuditEvent.js';
import { processDocument } from '../services/processor.js';
import mongoose from 'mongoose';

const env = loadEnv();
ensureDir(env.UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, env.UPLOAD_DIR);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname) || `.${mime.extension(file.mimetype) || 'bin'}`;
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('unsupported file type'));
  }
});

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const { page = '1', limit = '20', q } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const filter = {};
    if (req.auth.role !== 'admin') {
      filter.ownerId = req.auth.userId;
    }
    if (q) {
      filter.title = { $regex: q.toString(), $options: 'i' };
    }
    const total = await Document.countDocuments(filter);
    const docs = await Document.find(filter)
      .sort({ updatedAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();
    res.json({ page: pageNum, limit: pageSize, total, documents: docs });
  } catch (e) {
    res.status(500).json({ error: 'failed to list documents' });
  }
});

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'file required' });
    const checksum = crypto.createHash('sha256').update(fs.readFileSync(file.path)).digest('hex');
    const doc = await Document.create({
      workspaceId: req.body.workspaceId || req.auth.userId, // placeholder until workspace UI
      ownerId: req.auth.userId,
      title: req.body.title || file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      checksum,
      status: 'uploaded',
      originalPath: file.path
    });
    await AuditEvent.create({
      actorId: req.auth.userId,
      action: 'document.upload',
      resourceType: 'document',
      resourceId: doc._id.toString(),
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    // fire-and-forget processing
    setImmediate(() => {
      processDocument(doc._id).catch(() => {});
    });
    res.status(201).json({ document: { id: doc._id, title: doc.title, status: doc.status } });
  } catch (e) {
    res.status(500).json({ error: 'upload failed' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'invalid document id' });
    }
    const doc = await Document.findById(id).lean();
    if (!doc) return res.status(404).json({ error: 'not found' });
    if (req.auth.role !== 'admin' && doc.ownerId.toString() !== req.auth.userId) {
      return res.status(403).json({ error: 'forbidden' });
    }
    res.json({ document: doc });
  } catch (e) {
    res.status(500).json({ error: 'failed to fetch document' });
  }
});

export default router;


