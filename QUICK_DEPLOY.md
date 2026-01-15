# 🚀 Quick Deployment Guide

## Option 1: Railway (Recommended - 2 minutes)

1. **Install Railway CLI** (optional but easier):
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy directly**:
   ```bash
   cd ~/idiotic-betting
   railway init
   railway up
   ```

3. **Or use Web UI**:
   - Go to https://railway.app
   - Click "New Project"
   - Click "Deploy from GitHub repo" (or "Empty Project" and connect later)
   - If using GitHub: Push your code first (see below)
   - Add environment variables:
     - `GMAIL_USER`: your-email@gmail.com
     - `GMAIL_PASS`: your-gmail-app-password
   - Railway will auto-detect and deploy!

4. **Get your public URL**: Railway will give you a URL like `https://your-app.up.railway.app`

---

## Option 2: Render (Also Easy)

1. Go to https://render.com
2. Sign up (free)
3. Click "New" → "Web Service"
4. Connect your GitHub repo (or use "Public Git repository" and paste your repo URL)
5. Settings:
   - **Name**: idiotic-betting
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables:
   - `GMAIL_USER`: your-email@gmail.com
   - `GMAIL_PASS`: your-gmail-app-password
7. Click "Create Web Service"
8. Wait 2-3 minutes for deployment
9. Get your URL: `https://idiotic-betting.onrender.com` (or similar)

---

## Option 3: Heroku

1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Run:
   ```bash
   cd ~/idiotic-betting
   heroku login
   heroku create your-app-name
   heroku config:set GMAIL_USER=your-email@gmail.com
   heroku config:set GMAIL_PASS=your-app-password
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

---

## First: Push to GitHub (Recommended)

If you haven't already:

```bash
cd ~/idiotic-betting

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Idiotic Betting Card Game"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/idiotic-betting.git
git branch -M main
git push -u origin main
```

---

## Gmail App Password Setup

1. Go to https://myaccount.google.com
2. Click "Security" (left sidebar)
3. Enable "2-Step Verification" if not already enabled
4. Scroll down to "App passwords"
5. Click "App passwords"
6. Select "Mail" and "Other (Custom name)"
7. Name it "Idiotic Betting"
8. Copy the 16-character password
9. Use this in `GMAIL_PASS` environment variable (NOT your regular Gmail password!)

---

## Test Your Deployment

Once deployed, visit your public URL and:
1. Register with a Gmail account
2. Check your email for verification link
3. Click the verification link
4. Login and play!

---

## Share Your Game

Once deployed, share the public URL with friends so they can:
- Create accounts
- Play online together
- Enjoy the chaos!

---

## Troubleshooting

**Email not sending?**
- Make sure you're using an App Password, not your regular password
- Check that 2-Step Verification is enabled
- Verify GMAIL_USER and GMAIL_PASS are set correctly

**Port errors?**
- The server uses `process.env.PORT || 5495` so it should work on any platform

**Connection issues?**
- Make sure WebSocket is enabled (Socket.io should handle this automatically)

---

## Current Local URL

Your game is running locally at: **http://localhost:5495**

