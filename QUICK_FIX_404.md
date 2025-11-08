# Quick Fix for 404 NOT_FOUND Error on Render

## 🚨 Immediate Action Required

If you're getting `404: NOT_FOUND` errors, follow these steps **IN ORDER**:

## ✅ Step 1: Verify Render Settings (MOST IMPORTANT)

Go to **Render Dashboard → Your Frontend Service → Settings** and verify:

### Critical Settings:

1. **Root Directory**: Must be exactly `client` (no slash, no quotes)
2. **Build Command**: Must be `npm install && npm run build`
3. **Start Command**: Must be `npm start`
4. **Type**: Must be **Web Service** (NOT Static Site!)

### How to Check:

1. Go to your service in Render
2. Click "Settings" tab
3. Scroll to "Build & Deploy"
4. Verify each setting matches above

## ✅ Step 2: Check Build Logs

1. Go to **Render Dashboard → Your Frontend Service → Logs**
2. Look for the **Build** section
3. You should see:
   ```
   ✓ built in XXXms
   dist/index.html
   dist/assets/...
   ```
4. If build fails, fix the errors first

## ✅ Step 3: Check Runtime Logs

1. Go to **Render Dashboard → Your Frontend Service → Logs**
2. Look for the **Runtime** section (after build)
3. You should see:
   ```
   ✓ Dist directory found: /opt/render/project/src/client/dist
   ✓ Index file found: /opt/render/project/src/client/dist/index.html
   🚀 Server running on port XXXX
   ```
4. If you see errors, note them down

## ✅ Step 4: Test Health Endpoint

Visit: `https://your-app-name.onrender.com/health`

**Expected Response:**
```json
{
  "status": "ok",
  "distPath": "/opt/render/project/src/client/dist",
  "indexPath": "/opt/render/project/src/client/dist/index.html"
}
```

**If this works**: Server is running, issue is with routing
**If this fails**: Server isn't starting, check logs

## ✅ Step 5: Common Mistakes

### ❌ Wrong: Root Directory is empty or `/`
### ✅ Correct: Root Directory is `client`

### ❌ Wrong: Start Command is `npm run dev` or `vite`
### ✅ Correct: Start Command is `npm start`

### ❌ Wrong: Type is "Static Site"
### ✅ Correct: Type is "Web Service"

### ❌ Wrong: Build Command doesn't include `npm run build`
### ✅ Correct: Build Command is `npm install && npm run build`

## ✅ Step 6: Fix and Redeploy

After fixing settings:

1. **Clear Build Cache**:
   - Go to Render Dashboard → Your Service
   - Click "Manual Deploy" → "Clear build cache & deploy"

2. **Or Push to GitHub**:
   - Commit your changes
   - Push to repository
   - Render will auto-deploy

## ✅ Step 7: Verify It Works

After redeploy, test these URLs:

- `https://your-app.onrender.com/` → Landing page
- `https://your-app.onrender.com/signin` → Sign in page (no 404!)
- `https://your-app.onrender.com/signup` → Sign up page (no 404!)
- `https://your-app.onrender.com/health` → JSON status

## 🔍 Still Not Working?

Check the **Runtime Logs** for these specific errors:

### Error: "dist directory not found"
**Fix**: Build didn't complete. Check build logs.

### Error: "Cannot find module 'express'"
**Fix**: Make sure `express` is in `dependencies` in package.json (not devDependencies)

### Error: "EADDRINUSE" or port issues
**Fix**: Render handles ports automatically. Don't set PORT manually.

### Error: Server starts but routes return 404
**Fix**: Verify Start Command is `npm start` (not `npm run dev`)

## 📋 Checklist

Before asking for help, verify:

- [ ] Root Directory = `client`
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npm start`
- [ ] Type = Web Service
- [ ] Build logs show successful build
- [ ] Runtime logs show server started
- [ ] `/health` endpoint works
- [ ] `express` is in dependencies (not devDependencies)

## 🎯 Most Likely Issue

**90% of 404 errors are caused by:**
1. Root Directory not set to `client`
2. Using Static Site instead of Web Service
3. Start Command is wrong (should be `npm start`)

**Check these three things first!**

