# 🚀 Deploy to Railway - Quick Guide

## Step 1: Login to Railway
Run this command in your terminal:
```bash
railway login
```
This will open a browser window for you to authenticate.

## Step 2: Link Your Project (if not already linked)
```bash
cd /Users/Daksh/idiotic-betting
railway link
```
Select your existing Railway project or create a new one.

## Step 3: Deploy
```bash
railway up
```

## Alternative: Deploy via GitHub (Recommended)
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `daksh-rhce/idiotic-betting`
5. Railway will automatically deploy from your GitHub repository!

## Your Game URL
After deployment, Railway will give you a URL like:
- `https://your-project-name.up.railway.app`

Share this URL with friends to play online!

## Note
The server is already configured with:
- ✅ Procfile for Railway
- ✅ PORT environment variable support
- ✅ All dependencies in package.json
- ✅ Server.js ready for production

Just deploy and play!
