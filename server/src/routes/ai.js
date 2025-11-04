import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import { Document } from '../models/Document.js';
import { Chunk } from '../models/Chunk.js';
import { generateEmbedding } from '../services/embeddings.js';
import { cosineSimilarity } from '../utils/math.js';
import { geminiSummarize, geminiAnswer } from '../services/gemini.js';

const router = Router();

async function loadDocIfAllowed(user, docId) {
  if (!mongoose.Types.ObjectId.isValid(docId)) return null;
  const doc = await Document.findById(docId).lean();
  if (!doc) return null;
  if (user.role !== 'admin' && doc.ownerId.toString() !== user.userId) return null;
  return doc;
}

router.post('/summary', requireAuth, async (req, res) => {
  try {
    const { documentId, sentences = 3 } = req.body || {};
    const { format } = req.query || {};
    const doc = await loadDocIfAllowed(req.auth, documentId);
    if (!doc) return res.status(404).json({ error: 'not found' });
    const chunks = await Chunk.find({ documentId: doc._id }).sort({ page: 1 }).lean();
    const text = chunks.map((c) => c.text).join('\n');
    let llm = null;
    try {
      llm = await geminiSummarize(text, sentences);
    } catch {}
    if (llm && llm.text && llm.text.length > 0) {
      // eslint-disable-next-line no-console
      console.log('[ai] summary using gemini');
      if (format === 'markdown') {
        const md = `### Summary (model: ${llm.model})\n\n${llm.text}`;
        return res.json({ documentId, summaryMarkdown: md, model: llm.model });
      }
      return res.json({ documentId, summary: llm.text, model: llm.model });
    }
    const sents = text.replace(/\n+/g, ' ').split(/(?<=[\.!?])\s+/).filter(Boolean).slice(0, Math.max(1, Math.min(10, Number(sentences) || 3)));
    const summary = sents.join(' ');
    // eslint-disable-next-line no-console
    console.log('[ai] summary using fallback');
    if (format === 'markdown') {
      const md = `### Summary (model: fallback)\n\n${summary}`;
      return res.json({ documentId, summaryMarkdown: md, model: 'fallback' });
    }
    res.json({ documentId, summary, model: 'fallback' });
  } catch (e) {
    res.status(500).json({ error: 'summary failed' });
  }
});

router.post('/qa', requireAuth, async (req, res) => {
  try {
    const { documentId, question, topK = 3 } = req.body || {};
    const { format } = req.query || {};
    if (!question) return res.status(400).json({ error: 'question required' });
    const doc = await loadDocIfAllowed(req.auth, documentId);
    if (!doc) return res.status(404).json({ error: 'not found' });
    const chunks = await Chunk.find({ documentId: doc._id }).lean();
    const qVec = generateEmbedding(question);
    const scored = chunks.map((c) => ({ c, score: cosineSimilarity(qVec, c.embedding || []) }));
    scored.sort((a, b) => b.score - a.score);
    const picked = scored.slice(0, Math.max(1, Math.min(10, Number(topK) || 3)));
    const contexts = picked.map((p) => ({ text: p.c.text, page: p.c.page, score: Number(p.score.toFixed(4)) }));
    let llm = null;
    try {
      llm = await geminiAnswer(question, contexts);
    } catch {}
    if (llm && llm.text && llm.text.length > 0) {
      // eslint-disable-next-line no-console
      console.log('[ai] qa using gemini');
      const citations = picked.map((p) => ({ chunkId: p.c._id, page: p.c.page, score: Number(p.score.toFixed(4)) }));
      if (format === 'markdown') {
        const bullets = `\n\n#### Citations\n` + citations.map(c => `- Page ${c.page} (score ${c.score})`).join('\n');
        const md = `### Answer (model: ${llm.model})\n\n${llm.text}${bullets}`;
        return res.json({ documentId, question, answerMarkdown: md, citations, model: llm.model });
      }
      return res.json({ documentId, question, answer: llm.text, citations, model: llm.model });
    }
    const answer = picked.map((p) => p.c.text).join('\n\n');
    const citations = picked.map((p) => ({ chunkId: p.c._id, page: p.c.page, score: Number(p.score.toFixed(4)) }));
    // eslint-disable-next-line no-console
    console.log('[ai] qa using fallback');
    if (format === 'markdown') {
      const bullets = `\n\n#### Citations\n` + citations.map(c => `- Page ${c.page} (score ${c.score})`).join('\n');
      const md = `### Answer (model: fallback)\n\n${answer}${bullets}`;
      return res.json({ documentId, question, answerMarkdown: md, citations, model: 'fallback' });
    }
    res.json({ documentId, question, answer, citations, model: 'fallback' });
  } catch (e) {
    res.status(500).json({ error: 'qa failed' });
  }
});

export default router;


