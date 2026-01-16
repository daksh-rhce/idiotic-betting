// Authentication and User Management
let currentUser = null;
let playerName = '';

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    if (user) {
        currentUser = JSON.parse(user);
        showScreen('name-screen');
        return true;
    }
    return false;
}

function showScreen(screenId) {
    if (!screenId) return;
    
    document.querySelectorAll('.screen').forEach(screen => {
        if (screen) screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    } else {
        console.error(`Screen not found: ${screenId}`);
    }
}

function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    }
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('change-password-form').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}

function showChangePassword() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('change-password-form').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        const changePwdBtn = document.querySelectorAll('.tab-btn')[2];
        if (changePwdBtn) changePwdBtn.classList.add('active');
    }
}

async function handleChangePassword() {
    const username = document.getElementById('change-username').value;
    const oldPassword = document.getElementById('change-old-password').value;
    const newPassword = document.getElementById('change-new-password').value;
    const errorDiv = document.getElementById('change-password-error');
    const successDiv = document.getElementById('change-password-success');
    
    errorDiv.textContent = '';
    successDiv.textContent = '';
    
    if (!username || !oldPassword || !newPassword) {
        errorDiv.textContent = 'Please fill in all fields';
        return;
    }
    
    if (newPassword.length < 6) {
        errorDiv.textContent = 'New password must be at least 6 characters';
        return;
    }
    
    try {
        const response = await fetch('/api/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, oldPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            successDiv.textContent = 'Password changed successfully! You can now login.';
            setTimeout(() => {
                showLogin();
                document.getElementById('login-username').value = username;
                document.getElementById('change-username').value = '';
                document.getElementById('change-old-password').value = '';
                document.getElementById('change-new-password').value = '';
            }, 2000);
        } else {
            errorDiv.textContent = data.error || 'Password change failed';
        }
    } catch (error) {
        // Fallback: check local storage
        const users = JSON.parse(localStorage.getItem('localUsers') || '{}');
        if (users[username] && users[username].password === btoa(oldPassword)) {
            users[username].password = btoa(newPassword);
            localStorage.setItem('localUsers', JSON.stringify(users));
            successDiv.textContent = 'Password changed successfully! You can now login.';
            setTimeout(() => {
                showLogin();
                document.getElementById('login-username').value = username;
                document.getElementById('change-username').value = '';
                document.getElementById('change-old-password').value = '';
                document.getElementById('change-new-password').value = '';
            }, 2000);
        } else {
            errorDiv.textContent = 'Invalid username or current password';
        }
    }
}

async function handleRegister() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    
    errorDiv.textContent = '';
    successDiv.textContent = '';
    
    if (!username || !password) {
        errorDiv.textContent = 'Please fill in all fields';
        return;
    }
    
    if (username.length < 3) {
        errorDiv.textContent = 'Username must be at least 3 characters';
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
        return;
    }
    
    // Clear any existing game state for fresh start
    localStorage.removeItem('gameState');
    localStorage.removeItem('gamePhase');
    localStorage.removeItem('gameRound');
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            successDiv.textContent = 'Registration successful! Starting fresh game...';
            setTimeout(() => {
                showLogin();
                document.getElementById('login-username').value = username;
            }, 1500);
        } else {
            errorDiv.textContent = data.error || 'Registration failed';
        }
    } catch (error) {
        // Fallback: store locally
        const users = JSON.parse(localStorage.getItem('localUsers') || '{}');
        if (users[username]) {
            errorDiv.textContent = 'Username already exists';
            return;
        }
        users[username] = { username, password: btoa(password) }; // Simple encoding (not secure, but works)
        localStorage.setItem('localUsers', JSON.stringify(users));
        successDiv.textContent = 'Registration successful! Starting fresh game...';
        setTimeout(() => {
            showLogin();
            document.getElementById('login-username').value = username;
        }, 1500);
    }
}

