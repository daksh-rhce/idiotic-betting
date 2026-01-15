// Lucky Wheel Feature - Full Screen Visual Wheel
const WHEEL_OUTCOMES = [
    { type: 'win', amount: 1000, message: '🏆 JACKPOT!', color: '#FFD700', probability: 5 },
    { type: 'win', amount: 500, message: '🎉 Big Win!', color: '#51cf66', probability: 15 },
    { type: 'win', amount: 300, message: '💰 Nice!', color: '#51cf66', probability: 20 },
    { type: 'win', amount: 200, message: '💵 Good!', color: '#51cf66', probability: 20 },
    { type: 'win', amount: 100, message: '💴 Small win!', color: '#51cf66', probability: 15 },
    { type: 'lose', amount: 100, message: '💸 Lost!', color: '#ff6b6b', probability: 10 },
    { type: 'lose', amount: 200, message: '💸 Lost!', color: '#ff6b6b', probability: 10 },
    { type: 'neutral', amount: 0, message: '🎲 No change!', color: '#74b9ff', probability: 5 }
];

function spinWheel() {
    if (gameState.wheelSpun) {
        addLog("You already spun the wheel this game!");
        return;
    }
    
    if (gameState.gameEnded) {
        addLog("Game is over!");
        return;
    }
    
    const player = gameState.players[gameState.playerId];
    if (!player) return;
    
    // Mark as spun
    gameState.wheelSpun = true;
    
    // Show full-screen wheel
    showWheelModal();
}

function showWheelModal() {
    // Create full-screen overlay
    const overlay = document.createElement('div');
    overlay.id = 'wheel-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    `;
    
    // Create wheel container
    const wheelContainer = document.createElement('div');
    wheelContainer.style.cssText = `
        width: 600px;
        height: 600px;
        position: relative;
        margin: 20px;
    `;
    
    // Create canvas for wheel
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    canvas.id = 'wheel-canvas';
    canvas.style.cssText = `
        border-radius: 50%;
        border: 10px solid #FFD700;
        box-shadow: 0 0 50px rgba(255,215,0,0.8);
    `;
    
    // Create spin button
    const spinButton = document.createElement('button');
    spinButton.textContent = 'SPIN!';
    spinButton.style.cssText = `
        padding: 20px 60px;
        font-size: 2em;
        font-weight: bold;
        background: linear-gradient(135deg, #FFD700 0%, #f59f00 100%);
        color: #000;
        border: 5px solid #fff;
        border-radius: 15px;
        cursor: pointer;
        margin-top: 30px;
        box-shadow: 0 0 30px rgba(255,215,0,0.6);
        transition: all 0.3s;
    `;
    
    spinButton.onmouseover = () => {
        spinButton.style.transform = 'scale(1.1)';
        spinButton.style.boxShadow = '0 0 40px rgba(255,215,0,0.9)';
    };
    spinButton.onmouseout = () => {
        spinButton.style.transform = 'scale(1)';
        spinButton.style.boxShadow = '0 0 30px rgba(255,215,0,0.6)';
    };
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        font-size: 2em;
        background: rgba(255,0,0,0.8);
        color: #fff;
        border: 3px solid #fff;
        border-radius: 50%;
        cursor: pointer;
        font-weight: bold;
    `;
    
    closeButton.onclick = () => {
        overlay.remove();
        gameState.wheelSpun = false; // Reset if they close without spinning
    };
    
    // Create info panel
    const infoPanel = document.createElement('div');
    infoPanel.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(0,0,0,0.8);
        padding: 20px;
        border-radius: 10px;
        border: 3px solid #FFD700;
        color: #FFD700;
        font-weight: bold;
        max-width: 300px;
    `;
    infoPanel.innerHTML = '<h3 style="margin-bottom: 10px;">Wheel Outcomes:</h3>';
    WHEEL_OUTCOMES.forEach(outcome => {
        const pct = outcome.probability;
        infoPanel.innerHTML += `
            <div style="margin: 5px 0; font-size: 0.9em;">
                <span style="color: ${outcome.color};">${outcome.message}</span>
                <span style="float: right;">${pct}%</span>
            </div>
        `;
    });
    
    // Draw wheel
    drawWheel(canvas);
    
    // Spin button handler
    let isSpinning = false;
    spinButton.onclick = () => {
        if (isSpinning) return;
        isSpinning = true;
        spinButton.disabled = true;
        spinButton.textContent = 'SPINNING...';
        
        // Spin animation
        spinWheelAnimation(canvas, () => {
            // Get result
            const result = getWheelResult();
            const player = gameState.players[gameState.playerId];
            
            // Apply result
            if (result.type === 'win') {
                player.money += result.amount;
                addLog(`${result.message} +${result.amount} money!`);
            } else if (result.type === 'lose') {
                player.money = Math.max(0, player.money - result.amount);
                addLog(`${result.message} -${result.amount} money!`);
            } else {
                addLog(result.message);
            }
            
            // Show result
            setTimeout(() => {
                overlay.remove();
                showWheelResult(result);
                updateDisplay();
            }, 2000);
        });
    };
    
    // Assemble
    wheelContainer.appendChild(canvas);
    overlay.appendChild(closeButton);
    overlay.appendChild(infoPanel);
    overlay.appendChild(wheelContainer);
    overlay.appendChild(spinButton);
    document.body.appendChild(overlay);
}

