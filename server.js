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
const leaderboard = new Map(); // Server-side leaderboard
const friends = new Map(); // Server-side friends: Map<username, Set<friendUsername>>
const friendRequests = new Map(); // Server-side friend requests: Map<username, Array<{from, to, status}>>
const lobbies = new Map(); // Server-side lobbies: Map<lobbyName, {password, players, host}>

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

app.post('/api/change-password', async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    
    if (!username || !oldPassword || !newPassword) {
        return res.status(400).json({ error: 'All fields required' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    const user = users.get(username);
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }
    
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    users.set(username, user);
    
    res.json({ 
        success: true, 
        message: 'Password changed successfully' 
    });
});

// Leaderboard API
app.get('/api/leaderboard', (req, res) => {
    const leaderboardArray = Array.from(leaderboard.entries())
        .map(([username, wins]) => ({ username, wins }))
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 100);
    res.json({ leaderboard: leaderboardArray });
});

app.post('/api/leaderboard/update', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username required' });
    }
    const currentWins = leaderboard.get(username) || 0;
    leaderboard.set(username, currentWins + 1);
    res.json({ success: true });
});

// Friends API
app.get('/api/friends/:username', (req, res) => {
    const { username } = req.params;
    const userFriends = friends.get(username) || new Set();
    res.json({ friends: Array.from(userFriends) });
});

app.post('/api/friends/request', (req, res) => {
    const { from, to } = req.body;
    if (!from || !to) {
        return res.status(400).json({ error: 'From and to usernames required' });
    }
    if (from === to) {
        return res.status(400).json({ error: 'Cannot send request to yourself' });
    }
    
    const requests = friendRequests.get(to) || [];
    if (requests.find(r => r.from === from && r.status === 'pending')) {
        return res.status(400).json({ error: 'Request already sent' });
    }
    
    requests.push({ from, to, status: 'pending', timestamp: Date.now() });
    friendRequests.set(to, requests);
    res.json({ success: true });
});

app.post('/api/friends/accept', (req, res) => {
    const { username, from } = req.body;
    if (!username || !from) {
        return res.status(400).json({ error: 'Username and from required' });
    }
    
    const requests = friendRequests.get(username) || [];
    const request = requests.find(r => r.from === from && r.status === 'pending');
    if (!request) {
        return res.status(400).json({ error: 'Request not found' });
    }
    
    request.status = 'accepted';
    
    // Add to friends lists
    if (!friends.has(username)) friends.set(username, new Set());
    if (!friends.has(from)) friends.set(from, new Set());
    friends.get(username).add(from);
    friends.get(from).add(username);
    
    res.json({ success: true });
});

app.post('/api/friends/reject', (req, res) => {
    const { username, from } = req.body;
    if (!username || !from) {
        return res.status(400).json({ error: 'Username and from required' });
    }
    
    const requests = friendRequests.get(username) || [];
    const request = requests.find(r => r.from === from && r.status === 'pending');
    if (request) {
        request.status = 'rejected';
    }
    
    res.json({ success: true });
});

app.get('/api/friends/requests/:username', (req, res) => {
    const { username } = req.params;
    const requests = (friendRequests.get(username) || []).filter(r => r.status === 'pending');
    res.json({ requests });
});

// Lobbies API
app.get('/api/lobbies', (req, res) => {
    const lobbiesArray = Array.from(lobbies.entries())
        .map(([name, data]) => ({
            name,
            playerCount: data.players.length,
            hasPassword: !!data.password,
            host: data.host
        }));
    res.json({ lobbies: lobbiesArray });
});

app.post('/api/lobbies/create', (req, res) => {
    const { name, password, host } = req.body;
    if (!name || !host) {
        return res.status(400).json({ error: 'Lobby name and host required' });
    }
    if (lobbies.has(name)) {
        return res.status(400).json({ error: 'Lobby already exists' });
    }
    
    lobbies.set(name, {
        password: password || null,
        players: [{ username: host, socketId: null }],
        host: host
    });
    
    res.json({ success: true });
});

app.post('/api/lobbies/join', (req, res) => {
    const { name, password, username } = req.body;
    if (!name || !username) {
        return res.status(400).json({ error: 'Lobby name and username required' });
    }
    
    const lobby = lobbies.get(name);
    if (!lobby) {
        return res.status(404).json({ error: 'Lobby not found' });
    }
    
    if (lobby.password && lobby.password !== password) {
        return res.status(401).json({ error: 'Incorrect password' });
    }
    
    if (lobby.players.length >= 6) {
        return res.status(400).json({ error: 'Lobby is full' });
    }
    
    if (lobby.players.find(p => p.username === username)) {
        return res.status(400).json({ error: 'Already in lobby' });
    }
    
    lobby.players.push({ username, socketId: null });
    res.json({ success: true, lobby });
});

app.post('/api/lobbies/leave', (req, res) => {
    const { name, username } = req.body;
    if (!name || !username) {
        return res.status(400).json({ error: 'Lobby name and username required' });
    }
    
    const lobby = lobbies.get(name);
    if (lobby) {
        lobby.players = lobby.players.filter(p => p.username !== username);
        if (lobby.players.length === 0) {
            lobbies.delete(name);
        } else if (lobby.host === username) {
            lobby.host = lobby.players[0].username;
        }
    }
    
    res.json({ success: true });
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
