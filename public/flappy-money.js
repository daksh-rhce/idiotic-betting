// Flappy Money - Mini Game
let flappyGame = {
    canvas: null,
    ctx: null,
    moneyBag: { x: 100, y: 300, width: 40, height: 30, velocity: 0, gravity: 0.25, horizontalSpeed: 0 },
    pipes: [],
    score: 0,
    gameOver: false,
    gameStarted: false,
    pipeGap: 375, // 1.5x larger (250 * 1.5)
    pipeSpeed: 2.5, // Slower (was 3.5)
    lastPipeTime: 0,
    moneyParticles: [],
    theme: 'og',
    flappyPoints: 0, // New currency system
    isFullscreen: false,
    birdXPosition: 100 // Fixed x position for bird
};

// Theme definitions
const FLAPPY_THEMES = {
    og: {
        name: 'Original',
        cost: 0,
        owned: true,
        birdColor: '#8B4513',
        birdSymbol: '💰',
        pipeColor: '#FFD700',
        pipePattern: '💰',
        bgGradient: ['#1a5a1a', '#0d4d0d', '#052505'],
        floorColor: '#FFD700'
    },
    scifi: {
        name: 'Sci-Fi',
        cost: 150,
        owned: false,
        birdColor: '#00FFFF',
        birdSymbol: '🤖',
        pipeColor: '#C0C0C0',
        pipePattern: '⚙️',
        bgGradient: ['#0a0a2e', '#16213e', '#1a1a2e'],
        floorColor: '#4a90e2'
    },
    neon: {
        name: 'Neon',
        cost: 200,
        owned: false,
        birdColor: '#FF00FF',
        birdSymbol: '💜',
        pipeColor: '#00FFFF',
        pipePattern: '✨',
        bgGradient: ['#1a0033', '#330066', '#4d0099'],
        floorColor: '#FF00FF'
    },
    cyberpunk: {
        name: 'Cyberpunk',
        cost: 250,
        owned: false,
        birdColor: '#00FF00',
        birdSymbol: '⚡',
        pipeColor: '#FF0080',
        pipePattern: '🔷',
        bgGradient: ['#000000', '#1a0033', '#330033'],
        floorColor: '#00FF00'
    },
    space: {
        name: 'Space',
        cost: 300,
        owned: false,
        birdColor: '#FFD700',
        birdSymbol: '🚀',
        pipeColor: '#FFFFFF',
        pipePattern: '⭐',
        bgGradient: ['#000428', '#004e92', '#009ffd'],
        floorColor: '#FFD700'
    },
    classic: {
        name: 'Classic',
        cost: 150,
        owned: false,
        birdColor: '#FFA500',
        birdSymbol: '🐦',
        pipeColor: '#228B22',
        pipePattern: '🌿',
        bgGradient: ['#87CEEB', '#98D8C8', '#F7DC6F'],
        floorColor: '#228B22'
    },
    retro: {
        name: 'Retro',
        cost: 180,
        owned: false,
        birdColor: '#FF1493',
        birdSymbol: '🦩',
        pipeColor: '#00CED1',
        pipePattern: '💎',
        bgGradient: ['#FF69B4', '#FF1493', '#8B008B'],
        floorColor: '#00CED1'
    },
    scary: {
        name: 'Scary',
        cost: 200,
        owned: false,
        birdColor: '#8B0000',
        birdSymbol: '🦇',
        pipeColor: '#2F2F2F',
        pipePattern: '💀',
        bgGradient: ['#1a1a1a', '#000000', '#2d0000'],
        floorColor: '#8B0000'
    },
    dodgy: {
        name: 'Dodgy',
        cost: 220,
        owned: false,
        birdColor: '#FFD700',
        birdSymbol: '🦜',
        pipeColor: '#8B4513',
        pipePattern: '💸',
        bgGradient: ['#654321', '#8B4513', '#A0522D'],
        floorColor: '#FFD700'
    },
    cat: {
        name: 'Cat',
        cost: 250,
        owned: false,
        birdColor: '#FFA500',
        birdSymbol: '🐱',
        pipeColor: '#FF69B4',
        pipePattern: '🐾',
        bgGradient: ['#FFB6C1', '#FFC0CB', '#FFE4E1'],
        floorColor: '#FF69B4'
    },
    meme: {
        name: 'Meme',
        cost: 280,
        owned: false,
        birdColor: '#00FF00',
        birdSymbol: '🦆',
        pipeColor: '#FFFF00',
        pipePattern: '😂',
        bgGradient: ['#FF00FF', '#00FFFF', '#FFFF00'],
        floorColor: '#FF00FF'
    }
};

