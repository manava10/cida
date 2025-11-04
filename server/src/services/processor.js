import fs from 'fs';
import path from 'path';
import { Document } from '../models/Document.js';
import { Chunk } from '../models/Chunk.js';
import { extractTextFromFile } from './textExtractor.js';
import { chunkText } from './chunker.js';
import { generateEmbedding } from './embeddings.js';

export async function processDocument(documentId) {
  const doc = await Document.findById(documentId);
  if (!doc) throw new Error('document not found');
  try {
    doc.status = 'processing';
    await doc.save();
    const text = await extractTextFromFile(doc.originalPath, doc.mimeType);
    const chunks = chunkText(text);
    // Write raw text artifact
    const textPath = path.join(path.dirname(doc.originalPath), `${doc._id}-text.txt`);
    fs.writeFileSync(textPath, text, 'utf8');
    doc.textPath = textPath;
    await Chunk.deleteMany({ documentId: doc._id });
    const chunkDocs = chunks.map((t, idx) => ({
      documentId: doc._id,
      page: idx + 1,
      text: t,
      embedding: generateEmbedding(t)
    }));
    if (chunkDocs.length) await Chunk.insertMany(chunkDocs);
    doc.status = 'ready';
    doc.errorMessage = undefined;
    await doc.save();
    return { ok: true, chunks: chunkDocs.length };
  } catch (e) {
    doc.status = 'error';
    doc.errorMessage = e?.message || 'processing error';
    await doc.save();
    return { ok: false, error: doc.errorMessage };
  }
}


