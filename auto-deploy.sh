#!/bin/bash

echo "🚀 Auto-Deployment Script for Idiotic Betting"
echo "=============================================="
echo ""

# Check if Railway CLI is available
if command -v railway &> /dev/null; then
    echo "✓ Railway CLI found!"
    echo ""
    echo "To deploy to Railway:"
    echo "1. Run: railway login"
    echo "2. Run: railway init"
    echo "3. Run: railway up"
    echo ""
    read -p "Start Railway deployment now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        railway login
        railway init
        railway up
        exit 0
    fi
fi

# Check if we can use GitHub CLI
if command -v gh &> /dev/null; then
    echo "✓ GitHub CLI found!"
    echo ""
    read -p "Create GitHub repo and prepare for deployment? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter GitHub repo name (or press Enter for 'idiotic-betting'): " reponame
        reponame=${reponame:-idiotic-betting}
        
        gh repo create $reponame --public --source=. --remote=origin --push
        echo ""
        echo "✓ Repository created and pushed!"
        echo ""
        echo "Now deploy to:"
        echo "1. Railway: https://railway.app/new (Connect GitHub repo)"
        echo "2. Render: https://render.com (New Web Service, connect repo)"
        exit 0
    fi
fi

echo ""
echo "📋 Manual Deployment Steps:"
echo ""
echo "1. Create GitHub repository:"
echo "   - Go to https://github.com/new"
echo "   - Name: idiotic-betting"
echo "   - Create repository"
echo ""
echo "2. Push code:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/idiotic-betting.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Railway (easiest):"
echo "   - Go to https://railway.app"
echo "   - Sign up with GitHub"
echo "   - New Project → Deploy from GitHub"
echo "   - Select your repo"
echo "   - Add env vars: GMAIL_USER, GMAIL_PASS"
echo ""
echo "Current git status:"
git status --short

