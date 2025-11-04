// Placeholder embedding: hash characters into fixed-size vector for demo search.
export function generateEmbedding(text, dims = 64) {
  const vec = new Array(dims).fill(0);
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    const idx = c % dims;
    vec[idx] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0)) || 1;
  return vec.map((x) => x / norm);
}