function initFlappyMoney() {
    const container = document.getElementById('flappy-money-container');
    if (!container) {
        // Retry after a short delay if container not ready
        setTimeout(initFlappyMoney, 500);
        return;
    }
    
    // Load themes and points
    loadOwnedThemes();
    
    // Clear container first
    container.innerHTML = '';
    
    // Update points display after container is ready
    setTimeout(() => updateFlappyPointsDisplay(), 100);
    
    // Create canvas - full width responsive
    flappyGame.canvas = document.createElement('canvas');
    flappyGame.canvas.id = 'flappy-money-canvas';
    
    // Calculate responsive size - half width (less squashed)
    const containerWidth = container.offsetWidth || window.innerWidth * 0.9;
    const aspectRatio = 600 / 400; // height/width
    flappyGame.canvas.width = Math.min((containerWidth - 40) / 2, 600); // Half width, max 600px
    flappyGame.canvas.height = flappyGame.canvas.width * aspectRatio;
    
    const theme = FLAPPY_THEMES[flappyGame.theme] || FLAPPY_THEMES.og;
    flappyGame.canvas.style.cssText = `
        border: 3px solid ${theme.floorColor};
        border-radius: 10px;
        background: linear-gradient(180deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[1]} 50%, ${theme.bgGradient[2]} 100%);
        cursor: pointer;
        box-shadow: 0 0 20px ${theme.floorColor}80;
        display: block;
        margin: 0 auto;
        width: 100%;
        max-width: 100%;
        height: auto;
    `;
    
    // Handle window resize
    const resizeCanvas = () => {
        const containerWidth = container.offsetWidth || window.innerWidth * 0.9;
        const aspectRatio = 600 / 400;
        const newWidth = Math.min((containerWidth - 40) / 2, 600); // Half width
        const newHeight = newWidth * aspectRatio;
        
        if (flappyGame.canvas.width !== newWidth || flappyGame.canvas.height !== newHeight) {
            flappyGame.canvas.width = newWidth;
            flappyGame.canvas.height = newHeight;
        }
    };
    
    window.addEventListener('resize', resizeCanvas);
    
    flappyGame.ctx = flappyGame.canvas.getContext('2d');
    container.appendChild(flappyGame.canvas);
    
    // Reset game
    resetFlappyGame();
    
    // Event listeners
    flappyGame.canvas.addEventListener('click', jumpMoneyBag);
    flappyGame.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        jumpMoneyBag();
    });
    
    // Spacebar support (works always, especially useful in fullscreen)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            jumpMoneyBag();
        }
    });
    
    // Start game loop
    gameLoop();
}

function resetFlappyGame() {
    flappyGame.moneyBag = { x: flappyGame.birdXPosition, y: 300, width: 40, height: 30, velocity: 0, gravity: 0.25, horizontalSpeed: 0 };
    flappyGame.pipes = [];
    flappyGame.score = 0;
    flappyGame.gameOver = false;
    flappyGame.gameStarted = false;
    flappyGame.lastPipeTime = 0;
    flappyGame.moneyParticles = [];
}

function jumpMoneyBag() {
    if (!flappyGame.gameStarted) {
        flappyGame.gameStarted = true;
    }
    if (flappyGame.gameOver) {
        resetFlappyGame();
        return;
    }
    flappyGame.moneyBag.velocity = -11; // Jump higher (was -9)
    // Same forward movement regardless of fullscreen (fullscreen is just bigger)
    flappyGame.moneyBag.horizontalSpeed = 0.6; // Slower forward movement
}