async function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.textContent = '';
    
    if (!username || !password) {
        errorDiv.textContent = 'Please fill in all fields';
        return;
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            // Don't save password - only save username for session
            localStorage.setItem('user', JSON.stringify({ username: data.user.username }));
            
            // Check if user wants to continue existing game
            const savedGameState = localStorage.getItem('gameState');
            const savedPhase = localStorage.getItem('gamePhase');
            
            if (savedGameState && savedPhase && savedPhase !== 'setup') {
                const continueGame = confirm('You have a game in progress. Continue? (Cancel to start new game)');
                if (continueGame) {
                    try {
                        const restored = JSON.parse(savedGameState);
                        if (restored.players && restored.players.length > 0) {
                            Object.assign(gameState, restored);
                            playerName = localStorage.getItem('playerName') || 'You';
                            showScreen('game-screen');
                            updateDisplay();
                            addLog('Game restored from previous session!');
                            return;
                        }
                    } catch (e) {
                        console.warn('Could not restore game state:', e);
                    }
                } else {
                    // Clear game state for fresh start
                    localStorage.removeItem('gameState');
                    localStorage.removeItem('gamePhase');
                    localStorage.removeItem('gameRound');
                }
            }
            
            showScreen('name-screen');
        } else {
            errorDiv.textContent = data.error || 'Invalid credentials';
        }
    } catch (error) {
        // Fallback: check local storage (no password saving)
        const users = JSON.parse(localStorage.getItem('localUsers') || '{}');
        if (users[username] && users[username].password === btoa(password)) {
            currentUser = { username };
            // Don't save password - only username
            localStorage.setItem('user', JSON.stringify({ username }));
            
            // Check if user wants to continue existing game
            const savedGameState = localStorage.getItem('gameState');
            const savedPhase = localStorage.getItem('gamePhase');
            
            if (savedGameState && savedPhase && savedPhase !== 'setup') {
                const continueGame = confirm('You have a game in progress. Continue? (Cancel to start new game)');
                if (continueGame) {
                    try {
                        const restored = JSON.parse(savedGameState);
                        if (restored.players && restored.players.length > 0) {
                            Object.assign(gameState, restored);
                            playerName = localStorage.getItem('playerName') || 'You';
                            showScreen('game-screen');
                            updateDisplay();
                            addLog('Game restored from previous session!');
                            return;
                        }
                    } catch (e) {
                        console.warn('Could not restore game state:', e);
                    }
                } else {
                    // Clear game state for fresh start
                    localStorage.removeItem('gameState');
                    localStorage.removeItem('gamePhase');
                    localStorage.removeItem('gameRound');
                }
            }
            
            showScreen('name-screen');
        } else {
            errorDiv.textContent = 'Invalid username or password';
        }
    }
}

function setPlayerName() {
    const nameInput = document.getElementById('player-name-input');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    playerName = name;
    localStorage.setItem('playerName', playerName);
    showScreen('mode-screen');
}

function selectMode(mode) {
    localStorage.setItem('gameMode', mode);
    if (mode === 'solo') {
        initSoloGame();
    } else if (mode === 'online') {
        initOnlineGame();
    } else if (mode === 'minigames') {
        showScreen('minigames-screen');
        if (typeof showMinigamesMenu === 'function') {
            showMinigamesMenu();
        }
    }
}

// Make functions globally available
window.setPlayerName = setPlayerName;
window.selectMode = selectMode;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showChangePassword = showChangePassword;
window.handleChangePassword = handleChangePassword;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Don't auto-restore game - user must login to continue
    // Normal auth flow
    if (!checkAuth()) {
        showScreen('login-screen');
    } else {
        // Check if user wants to continue game (only on explicit login)
        const savedGameState = localStorage.getItem('gameState');
        const savedPhase = localStorage.getItem('gamePhase');
        
        if (savedGameState && savedPhase && savedPhase !== 'setup') {
            // Ask user if they want to continue
            const continueGame = confirm('You have a game in progress. Continue? (Cancel to start new game)');
            if (continueGame) {
                try {
                    const restored = JSON.parse(savedGameState);
                    if (restored.players && restored.players.length > 0) {
                        Object.assign(gameState, restored);
                        playerName = localStorage.getItem('playerName') || 'You';
                        showScreen('game-screen');
                        updateDisplay();
                        addLog('Game restored from previous session!');
                        return;
                    }
                } catch (e) {
                    console.warn('Could not restore game state:', e);
                }
            } else {
                // Clear game state for fresh start
                localStorage.removeItem('gameState');
                localStorage.removeItem('gamePhase');
                localStorage.removeItem('gameRound');
            }
        }
        
        const savedName = localStorage.getItem('playerName');
        if (savedName) {
            playerName = savedName;
            showScreen('mode-screen');
        } else {
            showScreen('name-screen');
        }
    }
});

