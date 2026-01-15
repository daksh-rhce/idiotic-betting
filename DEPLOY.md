# Deployment Guide for Idiotic Betting

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Connect your repository
5. Railway will auto-detect Node.js and deploy
6. Add environment variables:
   - `GMAIL_USER`: Your Gmail address
   - `GMAIL_PASS`: Your Gmail app password
7. Your app will be live at: `https://your-app-name.railway.app`

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Sign up
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node
6. Add environment variables (GMAIL_USER, GMAIL_PASS)
7. Deploy!

### Option 3: Heroku

1. Install Heroku CLI
2. Run:
```bash
heroku create your-app-name
heroku config:set GMAIL_USER=your-email@gmail.com
heroku config:set GMAIL_PASS=your-app-password
git push heroku main
```

### Option 4: Google Cloud Run

1. Install Google Cloud SDK
2. Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5495
CMD ["npm", "start"]
```

3. Deploy:
```bash
gcloud run deploy idiotic-betting --source . --port 5495
```

## Gmail Setup for Email Verification

1. Go to Google Account settings
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a new app password for "Mail"
5. Use this password in `GMAIL_PASS` environment variable

## Environment Variables Needed

- `GMAIL_USER`: Your Gmail address
- `GMAIL_PASS`: Gmail app password
- `PORT`: Port number (defaults to 5495)

## Current Local URL

The game is running locally at: **http://localhost:5495**

## Making it Public

After deploying to any of the above services, you'll get a public URL that others can access. Share that URL with players!

