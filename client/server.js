// Simple production server for serving Vite-built static files
// Used for deployment platforms like Render
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5173;
const distPath = join(__dirname, 'dist');
const indexPath = join(distPath, 'index.html');

// Serve static files from the dist directory (assets, images, etc.)
app.use(express.static(distPath, {
  // Don't redirect, just serve files
  index: false
}));

// Handle client-side routing - serve index.html for all non-file routes
// This ensures React Router handles all routes like /signin, /signup, etc.
app.get('*', (req, res, next) => {
  // Check if the request is for a file (has extension)
  const hasExtension = /\.[^/]+$/.test(req.path);
  
  // If it's a file request and file doesn't exist, continue to 404
  if (hasExtension) {
    const filePath = join(distPath, req.path);
    if (!existsSync(filePath)) {
      return res.status(404).send('File not found');
    }
  }
  
  // For all other routes (like /signin, /signup, /app, etc.), serve index.html
  // This allows React Router to handle the routing client-side
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Internal server error');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving files from: ${distPath}`);
});

