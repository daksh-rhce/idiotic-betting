#!/bin/bash

echo "🎲 Idiotic Betting - Deployment Helper"
echo "======================================"
echo ""

# Check if Railway CLI is installed
if command -v railway &> /dev/null; then
    echo "✓ Railway CLI detected!"
    echo ""
    read -p "Deploy to Railway now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Deploying to Railway..."
        railway login
        railway init
        railway up
        echo ""
        echo "✓ Deployment started! Check Railway dashboard for your URL."
        exit 0
    fi
fi

# Check if Heroku CLI is installed
if command -v heroku &> /dev/null; then
    echo "✓ Heroku CLI detected!"
    echo ""
    read -p "Deploy to Heroku now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your Heroku app name: " appname
        echo "Setting up Heroku..."
        heroku create $appname
        echo ""
        echo "⚠️  Don't forget to set environment variables:"
        echo "   heroku config:set GMAIL_USER=your-email@gmail.com"
        echo "   heroku config:set GMAIL_PASS=your-app-password"
        echo ""
        read -p "Push to Heroku now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git init
            git add .
            git commit -m "Initial commit"
            git push heroku main
            echo ""
            echo "✓ Deployed! Your app: https://$appname.herokuapp.com"
        fi
        exit 0
    fi
fi

echo "No deployment CLI detected."
echo ""
echo "📖 Quick Options:"
echo "1. Railway (Easiest): https://railway.app - Connect GitHub repo"
echo "2. Render: https://render.com - New Web Service"
echo "3. See QUICK_DEPLOY.md for detailed instructions"
echo ""
echo "Current local URL: http://localhost:5495"