function drawWheel(canvas) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 280;
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate total probability
    const totalProb = WHEEL_OUTCOMES.reduce((sum, o) => sum + o.probability, 0);
    
    // Draw segments
    let currentAngle = -Math.PI / 2; // Start at top
    WHEEL_OUTCOMES.forEach((outcome, index) => {
        const angle = (outcome.probability / totalProb) * 2 * Math.PI;
        
        // Draw segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
        ctx.closePath();
        ctx.fillStyle = outcome.color;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw text
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(currentAngle + angle / 2);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(outcome.message, radius * 0.7, 0);
        ctx.fillText(`${outcome.probability}%`, radius * 0.5, 25);
        ctx.restore();
        
        currentAngle += angle;
    });
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 20);
    ctx.lineTo(centerX - 20, centerY - radius - 40);
    ctx.lineTo(centerX + 20, centerY - radius - 40);
    ctx.closePath();
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function spinWheelAnimation(canvas, callback) {
    let rotation = 0;
    const spins = 5 + Math.random() * 3; // 5-8 full spins
    const totalRotation = spins * 2 * Math.PI;
    const duration = 3000; // 3 seconds
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        rotation = totalRotation * easeOut;
        
        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotation);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        
        drawWheel(canvas);
        
        ctx.restore();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            callback();
        }
    }
    
    animate();
}

function getWheelResult() {
    // Weighted random selection based on probability
    const totalProb = WHEEL_OUTCOMES.reduce((sum, o) => sum + o.probability, 0);
    let random = Math.random() * totalProb;
    
    for (const outcome of WHEEL_OUTCOMES) {
        random -= outcome.probability;
        if (random <= 0) {
            return outcome;
        }
    }
    
    return WHEEL_OUTCOMES[0]; // Fallback
}

function showWheelResult(result) {
    const notification = document.createElement('div');
    const isWin = result.type === 'win';
    const isLose = result.type === 'lose';
    
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, ${isWin ? '#51cf66' : isLose ? '#ff6b6b' : '#FFD700'} 0%, ${isWin ? '#2b8a3e' : isLose ? '#c92a2a' : '#f59f00'} 100%);
        border: 5px solid #FFD700;
        border-radius: 20px;
        padding: 40px;
        z-index: 3000;
        max-width: 400px;
        box-shadow: 0 0 50px rgba(255,215,0,0.8);
        text-align: center;
        animation: wheelResultPulse 0.5s;
    `;
    
    notification.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 20px;">${isWin ? '🎉' : isLose ? '💸' : '🎲'}</div>
        <h2 style="color: #fff; font-size: 2em; margin-bottom: 20px; text-shadow: 0 0 20px rgba(0,0,0,0.8); font-weight: bold;">${result.message}</h2>
        ${result.amount !== 0 ? `<p style="color: #fff; font-size: 1.5em; font-weight: bold;">${result.amount > 0 ? '+' : ''}${result.amount} money!</p>` : ''}
        <button onclick="this.parentElement.remove()" style="
            padding: 15px 40px;
            background: #FFD700;
            color: #000;
            border: none;
            border-radius: 10px;
            font-size: 1.2em;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
        ">OK!</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Make globally available
window.spinWheel = spinWheel;
