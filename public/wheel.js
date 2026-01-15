// Lucky Wheel Feature - Spin once per game
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
    
    // Show spinning animation
    const wheelBtn = document.getElementById('wheel-btn');
    if (wheelBtn) {
        wheelBtn.style.animation = 'spin 2s ease-out';
        wheelBtn.disabled = true;
    }
    
    // Calculate result after animation
    setTimeout(() => {
        const outcomes = [
            { type: 'win', amount: 500, message: '🎉 Big Win! +500 money!' },
            { type: 'win', amount: 300, message: '💰 Nice! +300 money!' },
            { type: 'win', amount: 200, message: '💵 Good! +200 money!' },
            { type: 'win', amount: 100, message: '💴 Small win! +100 money!' },
            { type: 'lose', amount: 100, message: '💸 Lost 100 money!' },
            { type: 'lose', amount: 200, message: '💸 Lost 200 money!' },
            { type: 'neutral', amount: 0, message: '🎲 No change!' },
            { type: 'win', amount: 1000, message: '🏆 JACKPOT! +1000 money!' }
        ];
        
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
        
        if (result.type === 'win') {
            player.money += result.amount;
            addLog(result.message);
        } else if (result.type === 'lose') {
            player.money = Math.max(0, player.money - result.amount);
            addLog(result.message);
        } else {
            addLog(result.message);
        }
        
        // Show result notification
        showWheelResult(result);
        
        // Reset button animation
        if (wheelBtn) {
            wheelBtn.style.animation = '';
        }
        
        updateDisplay();
    }, 2000);
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
    }, 3000);
}

// Make globally available
window.spinWheel = spinWheel;

