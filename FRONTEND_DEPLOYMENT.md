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

### ⚠️ Important: Use Web Service (Not Static Site)

**Why Web Service?** Static Site deployment doesn't properly handle React Router client-side routing, causing 404 errors on routes like `/signin`, `/signup`, etc. The Web Service with `server.js` properly handles all routes.

### Option 1: Web Service (Recommended - Fixes 404 Issues)

1. **Create New Web Service on Render**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository

2. **Configure Build Settings**:
   - **Name**: `cida-client`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `client` ⚠️ **IMPORTANT: Set this to `client`**
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Auto-Deploy**: `Yes` (recommended)

3. **Environment Variables**:
   - `VITE_API_BASE`: Your backend API URL
     - Example: `https://cida-server.onrender.com`
     - **Important**: No trailing slash
   - `PORT`: Automatically set by Render (don't set manually)
   - `NODE_ENV`: `production` (optional, but recommended)

4. **Deploy**: Click "Create Web Service"

### Option 2: Using render.yaml (Advanced)

If you prefer Infrastructure as Code, you can use the provided `render.yaml` file:

1. **Create a Blueprint**:
   - Go to Render Dashboard → New → Blueprint
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Review and deploy both services

2. **Set Environment Variables**:
   - Still need to set secrets in Render dashboard:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `GOOGLE_API_KEY`
   - Other variables are automatically configured

### Option 3: Static Site (Not Recommended - Causes 404 Issues)

⚠️ **Static Site deployment will cause 404 errors on routes like `/signin`** because Render's static site hosting doesn't support client-side routing properly.

If you must use Static Site:
1. Use the `_redirects` file in `public/` folder (may not work on Render)
2. Consider using a different hosting service (Netlify, Vercel) that better supports SPAs
3. Or switch to Web Service (recommended)

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

### Issue: 404 on page refresh or direct URL access (e.g., `/signin`)
**Solution**: 
- **This is the most common issue!**
- Make sure you're using **Web Service** (not Static Site)
- Verify `Root Directory` is set to `client` in Render
- Verify `Start Command` is `npm start` (uses server.js)
- The `server.js` file handles client-side routing correctly
- Check Render logs to ensure server.js is running
- If using Static Site, switch to Web Service - Static Site doesn't properly support React Router

## Render Configuration Summary

### ✅ Web Service Configuration (Recommended):
```
Type: Web Service
Build Command: npm install && npm run build
Start Command: npm start
Root Directory: client
Runtime: Node
```

### ⚠️ Static Site Configuration (Not Recommended - Causes 404):
```
Type: Static Site
Build Command: npm install && npm run build
Publish Directory: dist
Root Directory: client
```

**Why Web Service?** The `server.js` file ensures all routes (like `/signin`, `/signup`) are properly handled by serving `index.html`, allowing React Router to handle client-side routing. Static Site deployment doesn't have this capability.

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