function updateFlappyGame() {
    if (!flappyGame.gameStarted || flappyGame.gameOver) return;
    
    // Update money bag
    flappyGame.moneyBag.velocity += flappyGame.moneyBag.gravity;
    flappyGame.moneyBag.y += flappyGame.moneyBag.velocity;
    
    // Keep bird at fixed x position (background moves instead) - same for fullscreen and normal
    flappyGame.moneyBag.x = flappyGame.birdXPosition;
    
    // Apply horizontal movement (forward momentum) - but keep bird centered
    if (flappyGame.moneyBag.horizontalSpeed > 0) {
        // Move background/pipes backward instead of bird forward
        flappyGame.moneyBag.horizontalSpeed *= 0.95; // Gradually slow down
    }
    
    // Check boundaries
    if (flappyGame.moneyBag.y < 0) {
        flappyGame.moneyBag.y = 0;
        flappyGame.moneyBag.velocity = 0;
    }
    if (flappyGame.moneyBag.y + flappyGame.moneyBag.height > flappyGame.canvas.height - 60) {
        flappyGame.moneyBag.y = flappyGame.canvas.height - 60 - flappyGame.moneyBag.height;
        gameOverFlappy();
    }
    
            // Update pipes - faster spawning
    const now = Date.now();
    if (now - flappyGame.lastPipeTime > 2000) { // Faster pipe spawning (was 2800)
        createPipe();
        flappyGame.lastPipeTime = now;
    }
    
    // Calculate background movement speed (matches bird forward movement)
    const backgroundSpeed = flappyGame.pipeSpeed + (flappyGame.moneyBag.horizontalSpeed * 0.5);
    
    flappyGame.pipes.forEach((pipe, index) => {
        // Move pipes backward at speed matching bird's forward movement
        pipe.x -= backgroundSpeed;
        
        // Check collision
        if (flappyGame.moneyBag.x < pipe.x + pipe.width &&
            flappyGame.moneyBag.x + flappyGame.moneyBag.width > pipe.x &&
            (flappyGame.moneyBag.y < pipe.topHeight ||
             flappyGame.moneyBag.y + flappyGame.moneyBag.height > pipe.topHeight + flappyGame.pipeGap)) {
            gameOverFlappy();
        }
        
        // Score point and give money
        if (pipe.x + pipe.width < flappyGame.moneyBag.x && !pipe.passed) {
            pipe.passed = true;
            flappyGame.score++;
            // Earn 1 flappy point per pipe passed (in real-time)
            flappyGame.flappyPoints += 1;
            saveFlappyPoints();
            updateFlappyPointsDisplay();
            createMoneyParticle(pipe.x + pipe.width / 2, pipe.topHeight + flappyGame.pipeGap / 2);
        }
        
        // Remove off-screen pipes
        if (pipe.x + pipe.width < 0) {
            flappyGame.pipes.splice(index, 1);
        }
    });
    
    // Update particles
    flappyGame.moneyParticles = flappyGame.moneyParticles.filter(particle => {
        particle.y += particle.velocity;
        particle.life--;
        return particle.life > 0;
    });
}

function createPipe() {
    const topHeight = Math.random() * (flappyGame.canvas.height - flappyGame.pipeGap - 120) + 60;
    flappyGame.pipes.push({
        x: flappyGame.canvas.width,
        width: 90, // Wider pipes (was 60)
        topHeight: topHeight,
        passed: false
    });
}

function createMoneyParticle(x, y) {
    for (let i = 0; i < 5; i++) {
        flappyGame.moneyParticles.push({
            x: x,
            y: y,
            velocity: (Math.random() - 0.5) * 4,
            life: 30
        });
    }
}

function gameOverFlappy() {
    if (flappyGame.gameOver) return; // Prevent multiple calls
    flappyGame.gameOver = true;
    
    // Give bonus money based on score
    if (typeof gameState !== 'undefined' && gameState.players && gameState.players[gameState.playerId]) {
        const player = gameState.players[gameState.playerId];
        const bonusMoney = flappyGame.score * 10; // 10 money per point
        player.money += bonusMoney;
        if (typeof addLog === 'function') {
            addLog(`🎮 Game Over! Score: ${flappyGame.score}. Bonus: +${bonusMoney} money! Total Flappy Points: ${flappyGame.flappyPoints}`);
        }
        if (typeof updateDisplay === 'function') {
            updateDisplay();
        }
    } else {
        if (typeof addLog === 'function') {
            addLog(`🎮 Game Over! Total Flappy Points: ${flappyGame.flappyPoints}`);
        }
    }
    updateFlappyPointsDisplay();
}

