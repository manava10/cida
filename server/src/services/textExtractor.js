import fs from 'fs';
import pdfParse from 'pdf-parse';

export async function extractTextFromFile(filePath, mimeType) {
  if (!mimeType) mimeType = 'application/octet-stream';
  if (mimeType === 'text/plain') {
    return fs.readFileSync(filePath, 'utf8');
  }
  if (mimeType === 'application/pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const result = await pdfParse(dataBuffer);
    return result.text || '';
  }
  // Fallback: try read as utf8; if fails, return empty
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}


