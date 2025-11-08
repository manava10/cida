# Render Deployment Troubleshooting Guide

## Issue: 404 NOT_FOUND Error

If you're getting `404: NOT_FOUND` errors when accessing routes like `/signin`, follow these steps:

## ✅ Step 1: Verify Render Configuration

### Check Your Web Service Settings:

1. **Go to Render Dashboard** → Your Frontend Service → Settings

2. **Verify these settings are EXACTLY as shown:**

   ```
   Type: Web Service (NOT Static Site!)
   Root Directory: client
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Critical Settings:**
   - ✅ **Root Directory MUST be**: `client` (not empty, not `/client`, just `client`)
   - ✅ **Build Command MUST be**: `npm install && npm run build`
   - ✅ **Start Command MUST be**: `npm start` (this runs server.js)
   - ✅ **Type MUST be**: Web Service (not Static Site)

## ✅ Step 2: Check Build Logs

1. **Go to Render Dashboard** → Your Frontend Service → Logs
2. **Look for these in the build logs:**
   - ✅ `vite v5.x.x building for production...`
   - ✅ `✓ built in XXXms`
   - ✅ Should see `dist/index.html` and `dist/assets/` files created

3. **If build fails:**
   - Check Node.js version (should be 18+ or 20+)
   - Verify all dependencies are in package.json
   - Check for any build errors

## ✅ Step 3: Check Runtime Logs

1. **Go to Render Dashboard** → Your Frontend Service → Logs
2. **Look for these messages when server starts:**
   - ✅ `✓ Dist directory found: /opt/render/project/src/client/dist`
   - ✅ `✓ Index file found: /opt/render/project/src/client/dist/index.html`
   - ✅ `🚀 Server running on port XXXX`
   - ✅ `📁 Serving files from: /opt/render/project/src/client/dist`

3. **If you see errors:**
   - ❌ `ERROR: dist directory not found` → Build didn't complete
   - ❌ `ERROR: index.html not found` → Build failed or wrong path
   - ❌ `Cannot find module 'express'` → Dependencies not installed

## ✅ Step 4: Verify File Structure on Render

The server.js expects this structure:
```
client/
  ├── server.js          ← Server file
  ├── package.json       ← Dependencies
  ├── dist/              ← Build output (created by npm run build)
  │   ├── index.html
  │   └── assets/
  └── ...
```

## ✅ Step 5: Test Health Endpoint

1. **Visit**: `https://your-app.onrender.com/health`
2. **Should return JSON:**
   ```json
   {
     "status": "ok",
     "distPath": "/opt/render/project/src/client/dist",
     "indexPath": "/opt/render/project/src/client/dist/index.html"
   }
   ```
3. **If this works**, the server is running correctly
4. **If this fails**, check the logs for errors

## ✅ Step 6: Common Issues and Fixes

### Issue 1: Root Directory Not Set
**Symptom**: Server can't find files, 404 on all routes
**Fix**: Set Root Directory to `client` in Render settings

### Issue 2: Build Command Wrong
**Symptom**: No dist folder created
**Fix**: Build Command must be `npm install && npm run build`

### Issue 3: Start Command Wrong
**Symptom**: Server doesn't start, or wrong server starts
**Fix**: Start Command must be `npm start` (runs server.js)

### Issue 4: Static Site Instead of Web Service
**Symptom**: 404 on all routes except `/`
**Fix**: Delete Static Site, create new Web Service

### Issue 5: Dependencies Not Installed
**Symptom**: `Cannot find module 'express'` in logs
**Fix**: Make sure `express` is in `dependencies` (not `devDependencies`)

### Issue 6: Wrong Working Directory
**Symptom**: Server can't find dist folder
**Fix**: Verify Root Directory is `client` and server.js is in client/

## ✅ Step 7: Manual Verification

### Test locally first:
```bash
cd client
npm install
npm run build
npm start
# Visit http://localhost:5173/signin
# Should work without 404
```

### If local works but Render doesn't:
1. Check Render logs for differences
2. Verify environment variables
3. Check Node.js version on Render
4. Verify Root Directory is set correctly

## ✅ Step 8: Re-deploy

After fixing configuration:

1. **Manual Deploy**:
   - Go to Render Dashboard → Your Service → Manual Deploy
   - Click "Clear build cache & deploy"

2. **Or Push to GitHub**:
   - Make sure all changes are committed
   - Push to your repository
   - Render will auto-deploy

## ✅ Step 9: Verify Routes Work

After deployment, test these URLs:
- ✅ `https://your-app.onrender.com/` → Should show landing page
- ✅ `https://your-app.onrender.com/signin` → Should show signin page
- ✅ `https://your-app.onrender.com/signup` → Should show signup page
- ✅ `https://your-app.onrender.com/app` → Should redirect or show dashboard (if authenticated)
- ✅ `https://your-app.onrender.com/health` → Should return JSON status

## 🔍 Debugging Checklist

- [ ] Root Directory set to `client`
- [ ] Type is Web Service (not Static Site)
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Build logs show successful build
- [ ] Runtime logs show server started
- [ ] Health endpoint returns OK
- [ ] Express is in dependencies (not devDependencies)
- [ ] server.js exists in client/ directory
- [ ] dist/ folder is created during build
- [ ] Environment variables are set (VITE_API_BASE)

## 📞 Still Having Issues?

1. **Check Render Logs**: Look for error messages
2. **Test Health Endpoint**: `/health` should work
3. **Verify Build Output**: Check if dist/ folder exists
4. **Compare with Working Setup**: Verify all settings match this guide
5. **Clear Build Cache**: Try "Clear build cache & deploy" in Render

## 🎯 Quick Fix Command

If you want to quickly verify your setup, check these in Render:

```
Root Directory: client
Build Command: npm install && npm run build  
Start Command: npm start
Type: Web Service
```

If all of these are correct and you're still getting 404, check the logs for specific error messages.

