import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadEnv } from '../config/env.js';

let client;
function getClient() {
  const { GOOGLE_API_KEY } = loadEnv();
  if (!GOOGLE_API_KEY) return null;
  if (!client) client = new GoogleGenerativeAI(GOOGLE_API_KEY);
  return client;
}

export async function geminiSummarize(text, sentences = 4) {
  const c = getClient();
  if (!c) return null;
  const { GEMINI_MODEL } = loadEnv();
  const model = c.getGenerativeModel({ model: GEMINI_MODEL });
  const prompt = `Summarize the following document in about ${sentences} sentences. Be concise and factual.\n\n` + text.slice(0, 5000);
  const res = await model.generateContent(prompt);
  const out = res.response?.text?.() || '';
  return { text: out.trim(), model: GEMINI_MODEL };
}

export async function geminiAnswer(question, contexts) {
  const c = getClient();
  if (!c) return null;
  const { GEMINI_MODEL } = loadEnv();
  const model = c.getGenerativeModel({ model: GEMINI_MODEL });
  const contextText = contexts
    .map((c, i) => `[[chunk ${i + 1} page=${c.page} score=${c.score}]]\n${c.text}`)
    .join('\n\n');
  const prompt = `You are a helpful assistant. Answer the question using ONLY the provided chunks. If unsure, say you don't know. Include brief quotes and mention the page numbers in parentheses.\n\nQuestion: ${question}\n\nChunks:\n${contextText}`;
  const res = await model.generateContent(prompt);
  const out = res.response?.text?.() || '';
  return { text: out.trim(), model: GEMINI_MODEL };
}


