// Lobby and Online Game Management
let currentLobby = null;
let friendsList = [];
let friendRequests = [];
let leaderboard = [];

// Load leaderboard from localStorage
function loadLeaderboard() {
    const stored = localStorage.getItem('leaderboard');
    if (stored) {
        leaderboard = JSON.parse(stored);
    }
}

// Save leaderboard to localStorage
function saveLeaderboard() {
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// Update leaderboard when player wins
function updateLeaderboard(playerName) {
    loadLeaderboard();
    const entry = leaderboard.find(e => e.username === playerName);
    if (entry) {
        entry.wins++;
    } else {
        leaderboard.push({ username: playerName, wins: 1 });
    }
    leaderboard.sort((a, b) => b.wins - a.wins);
    saveLeaderboard();
}

// Load friends from localStorage
function loadFriends() {
    const stored = localStorage.getItem('friends');
    if (stored) {
        friendsList = JSON.parse(stored);
    }
    const requestsStored = localStorage.getItem('friendRequests');
    if (requestsStored) {
        friendRequests = JSON.parse(requestsStored);
    }
}

// Save friends to localStorage
function saveFriends() {
    localStorage.setItem('friends', JSON.stringify(friendsList));
    localStorage.setItem('friendRequests', JSON.stringify(friendRequests));
}

// Lobby functions
function showCreateLobby() {
    document.getElementById('create-lobby-form').style.display = 'block';
    document.getElementById('join-lobby-form').style.display = 'none';
    document.getElementById('friends-lobby-form').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function showJoinLobby() {
    document.getElementById('create-lobby-form').style.display = 'none';
    document.getElementById('join-lobby-form').style.display = 'block';
    document.getElementById('friends-lobby-form').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadAvailableLobbies();
}

function showFriendsLobby() {
    document.getElementById('create-lobby-form').style.display = 'none';
    document.getElementById('join-lobby-form').style.display = 'none';
    document.getElementById('friends-lobby-form').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadFriendsList();
}

function loadLobbyScreen() {
    showCreateLobby();
}

function createLobby() {
    const lobbyName = document.getElementById('lobby-name-input').value.trim();
    const password = document.getElementById('lobby-password-input').value;
    const errorDiv = document.getElementById('create-lobby-error');
    
    if (!lobbyName) {
        errorDiv.textContent = 'Please enter a lobby name';
        return;
    }
    
    // Create lobby (in real implementation, this would go to server)
    currentLobby = {
        name: lobbyName,
        password: password,
        leader: currentUser.username,
        players: [{
            id: currentUser.username,
            name: playerName || currentUser.username,
            isLeader: true
        }],
        maxPlayers: 4
    };
    
    // Store in localStorage (in production, use server)
    localStorage.setItem('currentLobby', JSON.stringify(currentLobby));
    
    displayCurrentLobby();
    addLog(`Created lobby: ${lobbyName}`);
}

function loadAvailableLobbies() {
    // In production, fetch from server
    // For now, show message
    const lobbiesDiv = document.getElementById('available-lobbies');
    lobbiesDiv.innerHTML = '<p style="color: #FFD700;">Available lobbies will appear here when other players create them.</p>';
}

function joinLobby() {
    const lobbyName = document.getElementById('join-lobby-name').value.trim();
    const password = document.getElementById('join-lobby-password').value;
    const errorDiv = document.getElementById('join-lobby-error');
    
    if (!lobbyName) {
        errorDiv.textContent = 'Please enter a lobby name';
        return;
    }
    
    // In production, check server for lobby
    // For now, simulate join
    const storedLobby = localStorage.getItem(`lobby_${lobbyName}`);
    if (storedLobby) {
        const lobby = JSON.parse(storedLobby);
        if (lobby.password && lobby.password !== password) {
            errorDiv.textContent = 'Incorrect password';
            return;
        }
        if (lobby.players.length >= lobby.maxPlayers) {
            errorDiv.textContent = 'Lobby is full';
            return;
        }
        
        lobby.players.push({
            id: currentUser.username,
            name: playerName || currentUser.username,
            isLeader: false
        });
        
        currentLobby = lobby;
        localStorage.setItem('currentLobby', JSON.stringify(currentLobby));
        displayCurrentLobby();
        addLog(`Joined lobby: ${lobbyName}`);
    } else {
        errorDiv.textContent = 'Lobby not found';
    }
}

function displayCurrentLobby() {
    document.getElementById('create-lobby-form').style.display = 'none';
    document.getElementById('join-lobby-form').style.display = 'none';
    document.getElementById('friends-lobby-form').style.display = 'none';
    document.getElementById('current-lobby').style.display = 'block';
    
    document.getElementById('current-lobby-name').textContent = currentLobby.name;
    const playersDiv = document.getElementById('lobby-players');
    playersDiv.innerHTML = '';
    
    currentLobby.players.forEach((player, index) => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'lobby-player';
        playerDiv.innerHTML = `
            <span>${player.name} ${player.isLeader ? '(Leader)' : ''}</span>
            ${currentLobby.leader === currentUser.username && !player.isLeader ? 
                `<button class="btn btn-small" onclick="kickPlayer('${player.id}')">Kick</button>` : ''}
        `;
        playersDiv.appendChild(playerDiv);
    });
}

function kickPlayer(playerId) {
    if (currentLobby.leader !== currentUser.username) return;
    
    currentLobby.players = currentLobby.players.filter(p => p.id !== playerId);
    localStorage.setItem('currentLobby', JSON.stringify(currentLobby));
    displayCurrentLobby();
    addLog(`Kicked player: ${playerId}`);
}

function startLobbyGame() {
    if (currentLobby.players.length < 2) {
        alert('Need at least 2 players to start!');
        return;
    }
    
    if (currentLobby.leader !== currentUser.username) {
        alert('Only the lobby leader can start the game!');
        return;
    }
    
    // Initialize game with lobby players
    gameState.players = currentLobby.players.map((p, idx) => ({
        id: idx,
        name: p.name,
        money: 500,
        properties: [],
        tasks: [],
        completedTasks: [],
        chaosCards: [],
        hasReceivedCatchUp: false
    }));
    
    gameState.playerId = currentLobby.players.findIndex(p => p.id === currentUser.username);
    
    initializeDecks();
    showTaskSelection();
}

function leaveLobby() {
    currentLobby = null;
    localStorage.removeItem('currentLobby');
    showCreateLobby();
}

// Friends system
function loadFriendsList() {
    loadFriends();
    const friendsDiv = document.getElementById('friends-list');
    friendsDiv.innerHTML = '';
    
    if (friendsList.length === 0) {
        friendsDiv.innerHTML = '<p style="color: #FFD700;">No friends yet. Send a friend request!</p>';
    } else {
        friendsList.forEach(friend => {
            const friendDiv = document.createElement('div');
            friendDiv.className = 'friend-item';
            friendDiv.innerHTML = `
                <span>${friend}</span>
                <button class="btn btn-small" onclick="joinFriendLobby('${friend}')">Join Game</button>
            `;
            friendsDiv.appendChild(friendDiv);
        });
    }
    
    // Show pending requests
    const requestsDiv = document.getElementById('friend-requests');
    requestsDiv.innerHTML = '<h4>Pending Requests:</h4>';
    friendRequests.forEach(req => {
        const reqDiv = document.createElement('div');
        reqDiv.className = 'friend-request-item';
        reqDiv.innerHTML = `
            <span>${req.from}</span>
            <button class="btn btn-small" onclick="acceptFriendRequest('${req.from}')">Accept</button>
            <button class="btn btn-small" onclick="rejectFriendRequest('${req.from}')">Reject</button>
        `;
        requestsDiv.appendChild(reqDiv);
    });
}

function sendFriendRequest() {
    const username = document.getElementById('friend-username-input').value.trim();
    const errorDiv = document.getElementById('friends-error');
    
    if (!username) {
        errorDiv.textContent = 'Please enter a username';
        return;
    }
    
    if (username === currentUser.username) {
        errorDiv.textContent = 'Cannot add yourself!';
        return;
    }
    
    // In production, send to server
    // For now, store locally
    const request = {
        from: currentUser.username,
        to: username,
        timestamp: Date.now()
    };
    
    // Store request (in production, server handles this)
    localStorage.setItem(`friendRequest_${username}`, JSON.stringify(request));
    errorDiv.textContent = `Friend request sent to ${username}!`;
    document.getElementById('friend-username-input').value = '';
}

function acceptFriendRequest(fromUsername) {
    loadFriends();
    if (!friendsList.includes(fromUsername)) {
        friendsList.push(fromUsername);
        saveFriends();
    }
    friendRequests = friendRequests.filter(r => r.from !== fromUsername);
    saveFriends();
    loadFriendsList();
}

function rejectFriendRequest(fromUsername) {
    friendRequests = friendRequests.filter(r => r.from !== fromUsername);
    saveFriends();
    loadFriendsList();
}

function joinFriendLobby(friendUsername) {
    // In production, check if friend has an open lobby
    addLog(`Attempting to join ${friendUsername}'s lobby...`);
    // For now, show message
    alert(`In production, this would join ${friendUsername}'s lobby if they have one open.`);
}

// Make functions globally available
window.showCreateLobby = showCreateLobby;
window.showJoinLobby = showJoinLobby;
window.showFriendsLobby = showFriendsLobby;
window.createLobby = createLobby;
window.joinLobby = joinLobby;
window.kickPlayer = kickPlayer;
window.startLobbyGame = startLobbyGame;
window.leaveLobby = leaveLobby;
window.sendFriendRequest = sendFriendRequest;
window.acceptFriendRequest = acceptFriendRequest;
window.rejectFriendRequest = rejectFriendRequest;
window.joinFriendLobby = joinFriendLobby;
window.loadLobbyScreen = loadLobbyScreen;
window.updateLeaderboard = updateLeaderboard;

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
    loadFriends();
});

