// Authentication and User Management
let currentUser = null;
let playerName = '';

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    const verified = localStorage.getItem('verified');
    if (user && verified === 'true') {
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
    event.target.classList.add('active');
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

async function handleRegister() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    
    errorDiv.textContent = '';
    successDiv.textContent = '';
    
    if (!email || !password) {
        errorDiv.textContent = 'Please fill in all fields';
        return;
    }
    
    if (!email.endsWith('@gmail.com')) {
        errorDiv.textContent = 'Please use a Gmail address';
        return;
    }
    
    try {
        // Send registration request to server
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            successDiv.textContent = 'Registration successful! Check your email for verification link.';
            // Store user (not verified yet)
            localStorage.setItem('user', JSON.stringify({ email }));
            localStorage.setItem('verified', 'false');
        } else {
            errorDiv.textContent = data.error || 'Registration failed';
        }
    } catch (error) {
        // For now, simulate registration (in production, use real email service)
        console.log('Simulating registration...');
        const verificationCode = Math.random().toString(36).substring(7);
        localStorage.setItem('verificationCode', verificationCode);
        localStorage.setItem('user', JSON.stringify({ email }));
        localStorage.setItem('verified', 'false');
        
        // Show verification prompt
        const verifyEmail = prompt(`Verification code (simulated): ${verificationCode}\n\nIn production, this would be sent to your email. Enter the code to verify:`);
        if (verifyEmail === verificationCode) {
            localStorage.setItem('verified', 'true');
            currentUser = { email };
            successDiv.textContent = 'Account verified! You can now login.';
            setTimeout(() => {
                showLogin();
                document.getElementById('login-email').value = email;
            }, 2000);
        } else {
            errorDiv.textContent = 'Invalid verification code';
        }
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.textContent = '';
    
    if (!email || !password) {
        errorDiv.textContent = 'Please fill in all fields';
        return;
    }
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('verified', 'true');
            showScreen('name-screen');
        } else {
            // Simulate login for demo
            currentUser = { email };
            localStorage.setItem('user', JSON.stringify({ email }));
            localStorage.setItem('verified', 'true');
            showScreen('name-screen');
        }
    } catch (error) {
        // Simulate login for demo
        console.log('Simulating login...');
        currentUser = { email };
        localStorage.setItem('user', JSON.stringify({ email }));
        localStorage.setItem('verified', 'true');
        showScreen('name-screen');
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

