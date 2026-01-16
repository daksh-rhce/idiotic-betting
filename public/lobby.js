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

async function createLobby() {
    const lobbyName = document.getElementById('lobby-name-input').value.trim();
    const password = document.getElementById('lobby-password-input').value;
    const errorDiv = document.getElementById('create-lobby-error');
    
    if (!lobbyName) {
        errorDiv.textContent = 'Please enter a lobby name';
        return;
    }
    
    if (!currentUser || !currentUser.username) {
        errorDiv.textContent = 'You must be logged in to create a lobby';
        return;
    }
    
    try {
        const response = await fetch('/api/lobbies/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: lobbyName, password: password || null, host: currentUser.username })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentLobby = {
                id: data.lobbyId,
                name: lobbyName,
                password: password || null,
                leader: currentUser.username,
                players: [{
                    id: currentUser.username,
                    name: playerName || currentUser.username,
                    isLeader: true
                }],
                maxPlayers: 4,
                createdAt: Date.now()
            };
            
            localStorage.setItem('currentLobby', JSON.stringify(currentLobby));
            displayCurrentLobby();
            addLog(`Created lobby: ${lobbyName}`);
            
            setTimeout(loadAvailableLobbies, 500);
        } else {
            errorDiv.textContent = data.error || 'Failed to create lobby';
        }
    } catch (error) {
        console.error('Error creating lobby:', error);
        errorDiv.textContent = 'Error creating lobby. Using fallback...';
        // Fallback to localStorage
        const existing = localStorage.getItem(`lobby_${lobbyName}`);
        if (existing) {
            errorDiv.textContent = 'Lobby name already taken!';
            return;
        }
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
        localStorage.setItem('currentLobby', JSON.stringify(currentLobby));
        localStorage.setItem(`lobby_${lobbyName}`, JSON.stringify(currentLobby));
        displayCurrentLobby();
    }
}

