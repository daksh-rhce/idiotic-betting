# GitHub Explained - Complete Beginner's Guide

## What is GitHub?

**GitHub** is like a "cloud storage" for your code, but much smarter:
- It saves **every version** of your code (like "Save Game" but for code)
- You can **share** your code with others
- You can **deploy** (publish) your game online
- It **backups** your code automatically

Think of it like:
- **Google Drive** for code
- **Time machine** that remembers every change
- **Collaboration tool** for working with others

---

## Key Terms (Simple Explanations)

### 1. **Repository (Repo)**
- A "folder" that contains your entire project
- Like a project folder on your computer, but online
- Example: `idiotic-betting` is your repository

### 2. **Commit**
- A "save point" for your code
- Like saving your game progress
- You write a message describing what you changed
- Example: "Added wheel feature" or "Fixed chaos cards"

### 3. **Push**
- Uploading your commits to GitHub
- Like uploading photos to Google Drive
- Makes your code available online

### 4. **Clone**
- Downloading a repository to your computer
- Like downloading a folder from Google Drive

### 5. **Branch**
- A separate version of your code
- Like having multiple save files for the same game
- You work on a "main" branch (the main version)

---

## Why Do You Need GitHub?

For your game, you need GitHub to:
1. **Deploy your game online** (make it playable on the internet)
2. **Backup your code** (never lose your work)
3. **Share your game** (others can play it)
4. **Track changes** (see what you changed and when)

---

## Step-by-Step: Setting Up GitHub for Your Game

### STEP 1: Create a GitHub Account

1. Go to: **https://github.com**
2. Click **"Sign up"**
3. Enter:
   - Username (choose something like `daksh-games` or `yourname`)
   - Email address
   - Password
4. Verify your email
5. Done! You now have a GitHub account

---

### STEP 2: Create a New Repository

1. Log into GitHub
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Repository name**: `idiotic-betting` (or any name you want)
   - **Description**: "Idiotic Betting - A chaotic auction card game"
   - **Visibility**: Choose **Public** (so you can deploy it for free)
   - **DO NOT** check "Add a README file" (we already have code)
4. Click **"Create repository"**

---

### STEP 3: Install Git on Your Computer

Git is the tool that talks to GitHub. You need it installed.

**On Mac (you're using Mac):**
1. Open **Terminal** (press Cmd+Space, type "Terminal")
2. Type: `git --version`
3. If it says "command not found", install it:
   - Go to: https://git-scm.com/download/mac
   - Download and install
   - OR use Homebrew: `brew install git`

**Check if it's installed:**
```bash
git --version
```
Should show something like: `git version 2.39.0`

---

### STEP 4: Connect Your Project to GitHub

Open Terminal and navigate to your project:

```bash
cd ~/idiotic-betting
```

**Tell Git who you are (first time only):**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Initialize Git in your project:**
```bash
git init
```

**Add all your files:**
```bash
git add .
```

**Create your first commit:**
```bash
git commit -m "Initial commit - Idiotic Betting game"
```

**Connect to GitHub:**
```bash
git remote add origin https://github.com/YOUR-USERNAME/idiotic-betting.git
```
*(Replace YOUR-USERNAME with your actual GitHub username)*

**Push to GitHub:**
```bash
git branch -M main
git push -u origin main
```

You'll be asked for your GitHub username and password (or a token).

---

## Daily Workflow (After Setup)

Once set up, here's how you use it daily:

### When You Make Changes:

1. **See what changed:**
   ```bash
   git status
   ```

2. **Add your changes:**
   ```bash
   git add .
   ```

3. **Save with a message:**
   ```bash
   git commit -m "Added new feature"
   ```

4. **Upload to GitHub:**
   ```bash
   git push
   ```

That's it! Your code is now backed up and online.

---

## Common Commands Cheat Sheet

| Command | What It Does |
|---------|-------------|
| `git status` | See what files changed |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Save changes with a message |
| `git push` | Upload to GitHub |
| `git pull` | Download latest from GitHub |
| `git log` | See all your commits (history) |

---

## What Happens After You Push?

1. Your code is on GitHub (visible at `github.com/YOUR-USERNAME/idiotic-betting`)
2. You can now deploy it to services like:
   - **Railway** (recommended - easiest)
   - **Render**
   - **Heroku**
   - **Vercel**

These services can "see" your GitHub code and automatically host your game online!

---

## Troubleshooting

### "Permission denied" error?
- You might need to use a **Personal Access Token** instead of password
- Go to GitHub → Settings → Developer settings → Personal access tokens
- Generate a new token and use that as your password

### "Repository not found" error?
- Check that your GitHub username is correct
- Make sure the repository exists on GitHub
- Check the repository URL is correct

### "Nothing to commit"?
- This means no files changed, which is fine!

---

## Visual Example

```
Your Computer          GitHub (Cloud)
┌─────────────┐       ┌─────────────┐
│ game.js     │  git  │ game.js     │
│ style.css   │ push  │ style.css   │
│ index.html  │ ────> │ index.html  │
└─────────────┘       └─────────────┘
   (Local)              (Online)
```

---

## Next Steps

After you push to GitHub:
1. Your code is backed up ✅
2. You can share the link with others ✅
3. You can deploy to Railway/Render/etc. ✅
4. Your game will be playable online! 🎮

---

## Quick Start Script

I've created a helper script to make this easier. Run:

```bash
cd ~/idiotic-betting
bash setup-git.sh
```

This will guide you through the process step-by-step!

---

## Need Help?

- GitHub Docs: https://docs.github.com
- Git Tutorial: https://git-scm.com/docs
- Or just ask me! I can help you through each step.

---

**Remember:** GitHub is just a tool. Don't worry if it seems complicated at first. Once you do it a few times, it becomes second nature! 🚀

