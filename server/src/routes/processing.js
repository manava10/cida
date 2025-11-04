import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { processDocument } from '../services/processor.js';

const router = Router();

router.post('/documents/:id/process', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'invalid document id' });
    }
    const result = await processDocument(id);
    if (!result.ok) return res.status(500).json(result);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'processing failed' });
  }
});

export default router;


