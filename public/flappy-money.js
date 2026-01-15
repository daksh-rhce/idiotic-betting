// Flappy Money - Mini Game
let flappyGame = {
    canvas: null,
    ctx: null,
    moneyBag: { x: 100, y: 300, width: 50, height: 50, velocity: 0, gravity: 0.4, horizontalSpeed: 0 },
    pipes: [],
    score: 0,
    gameOver: false,
    gameStarted: false,
    pipeGap: 250,
    pipeSpeed: 3,
    lastPipeTime: 0,
    moneyParticles: []
};

function initFlappyMoney() {
    const container = document.getElementById('flappy-money-container');
    if (!container) {
        // Retry after a short delay if container not ready
        setTimeout(initFlappyMoney, 500);
        return;
    }
    
    // Clear container first
    container.innerHTML = '';
    
    // Create canvas - same size as standalone version
    flappyGame.canvas = document.createElement('canvas');
    flappyGame.canvas.id = 'flappy-money-canvas';
    flappyGame.canvas.width = 400;
    flappyGame.canvas.height = 600;
    flappyGame.canvas.style.cssText = `
        border: 3px solid #FFD700;
        border-radius: 10px;
        background: linear-gradient(180deg, #1a5a1a 0%, #0d4d0d 50%, #052505 100%);
        cursor: pointer;
        box-shadow: 0 0 20px rgba(255,215,0,0.5);
        display: block;
        margin: 0 auto;
    `;
    
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
    
    // Start game loop
    gameLoop();
}

function resetFlappyGame() {
    flappyGame.moneyBag = { x: 100, y: 300, width: 50, height: 50, velocity: 0, gravity: 0.3, horizontalSpeed: 0 };
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
    flappyGame.moneyBag.velocity = -9;
    flappyGame.moneyBag.horizontalSpeed = 1.5; // Move forward on jump
}

