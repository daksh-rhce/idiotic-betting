# 🚀 Deploy Right Now - Step by Step

## Current Status
✅ Git repository initialized
✅ All files committed
✅ Ready to push to GitHub

## Quick Deploy (5 minutes)

### Step 1: Create GitHub Repository

**Option A: Using GitHub Website**
1. Go to https://github.com/new
2. Repository name: `idiotic-betting`
3. Make it **Public** (or Private if you prefer)
4. **Don't** initialize with README (we already have one)
5. Click "Create repository"

**Option B: Using GitHub CLI** (if you have it)
```bash
cd ~/idiotic-betting
gh repo create idiotic-betting --public --source=. --remote=origin --push
```

### Step 2: Push Your Code

```bash
cd ~/idiotic-betting

# If you used Option A (website), run:
git remote add origin https://github.com/YOUR_USERNAME/idiotic-betting.git
git branch -M main
git push -u origin main

# If you used Option B, it's already done!
```

### Step 3: Deploy to Railway (Easiest - 2 minutes)

1. **Go to**: https://railway.app
2. **Sign up** with GitHub (one click)
3. **Click**: "New Project"
4. **Select**: "Deploy from GitHub repo"
5. **Choose**: Your `idiotic-betting` repository
6. **Railway auto-detects** Node.js and starts deploying!

### Step 4: Add Environment Variables

In Railway dashboard:
1. Click on your project
2. Click "Variables" tab
3. Add:
   - `GMAIL_USER` = `your-email@gmail.com`
   - `GMAIL_PASS` = `your-gmail-app-password`

**Get Gmail App Password:**
- Go to https://myaccount.google.com/security
- Enable 2-Step Verification
- App Passwords → Generate for "Mail"
- Copy the 16-character password

### Step 5: Get Your Public URL

1. In Railway, click "Settings"
2. Find "Domains" section
3. Click "Generate Domain"
4. **Copy your URL** (e.g., `https://idiotic-betting-production.up.railway.app`)

### Step 6: Share and Play!

🎉 **Your game is now live!** Share the URL with friends.

---

## Alternative: Render.com (Also Easy)

1. Go to https://render.com
2. Sign up
3. "New" → "Web Service"
4. Connect GitHub → Select `idiotic-betting` repo
5. Settings:
   - **Name**: idiotic-betting
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables (same as Railway)
7. Click "Create Web Service"
8. Wait 2-3 minutes
9. Get your URL!

---

## One-Command Setup (If you have GitHub CLI)

```bash
cd ~/idiotic-betting

# Create repo and push (requires gh auth login first)
gh repo create idiotic-betting --public --source=. --remote=origin --push

# Then go to Railway.app and connect the repo
```

---

## Current Local URL

Your game is running at: **http://localhost:5495**

Test it locally before deploying!

---

## Need Help?

- Check `QUICK_DEPLOY.md` for more details
- Railway docs: https://docs.railway.app
- Render docs: https://render.com/docs

**Ready? Start with Step 1 above!** 🚀

