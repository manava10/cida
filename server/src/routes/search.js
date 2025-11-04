import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Chunk } from '../models/Chunk.js';
import { Document } from '../models/Document.js';
import { generateEmbedding } from '../services/embeddings.js';
import { cosineSimilarity } from '../utils/math.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const q = (req.query.q || '').toString().trim();
  const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
  if (!q) return res.status(400).json({ error: 'missing q' });

  // fetch candidate chunks (basic keyword filter to reduce set)
  const keywordFilter = { text: { $regex: q.split(/\s+/).join('|'), $options: 'i' } };
  const candidates = await Chunk.find(keywordFilter).limit(500).lean();

  const qVec = generateEmbedding(q);
  const scored = candidates.map((c) => ({
    chunk: c,
    score: cosineSimilarity(qVec, c.embedding || [])
  }));

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit);

  // hydrate docs and apply simple access: admin can see all; viewers only their own
  const docIds = [...new Set(top.map((s) => s.chunk.documentId.toString()))];
  const docs = await Document.find({ _id: { $in: docIds } }).lean();
  const idToDoc = new Map(docs.map((d) => [d._id.toString(), d]));

  const results = [];
  for (const s of top) {
    const d = idToDoc.get(s.chunk.documentId.toString());
    if (!d) continue;
    if (req.auth.role !== 'admin' && d.ownerId.toString() !== req.auth.userId) continue;
    const snippet = s.chunk.text.slice(0, 300);
    results.push({
      documentId: d._id,
      title: d.title,
      chunkId: s.chunk._id,
      page: s.chunk.page,
      score: Number(s.score.toFixed(4)),
      snippet
    });
  }

  res.json({ q, count: results.length, results });
});

export default router;