function updateFlappyGame() {
    if (!flappyGame.gameStarted || flappyGame.gameOver) return;
    
    // Update money bag
    flappyGame.moneyBag.velocity += flappyGame.moneyBag.gravity;
    flappyGame.moneyBag.y += flappyGame.moneyBag.velocity;
    
    // Apply horizontal movement (forward momentum)
    if (flappyGame.moneyBag.horizontalSpeed > 0) {
        flappyGame.moneyBag.x += flappyGame.moneyBag.horizontalSpeed;
        flappyGame.moneyBag.horizontalSpeed *= 0.95; // Gradually slow down
    }
    
    // Keep money bag in bounds horizontally
    if (flappyGame.moneyBag.x < 50) {
        flappyGame.moneyBag.x = 50;
    }
    if (flappyGame.moneyBag.x > flappyGame.canvas.width - flappyGame.moneyBag.width - 50) {
        flappyGame.moneyBag.x = flappyGame.canvas.width - flappyGame.moneyBag.width - 50;
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
    
    // Update pipes - more spaced out
    const now = Date.now();
    if (now - flappyGame.lastPipeTime > 2800) {
        createPipe();
        flappyGame.lastPipeTime = now;
    }
    
    flappyGame.pipes.forEach((pipe, index) => {
        pipe.x -= flappyGame.pipeSpeed;
        
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
            // Give 10 money for each pipe passed
            if (gameState && gameState.players && gameState.players[gameState.playerId]) {
                gameState.players[gameState.playerId].money += 10;
                if (typeof addLog === 'function') {
                    addLog(`💰 Flappy Money: +10 money! (Pipe ${flappyGame.score})`);
                }
                if (typeof updateDisplay === 'function') {
                    updateDisplay();
                }
            }
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
        width: 60,
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
    
    // Give player money bonus based on score (FREE - no cost to play!)
    const bonus = flappyGame.score * 10;
    if (typeof gameState !== 'undefined' && gameState && gameState.players && gameState.players[gameState.playerId]) {
        const player = gameState.players[gameState.playerId];
        const oldMoney = player.money;
        player.money += bonus;
        if (typeof addLog === 'function') {
            addLog(`💰 Flappy Money Bonus: +${bonus} money! (Score: ${flappyGame.score})`);
        }
        if (typeof updateDisplay === 'function') {
            updateDisplay();
        }
    }
}

function drawFlappyGame() {
    if (!flappyGame.ctx || !flappyGame.canvas) return;
    
    const ctx = flappyGame.ctx;
    const canvas = flappyGame.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw money background pattern
    ctx.fillStyle = '#0d4d0d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw money symbols in background (floating)
    ctx.fillStyle = 'rgba(255,215,0,0.15)';
    ctx.font = 'bold 18px Arial';
    for (let i = 0; i < 8; i++) {
        const x = (i * 40) % canvas.width;
        const y = (i * 50 + Date.now() / 50) % (canvas.height - 50);
        ctx.fillText('💰', x, y);
    }
    
    // Draw dollar signs
    ctx.fillStyle = 'rgba(255,215,0,0.1)';
    ctx.font = 'bold 16px Arial';
    for (let i = 0; i < 5; i++) {
        const x = (i * 60 + 20) % canvas.width;
        const y = (i * 70 + Date.now() / 40) % (canvas.height - 50);
        ctx.fillText('$', x, y);
    }
    
    // Draw floor (money pattern)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
    
    // Draw money symbols on floor
    ctx.fillStyle = '#f59f00';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    for (let i = 20; i < canvas.width; i += 40) {
        ctx.fillText('💰', i, canvas.height - 30);
    }
    ctx.textAlign = 'left';
    
    // Draw floor border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 60);
    ctx.lineTo(canvas.width, canvas.height - 60);
    ctx.stroke();
    
    // Draw pipes (money stacks)
    flappyGame.pipes.forEach(pipe => {
        // Top pipe
        drawMoneyPipe(pipe.x, 0, pipe.width, pipe.topHeight, ctx);
        // Bottom pipe
        drawMoneyPipe(pipe.x, pipe.topHeight + flappyGame.pipeGap, pipe.width, canvas.height - (pipe.topHeight + flappyGame.pipeGap) - 60, ctx);
    });
    
    // Draw money bag (player)
    drawMoneyBag(flappyGame.moneyBag.x, flappyGame.moneyBag.y, flappyGame.moneyBag.width, flappyGame.moneyBag.height, ctx);
    
    // Draw particles
    flappyGame.moneyParticles.forEach(particle => {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('💰', particle.x, particle.y);
    });
    
    // Draw score
    ctx.fillStyle = '#FFD700';
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
        ctx.fillText(`Bonus: +${flappyGame.score * 10}💰`, canvas.width / 2, canvas.height / 2 + 20);
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

function drawMoneyBag(x, y, width, height, ctx) {
    // Draw money bag (brown bag shape)
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw bag shadow
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height * 0.8, width * 0.4, height * 0.2, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw money symbol on bag (larger)
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💰', x + width / 2, y + height / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    
    // Draw bag opening (top)
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height * 0.25, width * 0.35, 0, Math.PI);
    ctx.stroke();
    
    // Draw bag tie/string
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.3, y + height * 0.25);
    ctx.lineTo(x + width * 0.3, y + height * 0.15);
    ctx.moveTo(x + width * 0.7, y + height * 0.25);
    ctx.lineTo(x + width * 0.7, y + height * 0.15);
    ctx.stroke();
}

function drawMoneyPipe(x, y, width, height, ctx) {
    // Draw pipe as stack of money (golden)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(x, y, width, height);
    
    // Draw money pattern (dollar signs and money emojis)
    ctx.fillStyle = '#f59f00';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    for (let i = 15; i < height; i += 20) {
        for (let j = width / 2; j < width; j += width / 2) {
            ctx.fillText('💰', x + j, y + i);
        }
    }
    ctx.textAlign = 'left';
    
    // Draw vertical lines (money stack effect)
    ctx.strokeStyle = '#f59f00';
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
    ctx.strokeStyle = '#ffed4e';
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

// Make globally available
window.initFlappyMoney = initFlappyMoney;
window.resetFlappyGame = resetFlappyGame;

