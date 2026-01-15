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
    
    // Load friend requests for current user
    const username = currentUser?.username;
    if (username) {
        friendRequests = [];
        
        // Method 1: Check user-specific requests
        const recipientRequests = JSON.parse(localStorage.getItem(`friendRequests_${username}`) || '[]');
        friendRequests.push(...recipientRequests.filter(r => r.to === username));
        
        // Method 2: Check global friend requests list
        const allRequests = JSON.parse(localStorage.getItem('allFriendRequests') || '[]');
        const myRequests = allRequests.filter(r => r.to === username);
        myRequests.forEach(req => {
            if (!friendRequests.find(r => r.from === req.from && r.to === req.to)) {
                friendRequests.push(req);
            }
        });
        
        // Method 3: Check localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`friendRequest_${username}_`)) {
                try {
                    const req = JSON.parse(localStorage.getItem(key));
                    if (req && req.to === username && !friendRequests.find(r => r.from === req.from)) {
                        friendRequests.push(req);
                    }
                } catch (e) {
                    // Skip invalid
                }
            }
        }
        
        // Remove duplicates
        friendRequests = friendRequests.filter((req, index, self) => 
            index === self.findIndex(r => r.from === req.from && r.to === req.to)
        );
    }
    
    // Save updated requests
    saveFriends();
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
    
    // Check if lobby already exists
    const existing = localStorage.getItem(`lobby_${lobbyName}`);
    if (existing) {
        errorDiv.textContent = 'Lobby name already taken!';
        return;
    }
    
    // Create lobby
    currentLobby = {
        name: lobbyName,
        password: password,
        leader: currentUser.username,
        players: [{
            id: currentUser.username,
            name: playerName || currentUser.username,
            isLeader: true
        }],
        maxPlayers: 4,
        createdAt: Date.now()
    };
    
    // Store in localStorage with key for easy lookup
    localStorage.setItem('currentLobby', JSON.stringify(currentLobby));
    localStorage.setItem(`lobby_${lobbyName}`, JSON.stringify(currentLobby));
    
    displayCurrentLobby();
    addLog(`Created lobby: ${lobbyName}`);
    
    // Refresh available lobbies for others
    if (typeof loadAvailableLobbies === 'function') {
        setTimeout(loadAvailableLobbies, 500);
    }
}

function loadAvailableLobbies() {
    // Load all lobbies from localStorage (shared across tabs)
    const lobbiesDiv = document.getElementById('available-lobbies');
    lobbiesDiv.innerHTML = '';
    
    // Get all lobby keys from localStorage
    const allLobbies = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('lobby_')) {
            try {
                const lobby = JSON.parse(localStorage.getItem(key));
                if (lobby && lobby.name && lobby.players) {
                    // Only show lobbies that aren't full and aren't the current user's
                    if (lobby.players.length < lobby.maxPlayers && 
                        !lobby.players.some(p => p.id === currentUser?.username)) {
                        allLobbies.push(lobby);
                    }
                }
            } catch (e) {
                // Skip invalid entries
            }
        }
    }
    
    if (allLobbies.length === 0) {
        lobbiesDiv.innerHTML = '<p style="color: #FFD700;">No available lobbies. Create one or ask a friend to create one!</p>';
    } else {
        allLobbies.forEach(lobby => {
            const lobbyDiv = document.createElement('div');
            lobbyDiv.className = 'lobby-item';
            lobbyDiv.style.cssText = 'padding: 15px; margin: 10px 0; background: rgba(0,0,0,0.5); border: 2px solid #FFD700; border-radius: 10px;';
            lobbyDiv.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 10px;">${lobby.name}</div>
                <div>Players: ${lobby.players.length}/${lobby.maxPlayers}</div>
                <div>Leader: ${lobby.leader}</div>
                <button class="btn btn-small" onclick="joinLobbyByName('${lobby.name}')" style="margin-top: 10px;">Join</button>
            `;
            lobbiesDiv.appendChild(lobbyDiv);
        });
    }
}

function joinLobbyByName(lobbyName) {
    document.getElementById('join-lobby-name').value = lobbyName;
    joinLobby();
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
    
    // Create request
    const request = {
        from: currentUser.username,
        to: username,
        timestamp: Date.now()
    };
    
    // Store request in multiple ways for cross-browser compatibility
    // Method 1: User-specific key (for when recipient logs in)
    const requestKey = `friendRequest_${username}_${currentUser.username}_${Date.now()}`;
    localStorage.setItem(requestKey, JSON.stringify(request));
    
    // Method 2: Add to global friend requests list (shared storage)
    const allRequests = JSON.parse(localStorage.getItem('allFriendRequests') || '[]');
    if (!allRequests.find(r => r.from === currentUser.username && r.to === username)) {
        allRequests.push(request);
        localStorage.setItem('allFriendRequests', JSON.stringify(allRequests));
    }
    
    // Method 3: Add to recipient's specific list
    const recipientRequests = JSON.parse(localStorage.getItem(`friendRequests_${username}`) || '[]');
    if (!recipientRequests.find(r => r.from === currentUser.username)) {
        recipientRequests.push(request);
        localStorage.setItem(`friendRequests_${username}`, JSON.stringify(recipientRequests));
    }
    
    // Update local friend requests list
    loadFriends();
    if (!friendRequests.find(r => r.to === username && r.from === currentUser.username)) {
        friendRequests.push(request);
        saveFriends();
    }
    
    errorDiv.textContent = `Friend request sent to ${username}!`;
    errorDiv.style.color = '#51cf66';
    errorDiv.style.fontWeight = 'bold';
    document.getElementById('friend-username-input').value = '';
    
    // Refresh friend list
    setTimeout(loadFriendsList, 500);
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
window.joinLobbyByName = joinLobbyByName;
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