function drawFlappyGame() {
    if (!flappyGame.ctx || !flappyGame.canvas) return;
    
    const ctx = flappyGame.ctx;
    const canvas = flappyGame.canvas;
    const theme = FLAPPY_THEMES[flappyGame.theme] || FLAPPY_THEMES.og;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background with theme gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, theme.bgGradient[0]);
    gradient.addColorStop(0.5, theme.bgGradient[1]);
    gradient.addColorStop(1, theme.bgGradient[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background symbols (theme-specific)
    ctx.fillStyle = theme.pipeColor + '33'; // 33 = 20% opacity
    ctx.font = 'bold 18px Arial';
    for (let i = 0; i < 8; i++) {
        const x = (i * 40) % canvas.width;
        const y = (i * 50 + Date.now() / 50) % (canvas.height - 50);
        ctx.fillText(theme.pipePattern, x, y);
    }
    
    // Draw floor (theme color)
    ctx.fillStyle = theme.floorColor;
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    // Draw floor pattern
    ctx.fillStyle = theme.pipeColor;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    for (let i = 20; i < canvas.width; i += 40) {
        ctx.fillText(theme.pipePattern, i, canvas.height - 30);
    }
    ctx.textAlign = 'left';
    
    // Draw floor border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 60);
    ctx.lineTo(canvas.width, canvas.height - 60);
    ctx.stroke();
    
    // Draw pipes (theme-specific)
    flappyGame.pipes.forEach(pipe => {
        // Top pipe
        drawMoneyPipe(pipe.x, 0, pipe.width, pipe.topHeight, ctx, theme);
        // Bottom pipe
        drawMoneyPipe(pipe.x, pipe.topHeight + flappyGame.pipeGap, pipe.width, canvas.height - (pipe.topHeight + flappyGame.pipeGap) - 60, ctx, theme);
    });
    
    // Draw bird (theme-specific)
    drawMoneyBag(flappyGame.moneyBag.x, flappyGame.moneyBag.y, flappyGame.moneyBag.width, flappyGame.moneyBag.height, ctx, theme);
    
    // Draw particles
    flappyGame.moneyParticles.forEach(particle => {
        ctx.fillStyle = theme.pipeColor;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(theme.pipePattern, particle.x, particle.y);
    });
    
    // Draw score
    ctx.fillStyle = theme.floorColor;
    ctx.font = 'bold 24px Arial';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(`Score: ${flappyGame.score}`, 10, 30);
    ctx.fillText(`Score: ${flappyGame.score}`, 10, 30);
    
    // Draw game over or start message
    if (flappyGame.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText(`Score: ${flappyGame.score}`, canvas.width / 2, canvas.height / 2);
        // Points are already given per pipe, no bonus needed
        ctx.fillText('Click to Play Again', canvas.width / 2, canvas.height / 2 + 50);
        ctx.textAlign = 'left';
    } else if (!flappyGame.gameStarted) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💰 Flappy Money 💰', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText('Click to Start!', canvas.width / 2, canvas.height / 2 + 10);
        ctx.textAlign = 'left';
    }
}

function drawMoneyBag(x, y, width, height, ctx, theme) {
    theme = theme || FLAPPY_THEMES[flappyGame.theme] || FLAPPY_THEMES.og;
    
    // Use same proportions as mini version (40x30)
    const birdWidth = 40;
    const birdHeight = 30;
    const scaleX = width / birdWidth;
    const scaleY = height / birdHeight;
    
    if (flappyGame.theme === 'og') {
        // Original money bag
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(x + width / 2, y + height * 0.8, width * 0.4, height * 0.2, 0, 0, 2 * Math.PI);
        ctx.fill();
    } else {
        // Theme-specific bird shape
        ctx.fillStyle = theme.birdColor;
        ctx.beginPath();
        ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add glow effect for non-OG themes
        ctx.shadowBlur = 15;
        ctx.shadowColor = theme.birdColor;
    }
    
    // Draw bird symbol (proportional to size)
    ctx.fillStyle = theme.birdColor;
    const fontSize = Math.min(width, height) * 0.7;
    ctx.font = 'bold ' + fontSize + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(theme.birdSymbol, x + width / 2, y + height / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowBlur = 0;
    
    if (flappyGame.theme === 'og') {
        // Draw bag opening and tie
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height * 0.25, width * 0.35, 0, Math.PI);
        ctx.stroke();
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + width * 0.3, y + height * 0.25);
        ctx.lineTo(x + width * 0.3, y + height * 0.15);
        ctx.moveTo(x + width * 0.7, y + height * 0.25);
        ctx.lineTo(x + width * 0.7, y + height * 0.15);
        ctx.stroke();
    }
}

