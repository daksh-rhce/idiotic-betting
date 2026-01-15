# 🚀 SIMPLE GitHub Guide - 5 Minutes to Get Started

## What is GitHub? (30 seconds)

**GitHub = Google Drive for code**

- Stores your code online
- Saves every version (like time machine)
- Lets you deploy (publish) your game online
- Free backup of your work

---

## Quick Setup (5 Steps)

### 1️⃣ Create GitHub Account
- Go to: **github.com**
- Click "Sign up"
- Enter username, email, password
- Done!

### 2️⃣ Create Repository
- Click **"+"** → **"New repository"**
- Name: `idiotic-betting`
- Make it **Public**
- Click **"Create repository"**

### 3️⃣ Install Git (if needed)
Open Terminal and type:
```bash
git --version
```

If it says "command not found":
- Mac: `brew install git` (or download from git-scm.com)

### 4️⃣ Connect Your Project

Open Terminal:
```bash
cd ~/idiotic-betting
git init
git add .
git commit -m "My first game!"
```

### 5️⃣ Push to GitHub

```bash
git remote add origin https://github.com/YOUR-USERNAME/idiotic-betting.git
git branch -M main
git push -u origin main
```

*(Replace YOUR-USERNAME with your GitHub username)*

---

## Daily Use (After Setup)

**Every time you make changes:**

```bash
cd ~/idiotic-betting
git add .
git commit -m "What I changed"
git push
```

That's it! Your code is backed up and online.

---

## Why You Need This

✅ **Deploy your game** - Make it playable online  
✅ **Backup your code** - Never lose your work  
✅ **Share with friends** - They can play your game  
✅ **Track changes** - See what you changed when  

---

## Common Questions

**Q: Is it free?**  
A: Yes! GitHub is free for public repositories.

**Q: Do I need to do this every day?**  
A: Only when you want to save/backup your changes.

**Q: Can I delete my code from GitHub?**  
A: Yes, you can delete the repository anytime.

**Q: What if I make a mistake?**  
A: Git saves every version, so you can go back!

---

## Visual Guide

```
1. Make changes to your code
   ↓
2. git add .
   ↓
3. git commit -m "message"
   ↓
4. git push
   ↓
5. Code is on GitHub! 🎉
```

---

## Need Help?

Just ask! I can walk you through any step. 😊

