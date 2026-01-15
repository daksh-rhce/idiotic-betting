# 🔗 Connect Your Project to GitHub - Step by Step

## Step 1: Create GitHub Repository

1. Go to: **https://github.com/new**
2. Repository name: `idiotic-betting`
3. Description: "Idiotic Betting - A chaotic auction card game"
4. Make it **Public**
5. **DO NOT** check "Add a README file"
6. Click **"Create repository"**

## Step 2: Copy Your Repository URL

After creating, GitHub will show you a page with commands. Look for a URL like:
```
https://github.com/YOUR-USERNAME/idiotic-betting.git
```

**Copy this URL** - you'll need it in Step 4!

## Step 3: Run These Commands

Open Terminal and run these commands **one by one**:

```bash
cd ~/idiotic-betting
```

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Initial commit - Idiotic Betting game"
```

## Step 4: Connect to GitHub

Replace `YOUR-USERNAME` with your actual GitHub username:

```bash
git remote add origin https://github.com/YOUR-USERNAME/idiotic-betting.git
```

## Step 5: Push to GitHub

```bash
git branch -M main
```

```bash
git push -u origin main
```

**You'll be asked for:**
- Username: Your GitHub username
- Password: Your GitHub password (or a Personal Access Token)

## Step 6: Verify

Go to: `https://github.com/YOUR-USERNAME/idiotic-betting`

You should see all your files! ✅

---

## Need a Personal Access Token?

If password doesn't work:

1. Go to: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name it: "idiotic-betting"
4. Check "repo" permission
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. Use this token as your password when pushing

---

## Troubleshooting

**"Repository not found"?**
- Check your username is correct
- Make sure repository exists on GitHub
- Check the URL is correct

**"Permission denied"?**
- Use a Personal Access Token instead of password
- See instructions above

**"Nothing to commit"?**
- This is fine if you haven't made changes
- Try `git add .` again

---

## After Success

Once your code is on GitHub, you can:
- ✅ Deploy to Railway/Render/etc.
- ✅ Share your game with others
- ✅ Backup your code automatically

🎉 **Congratulations!** Your game is now on GitHub!

