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
  // Increased limit to 100k chars to handle larger documents
  // For very long docs, take samples from beginning, middle, and end
  let textToSummarize = text;
  if (text.length > 100000) {
    const start = text.slice(0, 40000);
    const middle = text.slice(Math.floor(text.length / 2) - 20000, Math.floor(text.length / 2) + 20000);
    const end = text.slice(-40000);
    textToSummarize = `${start}\n\n[... middle section ...]\n\n${middle}\n\n[... end section ...]\n\n${end}`;
  } else {
    textToSummarize = text.slice(0, 100000);
  }
  const prompt = `Summarize the following document in about ${sentences} sentences. Be concise and factual. Cover the main points from throughout the document.\n\n` + textToSummarize;
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
  const prompt = `You are a helpful assistant answering questions based on a document. Use the provided document chunks to answer the question. 

If the chunks contain relevant information, provide a comprehensive answer based on that information. You can infer, summarize, or elaborate based on what's in the chunks. If the question asks for something specific that isn't directly stated, try to answer based on related information in the chunks.

Only say "I don't know" if the chunks contain absolutely no relevant information about the question.

Include brief quotes from the document and mention page numbers in parentheses when referencing specific information.

Question: ${question}

Document Chunks:
${contextText}

Answer:`;
  const res = await model.generateContent(prompt);
  const out = res.response?.text?.() || '';
  return { text: out.trim(), model: GEMINI_MODEL };
}