function drawMoneyPipe(x, y, width, height, ctx, theme) {
    theme = theme || FLAPPY_THEMES[flappyGame.theme] || FLAPPY_THEMES.og;
    
    // Draw pipe with theme color
    ctx.fillStyle = theme.pipeColor;
    ctx.fillRect(x, y, width, height);
    
    // Draw theme pattern
    ctx.fillStyle = theme.bgGradient[1]; // Use darker gradient color for pattern
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    for (let i = 15; i < height; i += 20) {
        for (let j = width / 2; j < width; j += width / 2) {
            ctx.fillText(theme.pipePattern, x + j, y + i);
        }
    }
    ctx.textAlign = 'left';
    
    // Draw vertical lines (pipe effect)
    ctx.strokeStyle = theme.bgGradient[1];
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 10) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i, y + height);
        ctx.stroke();
    }
    
    // Draw border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);
    
    // Draw highlight
    const highlightColor = flappyGame.theme === 'scifi' ? '#FFFFFF' : 
                          flappyGame.theme === 'neon' ? '#FF00FF' :
                          flappyGame.theme === 'cyberpunk' ? '#00FF00' :
                          flappyGame.theme === 'space' ? '#FFD700' : '#ffed4e';
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, width - 4, 10);
}

function gameLoop() {
    updateFlappyGame();
    drawFlappyGame();
    requestAnimationFrame(gameLoop);
}

// Initialize when game screen is shown
function initFlappyMoneyWhenReady() {
    const container = document.getElementById('flappy-money-container');
    const gameScreen = document.getElementById('game-screen');
    
    if (container && gameScreen && gameScreen.classList.contains('active')) {
        // Only init if not already initialized
        if (!flappyGame.canvas) {
            initFlappyMoney();
        }
    } else {
        // Retry after delay
        setTimeout(initFlappyMoneyWhenReady, 1000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initFlappyMoneyWhenReady, 2000);
    });
} else {
    setTimeout(initFlappyMoneyWhenReady, 2000);
}

// Also init when game screen becomes active
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const gameScreen = document.getElementById('game-screen');
            if (gameScreen && gameScreen.classList.contains('active')) {
                setTimeout(initFlappyMoneyWhenReady, 500);
            }
        }
    });
});

// Observe game screen for class changes
const gameScreen = document.getElementById('game-screen');
if (gameScreen) {
    observer.observe(gameScreen, { attributes: true });
}

// Flappy Points Management
function loadFlappyPoints() {
    const saved = localStorage.getItem('flappyPoints');
    if (saved) {
        flappyGame.flappyPoints = parseInt(saved) || 0;
    }
}

function saveFlappyPoints() {
    localStorage.setItem('flappyPoints', flappyGame.flappyPoints.toString());
}

// Theme management
function loadOwnedThemes() {
    const saved = localStorage.getItem('flappyThemes');
    if (saved) {
        const owned = JSON.parse(saved);
        Object.keys(FLAPPY_THEMES).forEach(key => {
            if (owned[key]) {
                FLAPPY_THEMES[key].owned = true;
            }
        });
    }
    // Load current theme
    const currentTheme = localStorage.getItem('flappyCurrentTheme');
    if (currentTheme && FLAPPY_THEMES[currentTheme]) {
        flappyGame.theme = currentTheme;
    }
    // Load flappy points
    loadFlappyPoints();
}

function saveOwnedThemes() {
    const owned = {};
    Object.keys(FLAPPY_THEMES).forEach(key => {
        if (FLAPPY_THEMES[key].owned) {
            owned[key] = true;
        }
    });
    localStorage.setItem('flappyThemes', JSON.stringify(owned));
    localStorage.setItem('flappyCurrentTheme', flappyGame.theme);
    saveFlappyPoints();
}

