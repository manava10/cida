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

// Verify dist directory exists
if (!existsSync(distPath)) {
  console.error(`ERROR: dist directory not found at ${distPath}`);
  console.error('Make sure you run "npm run build" before starting the server');
  process.exit(1);
}

if (!existsSync(indexPath)) {
  console.error(`ERROR: index.html not found at ${indexPath}`);
  console.error('Make sure you run "npm run build" before starting the server');
  process.exit(1);
}

console.log(`✓ Dist directory found: ${distPath}`);
console.log(`✓ Index file found: ${indexPath}`);

// Serve static files from the dist directory (assets, images, etc.)
// This must come before the catch-all route
app.use(express.static(distPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', distPath, indexPath });
});

// Handle client-side routing - serve index.html for all routes
// This ensures React Router handles all routes like /signin, /signup, /app, etc.
app.get('*', (req, res) => {
  // Always serve index.html for any route that doesn't match a static file
  // Express static middleware will have already handled file requests
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      if (!res.headersSent) {
        res.status(500).send('Internal server error');
      }
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${distPath}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});

