#!/bin/bash
echo "Setting up Git repository for Idiotic Betting..."
echo ""
echo "This script will:"
echo "1. Initialize git (if needed)"
echo "2. Create initial commit"
echo "3. Show you how to connect to GitHub"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ ! -d .git ]; then
        git init
        echo "✓ Git initialized"
    fi
    
    git add .
    git commit -m "Initial commit: Idiotic Betting card game"
    echo "✓ Files committed"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository named 'idiotic-betting'"
    echo "3. Run these commands:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/idiotic-betting.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "Then deploy to Railway or Render using the instructions in QUICK_DEPLOY.md"
else
    echo "Cancelled."
fi