function showFlappyThemeShop() {
    loadFlappyPoints();
    const player = gameState && gameState.players && gameState.players[gameState.playerId] ? 
                   gameState.players[gameState.playerId] : null;
    
    const overlay = document.createElement('div');
    overlay.id = 'flappy-theme-shop';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 20000;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow-y: auto;
    `;
    
    const shopContent = document.createElement('div');
    shopContent.style.cssText = `
        background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
        border: 5px solid #FFD700;
        border-radius: 20px;
        padding: 30px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    `;
    
    const playerMoney = player ? player.money : 0;
    shopContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="color: #FFD700; font-size: 2em; font-weight: bold;">🎨 Flappy Bird Theme Shop</h2>
            <button onclick="this.closest('#flappy-theme-shop').remove()" style="
                background: #ff0000;
                color: #fff;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                font-size: 1.5em;
                cursor: pointer;
                font-weight: bold;
            ">✕</button>
        </div>
        <div style="color: #FFD700; font-size: 1.2em; margin-bottom: 10px; font-weight: bold;">
            🎮 Flappy Points: ${flappyGame.flappyPoints}
        </div>
        ${player ? `<div style="color: #FFD700; font-size: 1.2em; margin-bottom: 20px; font-weight: bold;">
            💰 Game Money: ${playerMoney}
        </div>` : ''}
        <div style="background: rgba(255,215,0,0.1); border: 2px solid #FFD700; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
            <h3 style="color: #FFD700; margin-bottom: 10px; font-weight: bold;">Trade Options:</h3>
            <button onclick="tradeFlappyPointsForCash()" style="
                background: ${flappyGame.flappyPoints >= 10 ? '#00FF00' : '#666'};
                color: #000;
                border: none;
                padding: 10px 20px;
                border-radius: 10px;
                font-weight: bold;
                cursor: ${flappyGame.flappyPoints >= 10 ? 'pointer' : 'not-allowed'};
                margin-right: 10px;
                opacity: ${flappyGame.flappyPoints >= 10 ? '1' : '0.5'};
            ">10 Points → 5 Cash</button>
        </div>
        <div id="theme-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
        </div>
    `;
    
    const themeList = shopContent.querySelector('#theme-list');
    
    Object.keys(FLAPPY_THEMES).forEach(themeKey => {
        const theme = FLAPPY_THEMES[themeKey];
        const themeCard = document.createElement('div');
        themeCard.style.cssText = `
            background: linear-gradient(135deg, ${theme.bgGradient[0]} 0%, ${theme.bgGradient[2]} 100%);
            border: 3px solid ${theme.owned ? '#00FF00' : '#FFD700'};
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            cursor: ${theme.owned ? 'pointer' : 'default'};
            opacity: ${theme.owned ? '1' : '0.7'};
        `;
        
        const canBuyWithPoints = flappyGame.flappyPoints >= theme.cost;
        const canBuyWithMoney = player && player.money >= theme.cost;
        
        themeCard.innerHTML = `
            <div style="font-size: 3em; margin-bottom: 10px;">${theme.birdSymbol}</div>
            <h3 style="color: #FFD700; font-weight: bold; margin-bottom: 10px;">${theme.name}</h3>
            ${theme.owned ? 
                `<div style="color: #00FF00; font-weight: bold; margin-bottom: 10px;">✓ OWNED</div>
                 <button onclick="selectFlappyTheme('${themeKey}')" style="
                     background: #00FF00;
                     color: #000;
                     border: none;
                     padding: 10px 20px;
                     border-radius: 10px;
                     font-weight: bold;
                     cursor: pointer;
                     ${flappyGame.theme === themeKey ? 'opacity: 0.5; cursor: not-allowed;' : ''}
                 ">${flappyGame.theme === themeKey ? 'CURRENT' : 'SELECT'}</button>` :
                `<div style="color: #FFD700; font-weight: bold; margin-bottom: 10px;">
                    Cost: ${theme.cost === 0 ? 'FREE' : '🎮 ' + theme.cost + ' Flappy Points'}
                </div>
                 <button onclick="buyFlappyThemeWithPoints('${themeKey}')" style="
                     background: ${canBuyWithPoints ? '#FFD700' : '#666'};
                     color: #000;
                     border: none;
                     padding: 10px 20px;
                     border-radius: 10px;
                     font-weight: bold;
                     cursor: ${canBuyWithPoints ? 'pointer' : 'not-allowed'};
                     opacity: ${canBuyWithPoints ? '1' : '0.5'};
                 ">${canBuyWithPoints ? 'BUY' : 'NEED ' + theme.cost + ' POINTS'}</button>
                `
            }
        `;
        
        themeList.appendChild(themeCard);
    });
    
    overlay.appendChild(shopContent);
    document.body.appendChild(overlay);
}

function buyFlappyTheme(themeKey) {
    const theme = FLAPPY_THEMES[themeKey];
    if (!theme || theme.owned) return;
    
    const player = gameState && gameState.players && gameState.players[gameState.playerId] ? 
                   gameState.players[gameState.playerId] : null;
    if (!player) {
        alert('You need to be in a game to buy themes with money!');
        return;
    }
    
    if (player.money < theme.cost) {
        alert(`You need ${theme.cost} money to buy this theme!`);
        return;
    }
    
    player.money -= theme.cost;
    theme.owned = true;
    saveOwnedThemes();
    
    if (typeof addLog === 'function') {
        addLog(`🎨 Purchased ${theme.name} theme for ${theme.cost} money!`);
    }
    if (typeof updateDisplay === 'function') {
        updateDisplay();
    }
    
    // Refresh shop
    document.getElementById('flappy-theme-shop').remove();
    showFlappyThemeShop();
}

function buyFlappyThemeWithPoints(themeKey) {
    const theme = FLAPPY_THEMES[themeKey];
    if (!theme || theme.owned) return;
    
    if (flappyGame.flappyPoints < theme.cost) {
        alert(`You need ${theme.cost} flappy points to buy this theme!`);
        return;
    }
    
    flappyGame.flappyPoints -= theme.cost;
    theme.owned = true;
    saveOwnedThemes();
    
    if (typeof addLog === 'function') {
        addLog(`🎨 Purchased ${theme.name} theme for ${theme.cost} flappy points!`);
    }
    if (typeof updateDisplay === 'function') {
        updateDisplay();
    }
    
    // Refresh shop
    document.getElementById('flappy-theme-shop').remove();
    showFlappyThemeShop();
}

function tradeFlappyPointsForCash() {
    loadFlappyPoints();
    if (flappyGame.flappyPoints < 10) {
        alert('You need at least 10 flappy points to trade!');
        return;
    }
    
    const amountStr = prompt(`Enter amount of flappy points to trade (10 points = 5 cash).\nYou have: ${flappyGame.flappyPoints} points\nMinimum: 10 points`);
    if (!amountStr) return;
    
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount < 10) {
        alert('Please enter a valid amount (minimum 10 points)!');
        return;
    }
    
    if (amount % 10 !== 0) {
        alert('You can only trade in multiples of 10 flappy points!');
        return;
    }
    
    if (amount > flappyGame.flappyPoints) {
        alert(`You don't have enough points! You have ${flappyGame.flappyPoints} points.`);
        return;
    }
    
    const player = gameState && gameState.players && gameState.players[gameState.playerId] ? 
                   gameState.players[gameState.playerId] : null;
    if (!player) {
        alert('You need to be in a game to trade points for cash!');
        return;
    }
    
    const cashEarned = (amount / 10) * 5;
    flappyGame.flappyPoints -= amount;
    player.money += cashEarned;
    saveFlappyPoints();
    
    if (typeof addLog === 'function') {
        addLog(`💰 Traded ${amount} flappy points for ${cashEarned} cash! (Points remaining: ${flappyGame.flappyPoints})`);
    }
    if (typeof updateDisplay === 'function') {
        updateDisplay();
    }
    
    // Refresh shop
    const shop = document.getElementById('flappy-theme-shop');
    if (shop) shop.remove();
    showFlappyThemeShop();
}


