# ⚡ Instant Deployment Guide

## ✅ What's Already Done

- ✅ Git repository initialized
- ✅ All files committed
- ✅ Railway CLI installed
- ✅ Server running locally

## 🚀 Deploy in 2 Minutes

### Method 1: Railway CLI (If Authenticated)

```bash
cd ~/idiotic-betting
railway login          # First time only
railway init
railway up
```

### Method 2: Railway Web (Easiest - Recommended)

1. **Push to GitHub first:**
   ```bash
   cd ~/idiotic-betting
   
   # Create repo on GitHub.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/idiotic-betting.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Railway:**
   - Go to: https://railway.app
   - Sign up with GitHub (one click)
   - Click "New Project"
   - Click "Deploy from GitHub repo"
   - Select `idiotic-betting`
   - Railway auto-deploys!

3. **Add Environment Variables:**
   - In Railway dashboard → Variables
   - Add: `GMAIL_USER` = your-email@gmail.com
   - Add: `GMAIL_PASS` = your-gmail-app-password

4. **Get Your URL:**
   - Railway → Settings → Domains
   - Generate domain
   - Copy your public URL!

### Method 3: Render.com

1. Push to GitHub (same as above)
2. Go to: https://render.com
3. "New" → "Web Service"
4. Connect GitHub → Select repo
5. Add environment variables
6. Deploy!

## 📧 Gmail Setup

1. https://myaccount.google.com/security
2. Enable 2-Step Verification
3. App Passwords → Generate for "Mail"
4. Use that password (not your regular password)

## 🎮 Test Locally

Before deploying, test at: http://localhost:5495

## 📝 Quick Commands

```bash
# Check Railway auth
railway whoami

# Login to Railway
railway login

# Deploy
railway up

# Or use the script
./run-deployment.sh
```

---

**Ready? Start with pushing to GitHub, then deploy on Railway!** 🚀