async function loadAvailableLobbies() {
    const lobbiesDiv = document.getElementById('available-lobbies');
    lobbiesDiv.innerHTML = '<p style="color: #FFD700;">Loading lobbies...</p>';
    
    try {
        const response = await fetch('/api/lobbies');
        const data = await response.json();
        
        if (data.lobbies.length === 0) {
            lobbiesDiv.innerHTML = '<p style="color: #FFD700;">No available lobbies. Create one or ask a friend to create one!</p>';
        } else {
            lobbiesDiv.innerHTML = '';
            data.lobbies.forEach(lobby => {
                const lobbyDiv = document.createElement('div');
                lobbyDiv.className = 'lobby-item';
                lobbyDiv.style.cssText = 'padding: 15px; margin: 10px 0; background: rgba(0,0,0,0.5); border: 2px solid #FFD700; border-radius: 10px;';
                lobbyDiv.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 10px;">${lobby.name}</div>
                    <div>Players: ${lobby.playerCount}/${lobby.maxPlayers}</div>
                    <button class="btn btn-small" onclick="joinLobbyById('${lobby.id}')" style="margin-top: 10px;">Join</button>
                `;
                lobbiesDiv.appendChild(lobbyDiv);
            });
        }
    } catch (error) {
        console.error('Error loading lobbies:', error);
        lobbiesDiv.innerHTML = '<p style="color: #ff0000;">Error loading lobbies. Using fallback...</p>';
        // Fallback to localStorage
        loadAvailableLobbiesFallback();
    }
}

function loadAvailableLobbiesFallback() {
    const lobbiesDiv = document.getElementById('available-lobbies');
    lobbiesDiv.innerHTML = '';
    const allLobbies = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('lobby_')) {
            try {
                const lobby = JSON.parse(localStorage.getItem(key));
                if (lobby && lobby.name && lobby.players) {
                    if (lobby.players.length < lobby.maxPlayers && 
                        !lobby.players.some(p => p.id === currentUser?.username)) {
                        allLobbies.push(lobby);
                    }
                }
            } catch (e) {}
        }
    }
    if (allLobbies.length === 0) {
        lobbiesDiv.innerHTML = '<p style="color: #FFD700;">No available lobbies.</p>';
    } else {
        allLobbies.forEach(lobby => {
            const lobbyDiv = document.createElement('div');
            lobbyDiv.className = 'lobby-item';
            lobbyDiv.style.cssText = 'padding: 15px; margin: 10px 0; background: rgba(0,0,0,0.5); border: 2px solid #FFD700; border-radius: 10px;';
            lobbyDiv.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 10px;">${lobby.name}</div>
                <div>Players: ${lobby.players.length}/${lobby.maxPlayers}</div>
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

async function joinLobby() {
    const lobbyName = document.getElementById('join-lobby-name').value.trim();
    const password = document.getElementById('join-lobby-password').value;
    const errorDiv = document.getElementById('join-lobby-error');
    
    if (!lobbyName) {
        errorDiv.textContent = 'Please enter a lobby name';
        return;
    }
    
    if (!currentUser || !currentUser.username) {
        errorDiv.textContent = 'You must be logged in to join a lobby';
        return;
    }
    
    // Try to find lobby ID first
    try {
        const response = await fetch('/api/lobbies');
        const data = await response.json();
        const lobby = data.lobbies.find(l => l.name === lobbyName);
        
        if (lobby) {
            const joinResponse = await fetch('/api/lobbies/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lobbyId: lobby.id, password: password || null, username: currentUser.username })
            });
            
            const joinData = await joinResponse.json();
            
            if (joinResponse.ok) {
                currentLobby = joinData.lobby;
                localStorage.setItem('currentLobby', JSON.stringify(currentLobby));
                displayCurrentLobby();
                addLog(`Joined lobby: ${lobbyName}`);
            } else {
                errorDiv.textContent = joinData.error || 'Failed to join lobby';
            }
        } else {
            errorDiv.textContent = 'Lobby not found';
        }
    } catch (error) {
        console.error('Error joining lobby:', error);
        // Fallback to localStorage
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
        } else {
            errorDiv.textContent = 'Lobby not found';
        }
    }
}

function joinLobbyById(lobbyId) {
    document.getElementById('join-lobby-name').value = '';
    // Store lobby ID temporarily
    window.tempLobbyId = lobbyId;
    joinLobby();
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
async function loadFriendsList() {
    loadFriends();
    const friendsDiv = document.getElementById('friends-list');
    friendsDiv.innerHTML = '<p style="color: #FFD700;">Loading...</p>';
    
    if (!currentUser || !currentUser.username) {
        friendsDiv.innerHTML = '<p style="color: #ff0000;">You must be logged in</p>';
        return;
    }
    
    try {
        // Load friends from server
        const friendsResponse = await fetch(`/api/friends/${currentUser.username}`);
        const friendsData = await friendsResponse.json();
        
        // Load friend requests
        const requestsResponse = await fetch(`/api/friends/requests/${currentUser.username}`);
        const requestsData = await requestsResponse.json();
        
        friendsList = friendsData.friends || [];
        friendRequests = requestsData.requests || [];
        
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
        if (friendRequests.length === 0) {
            requestsDiv.innerHTML += '<p style="color: #999;">No pending requests</p>';
        } else {
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
    } catch (error) {
        console.error('Error loading friends:', error);
        // Fallback to localStorage
        loadFriends();
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
    }
}

async function sendFriendRequest() {
    const username = document.getElementById('friend-username-input').value.trim();
    const errorDiv = document.getElementById('friends-error');
    
    if (!username) {
        errorDiv.textContent = 'Please enter a username';
        return;
    }
    
    if (!currentUser || !currentUser.username) {
        errorDiv.textContent = 'You must be logged in';
        return;
    }
    
    try {
        const response = await fetch('/api/friends/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: currentUser.username, to: username })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            errorDiv.textContent = '';
            errorDiv.style.color = '#00ff00';
            errorDiv.textContent = `Friend request sent to ${username}!`;
            document.getElementById('friend-username-input').value = '';
            setTimeout(() => {
                errorDiv.textContent = '';
                errorDiv.style.color = '#ff6b6b';
            }, 3000);
        } else {
            errorDiv.textContent = data.error || 'Failed to send request';
        }
    } catch (error) {
        console.error('Error sending friend request:', error);
        errorDiv.textContent = 'Error sending request. Using fallback...';
        // Fallback to localStorage
        sendFriendRequestFallback(username);
    }
}

function sendFriendRequestFallback(username) {
    const allRequests = JSON.parse(localStorage.getItem('allFriendRequests') || '[]');
    if (allRequests.find(r => r.from === currentUser.username && r.to === username)) {
        document.getElementById('friends-error').textContent = 'Request already sent';
        return;
    }
    
    if (username === currentUser.username) {
        errorDiv.textContent = 'Cannot add yourself!';
        return;
    }
    
    allRequests.push({ from: currentUser.username, to: username, status: 'pending', createdAt: new Date() });
    localStorage.setItem('allFriendRequests', JSON.stringify(allRequests));
    document.getElementById('friends-error').textContent = `Friend request sent to ${username}!`;
    document.getElementById('friend-username-input').value = '';
    
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

async function acceptFriendRequest(fromUsername) {
    if (!currentUser || !currentUser.username) return;
    
    try {
        const response = await fetch('/api/friends/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: fromUsername, to: currentUser.username })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addLog(`Accepted friend request from ${fromUsername}`);
            loadFriendsList();
        } else {
            alert(data.error || 'Failed to accept request');
        }
    } catch (error) {
        console.error('Error accepting friend request:', error);
        // Fallback
        const allRequests = JSON.parse(localStorage.getItem('allFriendRequests') || '[]');
        const request = allRequests.find(r => r.from === fromUsername && r.to === currentUser.username);
        if (request) {
            request.status = 'accepted';
            const friends = JSON.parse(localStorage.getItem('friends') || '[]');
            if (!friends.includes(fromUsername)) friends.push(fromUsername);
            localStorage.setItem('friends', JSON.stringify(friends));
            localStorage.setItem('allFriendRequests', JSON.stringify(allRequests));
            loadFriendsList();
        }
    }
}
    loadFriends();
    if (!friendsList.includes(fromUsername)) {
        friendsList.push(fromUsername);
        saveFriends();
    }
    friendRequests = friendRequests.filter(r => r.from !== fromUsername);
    saveFriends();
    loadFriendsList();
}

async function rejectFriendRequest(fromUsername) {
    if (!currentUser || !currentUser.username) return;
    
    try {
        const response = await fetch('/api/friends/reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: fromUsername, to: currentUser.username })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addLog(`Rejected friend request from ${fromUsername}`);
            loadFriendsList();
        } else {
            alert(data.error || 'Failed to reject request');
        }
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        // Fallback
        const allRequests = JSON.parse(localStorage.getItem('allFriendRequests') || '[]');
        const request = allRequests.find(r => r.from === fromUsername && r.to === currentUser.username);
        if (request) {
            request.status = 'rejected';
            localStorage.setItem('allFriendRequests', JSON.stringify(allRequests));
            loadFriendsList();
        }
    }
}
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

