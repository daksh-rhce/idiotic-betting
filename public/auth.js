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
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
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
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
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
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            successDiv.textContent = 'Registration successful! You can now login.';
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
        successDiv.textContent = 'Registration successful! You can now login.';
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
            localStorage.setItem('user', JSON.stringify(data.user));
            showScreen('name-screen');
        } else {
            errorDiv.textContent = data.error || 'Invalid credentials';
        }
    } catch (error) {
        // Fallback: check local storage
        const users = JSON.parse(localStorage.getItem('localUsers') || '{}');
        if (users[username] && users[username].password === btoa(password)) {
            currentUser = { username };
            localStorage.setItem('user', JSON.stringify({ username }));
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
    } else {
        initOnlineGame();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) {
        showScreen('login-screen');
    } else {
        const savedName = localStorage.getItem('playerName');
        if (savedName) {
            playerName = savedName;
            showScreen('mode-screen');
        } else {
            showScreen('name-screen');
        }
    }
});

