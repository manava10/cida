import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Local development port (default 5173)
    // This only affects 'npm run dev' - local development unchanged
    port: 5173,
    host: true // Allow external connections (for network access if needed)
  },
  preview: {
    // Preview server port (for 'npm run preview' - local testing)
    // This is only for local preview, not used in production
    port: 5173,
    host: true
  },
  build: {
    // Production build settings
    // These settings only affect the build output, not local dev
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})


