# 🎲 Idiotic Betting - Card Game

A chaotic auction-and-sabotage card game about buying useless things, blocking opponents, and winning by sheer persistence.

## 🚀 Quick Start

### Local Development

```bash
npm install
npm start
```

Game runs at: **http://localhost:5495**

### Deploy to Public (So Others Can Join)

See **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** for step-by-step deployment instructions.

**Fastest option**: Deploy to [Railway.app](https://railway.app) in 2 minutes!

## 🎮 How to Play

### Game Flow

1. **Register/Login** with Gmail account
2. **Verify Email** (click link sent to your email)
3. **Choose Your Name**
4. **Select Game Mode**:
   - **Solo**: Play against AI bots
   - **Online**: Play against real players (requires deployment)
5. **Select 5 Task Cards** from the pile
6. **Game Begins**:
   - Properties are auctioned one by one
   - Bid in turn (one player at a time)
   - Highest bidder wins the property
   - Play Chaos cards (max 1 per turn) to disrupt others
   - Complete 4 tasks to win!

### Key Features

- ✅ **Task Card Selection**: Choose 5 cards from 10 random options
- ✅ **Turn-Based Bidding**: Players bid one by one until all pass
- ✅ **Tie-Breaker**: First to bid the tie amount wins
- ✅ **Chaos Cards**: Max 1 per turn, select targets for cards that need them
- ✅ **Property Effects**: Displayed on screen for role-playing
- ✅ **Gmail Authentication**: Secure login with email verification
- ✅ **Multiplayer Ready**: WebSocket support for online play

## 🃏 Card Types

### Property Cards (35 total)
Each property has a hilarious effect that must be followed when owned. Effects are displayed prominently on screen.

### Task Cards (70 total)
Two task cards exist for every property. Complete tasks by owning the required property.

### Chaos Cards
- **Steal/Sabotage**: Steal money, properties, or cards
- **Auction Ruiners**: Disrupt auctions
- **Money Manipulation**: Gain or lose money
- **Task Screwery**: Swap or complete tasks
- **Defense**: Protect yourself from attacks

## 🛠️ Development

### Project Structure

```
idiotic-betting/
├── server.js          # Express server with WebSocket support
├── public/
│   ├── index.html     # Main game UI
│   ├── game.js        # Game logic
│   ├── auth.js        # Authentication logic
│   └── style.css      # Styling
├── package.json       # Dependencies
└── QUICK_DEPLOY.md    # Deployment guide
```

### Environment Variables

For email verification (optional for local, required for production):

- `GMAIL_USER`: Your Gmail address
- `GMAIL_PASS`: Gmail app password (get from Google Account settings)
- `PORT`: Server port (defaults to 5495)

### Setting Up Gmail

1. Go to [Google Account](https://myaccount.google.com)
2. Security → Enable 2-Step Verification
3. App Passwords → Generate password for "Mail"
4. Use that password in `GMAIL_PASS` environment variable

## 📦 Deployment

### Quick Deploy Options

1. **Railway** (Recommended): https://railway.app
   - Connect GitHub repo
   - Auto-detects Node.js
   - Free tier available

2. **Render**: https://render.com
   - New Web Service
   - Connect repo or use public Git URL
   - Free tier available

3. **Heroku**: Use `Procfile` included
   - `heroku create`
   - `heroku config:set GMAIL_USER=... GMAIL_PASS=...`
   - `git push heroku main`

See **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** for detailed instructions.

## 🎯 Game Rules

- **Objective**: Complete the most Task Cards (4 to win)
- **Players**: 3-6 players (4-5 ideal)
- **Starting Money**: 500
- **Auction**: Starting bid 50, minimum increment 50
- **Chaos Cards**: Max 1 per turn
- **Catch-Up**: Players with 0 money get 100 (once per round)

## 🐛 Troubleshooting

**Email not working?**
- Make sure you're using a Gmail App Password, not your regular password
- Check environment variables are set correctly
- For local testing, the game will show verification codes in console

**Port already in use?**
- Change PORT in server.js or set `PORT` environment variable
- Or kill the process using port 5495

**Game not loading?**
- Check browser console for errors
- Make sure all files are in the `public/` directory
- Verify server is running: `npm start`

## 📝 License

Free to use and modify!

## 🙏 Credits

Game design inspired by chaotic card games. Built with:
- Express.js
- Socket.io
- Node.js
- Pure JavaScript (no frameworks needed!)

---

**Ready to deploy?** Check out [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)!
