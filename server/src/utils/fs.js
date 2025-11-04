import fs from 'fs';
import path from 'path';

export function ensureDir(dirPath) {
  const abs = path.resolve(dirPath);
  if (!fs.existsSync(abs)) {
    fs.mkdirSync(abs, { recursive: true });
  }
  return abs;
}


