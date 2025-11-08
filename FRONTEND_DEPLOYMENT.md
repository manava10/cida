# Frontend Deployment Guide - Render.com

This guide explains how to deploy the CIDA frontend to Render.com while keeping local development unchanged.

## Overview

The frontend is now configured to work in both environments:
- **Local Development**: Uses port 5173 (unchanged)
- **Production Deployment**: Uses PORT environment variable from Render (automatically set)

## Configuration Changes

### 1. Vite Configuration (`client/vite.config.js`)
- **Local dev server**: Port 5173 (unchanged)
- **Preview server**: Port 5173 (for local testing)
- **Production build**: Outputs to `dist/` directory

### 2. Production Server (`client/server.js`)
- Simple Express server to serve static files
- Reads `PORT` from environment variable (Render sets this automatically)
- Falls back to 5173 if PORT is not set (for local testing)

### 3. Package.json Scripts
- `npm run dev`: Local development (port 5173)
- `npm run build`: Build for production
- `npm start`: Start production server (uses PORT env variable)

## Deployment Steps on Render

### Option 1: Static Site (Recommended - Free Tier)

1. **Create New Static Site on Render**
   - Go to Render Dashboard → New → Static Site
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - **Name**: `cida-client` (or your preferred name)
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `client` (important!)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Environment Variables** (if needed):
   - `VITE_API_BASE`: Your backend API URL
     - Example: `https://cida-server.onrender.com`
     - Or: `https://your-backend-url.onrender.com`

4. **Deploy**: Click "Create Static Site"

### Option 2: Web Service (More Control)

1. **Create New Web Service on Render**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - **Name**: `cida-client`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. **Environment Variables**:
   - `VITE_API_BASE`: Your backend API URL
     - Example: `https://cida-server.onrender.com`
   - `PORT`: Automatically set by Render (don't set manually)

4. **Deploy**: Click "Create Web Service"

## Environment Variables

### Required for Production:
- `VITE_API_BASE`: Backend API URL
  - Format: `https://your-backend-url.onrender.com`
  - No trailing slash
  - Must match your backend's CORS configuration

### Local Development:
- Create `client/.env` file (optional):
  ```
  VITE_API_BASE=http://localhost:4000
  ```
- If not set, defaults to `http://localhost:4000`

## Backend CORS Configuration

Make sure your backend's `CLIENT_ORIGIN` environment variable includes your frontend URL:

```env
CLIENT_ORIGIN=https://cida-client.onrender.com
```

Or if you have multiple origins:
```env
CLIENT_ORIGIN=https://cida-client.onrender.com,http://localhost:5173
```

## Testing Deployment

### 1. Test Build Locally:
```bash
cd client
npm run build
npm start
# Should start on port 5173 (or PORT if set)
```

### 2. Test with Production API:
```bash
cd client
VITE_API_BASE=https://your-backend-url.onrender.com npm run build
npm start
```

## Local Development (Unchanged)

Your local development workflow remains the same:

```bash
cd client
npm run dev
# Starts on http://localhost:5173
# Connects to http://localhost:4000 (backend)
```

## Troubleshooting

### Issue: Frontend can't connect to backend
**Solution**: 
- Check `VITE_API_BASE` environment variable is set correctly
- Verify backend CORS allows your frontend URL
- Check backend is running and accessible

### Issue: Port already in use
**Solution**: 
- Local dev: Change port in `vite.config.js` server.port
- Production: Render automatically handles PORT

### Issue: Build fails
**Solution**:
- Make sure `Root Directory` is set to `client` in Render
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`

### Issue: 404 on page refresh (client-side routing)
**Solution**: 
- Make sure you're using Web Service option (not Static Site)
- The `server.js` handles client-side routing correctly
- For Static Site, you may need to configure redirects in Render

## Render Configuration Summary

### Static Site Configuration:
```
Build Command: npm install && npm run build
Publish Directory: dist
Root Directory: client
```

### Web Service Configuration:
```
Build Command: npm install && npm run build
Start Command: npm start
Root Directory: client
```

## Notes

1. **Local development is unaffected**: Port 5173 is still used for `npm run dev`
2. **Production uses Render's PORT**: Automatically handled by `server.js`
3. **Environment variables**: Set `VITE_API_BASE` in Render dashboard
4. **Build output**: Always goes to `dist/` directory
5. **CORS**: Backend must allow your frontend URL in `CLIENT_ORIGIN`

## Next Steps

1. Deploy backend first (if not already deployed)
2. Get backend URL from Render
3. Deploy frontend with `VITE_API_BASE` set to backend URL
4. Update backend's `CLIENT_ORIGIN` to include frontend URL
5. Test the full stack

---

**Local Development**: `npm run dev` → http://localhost:5173
**Production**: Render automatically handles port and serves your app