function selectFlappyTheme(themeKey) {
    if (!FLAPPY_THEMES[themeKey] || !FLAPPY_THEMES[themeKey].owned) return;
    if (flappyGame.theme === themeKey) return;
    
    flappyGame.theme = themeKey;
    saveOwnedThemes();
    
    if (typeof addLog === 'function') {
        addLog(`🎨 Switched to ${FLAPPY_THEMES[themeKey].name} theme!`);
    }
    
    // Close shop
    const shop = document.getElementById('flappy-theme-shop');
    if (shop) shop.remove();
}

// Make globally available
window.initFlappyMoney = initFlappyMoney;
window.resetFlappyGame = resetFlappyGame;
window.showFlappyThemeShop = showFlappyThemeShop;
window.buyFlappyTheme = buyFlappyTheme;
window.buyFlappyThemeWithPoints = buyFlappyThemeWithPoints;
window.selectFlappyTheme = selectFlappyTheme;
window.tradeFlappyPointsForCash = tradeFlappyPointsForCash;

    // Load themes on init
loadOwnedThemes();

// Update flappy points display
function updateFlappyPointsDisplay() {
    const display = document.getElementById('flappy-points-count');
    if (display) {
        loadFlappyPoints();
        display.textContent = flappyGame.flappyPoints;
    }
}

