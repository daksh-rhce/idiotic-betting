const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
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
const activeGames = new Map();

// API Routes
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    if (username.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    if (users.has(username)) {
        return res.status(400).json({ error: 'Username already taken' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Store user
    users.set(username, {
        username,
        password: hashedPassword,
        createdAt: new Date()
    });
    
    res.json({ 
        success: true, 
        message: 'Registration successful'
    });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    const user = users.get(username);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ 
        success: true, 
        user: { username: user.username } 
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
});
