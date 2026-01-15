const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = process.env.PORT || 5495;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage (use database in production)
const users = new Map();
const verificationCodes = new Map();
const activeGames = new Map();

// Email configuration (using Gmail)
// Note: In production, use environment variables for credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || 'your-email@gmail.com',
        pass: process.env.GMAIL_PASS || 'your-app-password'
    }
});

// API Routes
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    if (!email.endsWith('@gmail.com')) {
        return res.status(400).json({ error: 'Please use a Gmail address' });
    }
    
    if (users.has(email)) {
        return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification code
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    verificationCodes.set(email, verificationCode);
    
    // Store user (not verified)
    users.set(email, {
        email,
        password: hashedPassword,
        verified: false,
        createdAt: new Date()
    });
    
    // Send verification email
    try {
        await transporter.sendMail({
            from: process.env.GMAIL_USER || 'your-email@gmail.com',
            to: email,
            subject: 'Verify Your Idiotic Betting Account',
            html: `
                <h2>Welcome to Idiotic Betting!</h2>
                <p>Click the link below to verify your account:</p>
                <a href="http://localhost:${PORT}/verify?email=${encodeURIComponent(email)}&code=${verificationCode}">
                    Verify Account
                </a>
                <p>Or use this code: <strong>${verificationCode}</strong></p>
            `
        });
        
        res.json({ 
            success: true, 
            message: 'Verification email sent',
            code: verificationCode // For testing, remove in production
        });
    } catch (error) {
        console.error('Email error:', error);
        // For demo, still return success with code
        res.json({ 
            success: true, 
            message: 'Registration successful (email service not configured)',
            code: verificationCode
        });
    }
});

app.get('/verify', (req, res) => {
    const { email, code } = req.query;
    
    if (!email || !code) {
        return res.send('Invalid verification link');
    }
    
    const storedCode = verificationCodes.get(email);
    if (storedCode === code) {
        const user = users.get(email);
        if (user) {
            user.verified = true;
            verificationCodes.delete(email);
            res.send(`
                <html>
                    <body style="font-family: Arial; text-align: center; padding: 50px;">
                        <h1>✅ Account Verified!</h1>
                        <p>Your account has been verified. You can now login.</p>
                        <a href="http://localhost:${PORT}">Go to Game</a>
                    </body>
                </html>
            `);
        } else {
            res.send('User not found');
        }
    } else {
        res.send('Invalid verification code');
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = users.get(email);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.verified) {
        return res.status(401).json({ error: 'Account not verified. Check your email.' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ 
        success: true, 
        user: { email: user.email } 
    });
});

// WebSocket for multiplayer
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join-game', (data) => {
        const { gameId, playerName } = data;
        socket.join(gameId);
        
        if (!activeGames.has(gameId)) {
            activeGames.set(gameId, {
                players: [],
                gameState: null
            });
        }
        
        const game = activeGames.get(gameId);
        game.players.push({
            id: socket.id,
            name: playerName,
            socket: socket
        });
        
        io.to(gameId).emit('player-joined', {
            playerName,
            totalPlayers: game.players.length
        });
        
        socket.on('disconnect', () => {
            game.players = game.players.filter(p => p.id !== socket.id);
            io.to(gameId).emit('player-left', { playerName });
        });
    });
    
    socket.on('game-action', (data) => {
        const { gameId, action, payload } = data;
        // Broadcast action to all players in game
        socket.to(gameId).emit('game-update', { action, payload, from: socket.id });
    });
});

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
    console.log(`🎮 Idiotic Betting game running on http://localhost:${PORT}`);
    console.log(`📧 Email service: ${process.env.GMAIL_USER ? 'Configured' : 'Not configured (using demo mode)'}`);
});