// Update display periodically and on events
setInterval(updateFlappyPointsDisplay, 1000); // Update every second

// Also update when game state changes
if (typeof updateDisplay === 'function') {
    const originalUpdateDisplay = updateDisplay;
    updateDisplay = function() {
        originalUpdateDisplay();
        updateFlappyPointsDisplay();
    };
}

// Update on game events
const originalGameOver = gameOverFlappy;
gameOverFlappy = function() {
    originalGameOver();
    updateFlappyPointsDisplay();
};

// Fullscreen functionality
function toggleFlappyFullscreen() {
    if (!flappyGame.canvas) return;
    
    if (!flappyGame.isFullscreen) {
        // Enter fullscreen
        const canvas = flappyGame.canvas;
        
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        } else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen();
        }
        
        // Resize canvas to fullscreen
        const resizeFullscreen = () => {
            if (document.fullscreenElement || document.webkitFullscreenElement || 
                document.mozFullScreenElement || document.msFullscreenElement) {
                flappyGame.canvas.width = window.innerWidth;
                flappyGame.canvas.height = window.innerHeight;
                flappyGame.isFullscreen = true;
                // Reset bird position when entering fullscreen
                flappyGame.moneyBag.x = 100;
            }
        };
        
        canvas.addEventListener('fullscreenchange', resizeFullscreen);
        canvas.addEventListener('webkitfullscreenchange', resizeFullscreen);
        canvas.addEventListener('mozfullscreenchange', resizeFullscreen);
        canvas.addEventListener('MSFullscreenChange', resizeFullscreen);
        
        resizeFullscreen();
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        flappyGame.isFullscreen = false;
        
        // Restore canvas size
        setTimeout(() => {
            const container = document.getElementById('flappy-money-container');
            if (container) {
                const containerWidth = container.offsetWidth || window.innerWidth * 0.9;
                const aspectRatio = 600 / 400;
                const newWidth = Math.min((containerWidth - 40) / 2, 600);
                const newHeight = newWidth * aspectRatio;
                flappyGame.canvas.width = newWidth;
                flappyGame.canvas.height = newHeight;
            }
        }, 100);
    }
}

// Handle fullscreen exit
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        flappyGame.isFullscreen = false;
        const container = document.getElementById('flappy-money-container');
        if (container && flappyGame.canvas) {
            const containerWidth = container.offsetWidth || window.innerWidth * 0.9;
            const aspectRatio = 600 / 400;
            const newWidth = Math.min((containerWidth - 40) / 2, 600);
            const newHeight = newWidth * aspectRatio;
            flappyGame.canvas.width = newWidth;
            flappyGame.canvas.height = newHeight;
        }
    }
});

document.addEventListener('webkitfullscreenchange', () => {
    if (!document.webkitFullscreenElement) {
        flappyGame.isFullscreen = false;
        const container = document.getElementById('flappy-money-container');
        if (container && flappyGame.canvas) {
            const containerWidth = container.offsetWidth || window.innerWidth * 0.9;
            const aspectRatio = 600 / 400;
            const newWidth = Math.min((containerWidth - 40) / 2, 600);
            const newHeight = newWidth * aspectRatio;
            flappyGame.canvas.width = newWidth;
            flappyGame.canvas.height = newHeight;
        }
    }
});

