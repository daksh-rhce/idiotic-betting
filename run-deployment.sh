#!/bin/bash

echo "🚀 Starting Deployment Process..."
echo ""

cd ~/idiotic-betting

# Check Railway authentication
if railway whoami &>/dev/null; then
    echo "✓ Railway authenticated!"
    echo ""
    echo "Deploying to Railway..."
    
    # Initialize Railway project
    railway init --name idiotic-betting 2>&1 || echo "Project may already exist"
    
    # Deploy
    echo ""
    echo "Uploading files..."
    railway up
    
    echo ""
    echo "✓ Deployment complete!"
    echo ""
    railway status
    echo ""
    echo "Your app URL will be shown above, or check Railway dashboard"
    
else
    echo "⚠️  Railway not authenticated"
    echo ""
    echo "Please run: railway login"
    echo "Then run this script again, or run: railway up"
    echo ""
    echo "Or deploy via Railway web interface:"
    echo "1. Go to https://railway.app"
    echo "2. Sign up/login"
    echo "3. New Project → Deploy from GitHub"
    echo "4. Connect your GitHub repo"
fi

