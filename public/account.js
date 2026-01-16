// Account Management System
let isAdmin = false;
let adminPanelVisible = false;

// Check if user is admin
function checkAdminStatus() {
    const adminCode = localStorage.getItem('adminCode');
    if (adminCode === 'iwanttobeanadminalot') {
        isAdmin = true;
        showAdminPanel();
    }
}

// Redeem code function
function redeemCode() {
    const codeInput = document.getElementById('redeem-code-input') || document.getElementById('redeem-code-input-game');
    const code = codeInput ? codeInput.value.trim() : '';
    
    if (code === 'iwanttobeanadminalot') {
        localStorage.setItem('adminCode', code);
        isAdmin = true;
        alert('🎉 Admin access granted! Admin panel unlocked!');
        showAdminPanel();
        if (codeInput) codeInput.value = '';
    } else {
        alert('Invalid redeem code!');
    }
}

// Show admin panel
function showAdminPanel() {
    if (!isAdmin) return;
    
    let adminPanel = document.getElementById('admin-panel');
    if (!adminPanel) {
        adminPanel = document.createElement('div');
        adminPanel.id = 'admin-panel';
        adminPanel.className = 'admin-panel';
        adminPanel.innerHTML = `
            <div class="admin-panel-header">
                <h3>👑 Admin Panel</h3>
                <button class="btn btn-small" onclick="toggleAdminPanel()">Hide</button>
            </div>
            <div class="admin-panel-content">
                <div class="admin-section">
                    <h4>Money Controls</h4>
                    <button class="btn btn-small" onclick="adminAddMoney(1000)">+1000 Money</button>
                    <button class="btn btn-small" onclick="adminAddMoney(5000)">+5000 Money</button>
                    <button class="btn btn-small" onclick="adminAddMoney(10000)">+10000 Money</button>
                    <button class="btn btn-small" onclick="adminSetMoney(999999)">Set to 999,999</button>
                </div>
                <div class="admin-section">
                    <h4>Flappy Points</h4>
                    <button class="btn btn-small" onclick="adminAddFlappyPoints(1000)">+1000 Points</button>
                    <button class="btn btn-small" onclick="adminAddFlappyPoints(5000)">+5000 Points</button>
                    <button class="btn btn-small" onclick="adminSetFlappyPoints(999999)">Set to 999,999</button>
                </div>
                <div class="admin-section">
                    <h4>Chaos Cards</h4>
                    <button class="btn btn-small" onclick="adminAddChaosCards(5)">+5 Cards</button>
                    <button class="btn btn-small" onclick="adminAddChaosCards(10)">+10 Cards</button>
                    <button class="btn btn-small" onclick="adminInfiniteChaosCards()">Infinite Cards</button>
                </div>
                <div class="admin-section">
                    <h4>Properties</h4>
                    <button class="btn btn-small" onclick="adminAddRandomProperty()">Add Random Property</button>
                    <button class="btn btn-small" onclick="adminAddAllProperties()">Add All Properties</button>
                </div>
            </div>
        `;
        document.body.appendChild(adminPanel);
    }
    adminPanel.style.display = 'block';
    adminPanelVisible = true;
}

function toggleAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanelVisible = !adminPanelVisible;
        adminPanel.style.display = adminPanelVisible ? 'block' : 'none';
    }
}

// Admin functions
function adminAddMoney(amount) {
    if (!isAdmin) return;
    const player = gameState.players[gameState.playerId];
    if (player) {
        player.money += amount;
        addLog(`👑 Admin: Added ${amount} money`);
        updateDisplay();
    }
}

function adminSetMoney(amount) {
    if (!isAdmin) return;
    const player = gameState.players[gameState.playerId];
    if (player) {
        player.money = amount;
        addLog(`👑 Admin: Set money to ${amount}`);
        updateDisplay();
    }
}

function adminAddFlappyPoints(amount) {
    if (!isAdmin) return;
    if (typeof flappyGame !== 'undefined' && flappyGame.flappyPoints !== undefined) {
        flappyGame.flappyPoints += amount;
        if (typeof saveFlappyPoints === 'function') saveFlappyPoints();
        if (typeof updateFlappyPointsDisplay === 'function') updateFlappyPointsDisplay();
        addLog(`👑 Admin: Added ${amount} flappy points`);
    }
}

function adminSetFlappyPoints(amount) {
    if (!isAdmin) return;
    if (typeof flappyGame !== 'undefined' && flappyGame.flappyPoints !== undefined) {
        flappyGame.flappyPoints = amount;
        if (typeof saveFlappyPoints === 'function') saveFlappyPoints();
        if (typeof updateFlappyPointsDisplay === 'function') updateFlappyPointsDisplay();
        addLog(`👑 Admin: Set flappy points to ${amount}`);
    }
}

function adminAddChaosCards(count) {
    if (!isAdmin) return;
    const player = gameState.players[gameState.playerId];
    if (player && gameState.chaosDeck && gameState.chaosDeck.length > 0) {
        for (let i = 0; i < count && gameState.chaosDeck.length > 0; i++) {
            player.chaosCards.push(gameState.chaosDeck.pop());
        }
        addLog(`👑 Admin: Added ${count} chaos cards`);
        updateDisplay();
    }
}

let infiniteChaosCardsActive = false;
function adminInfiniteChaosCards() {
    if (!isAdmin) return;
    infiniteChaosCardsActive = !infiniteChaosCardsActive;
    if (infiniteChaosCardsActive) {
        // Intercept chaos card removal
        const originalPlayChaosCard = window.playChaosCard;
        window.playChaosCard = function() {
            const player = gameState.players[gameState.playerId];
            if (player && player.chaosCards.length > 0) {
                // Don't remove card, just play it
                const card = player.chaosCards[0];
                executeChaosCardEffect(player, card, null);
                addLog(`👑 Infinite chaos cards active - card not consumed`);
                updateDisplay();
            }
        };
        addLog(`👑 Admin: Infinite chaos cards ENABLED`);
    } else {
        addLog(`👑 Admin: Infinite chaos cards DISABLED`);
    }
}

function adminAddRandomProperty() {
    if (!isAdmin) return;
    const player = gameState.players[gameState.playerId];
    if (player && PROPERTY_CARDS && PROPERTY_CARDS.length > 0) {
        const randomProperty = PROPERTY_CARDS[Math.floor(Math.random() * PROPERTY_CARDS.length)];
        player.properties.push({...randomProperty});
        addLog(`👑 Admin: Added property: ${randomProperty.name}`);
        updateDisplay();
    }
}

function adminAddAllProperties() {
    if (!isAdmin) return;
    const player = gameState.players[gameState.playerId];
    if (player && PROPERTY_CARDS) {
        PROPERTY_CARDS.forEach(prop => {
            if (!player.properties.find(p => p.name === prop.name)) {
                player.properties.push({...prop});
            }
        });
        addLog(`👑 Admin: Added all properties`);
        updateDisplay();
    }
}

// Account tab functions
function showAccountTab() {
    const accountTab = document.getElementById('account-tab');
    if (accountTab) {
        accountTab.style.display = 'block';
    }
}

function hideAccountTab() {
    const accountTab = document.getElementById('account-tab');
    if (accountTab) {
        accountTab.style.display = 'none';
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        localStorage.removeItem('playerName');
        localStorage.removeItem('gameState');
        localStorage.removeItem('gamePhase');
        localStorage.removeItem('gameRound');
        currentUser = null;
        playerName = '';
        showScreen('login-screen');
    }
}

// Check admin on load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        checkAdminStatus();
    });
}

function toggleAccountTab() {
    const accountTab = document.getElementById('account-tab');
    if (accountTab) {
        accountTab.style.display = accountTab.style.display === 'none' ? 'block' : 'none';
    }
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.redeemCode = redeemCode;
    window.showAdminPanel = showAdminPanel;
    window.toggleAdminPanel = toggleAdminPanel;
    window.adminAddMoney = adminAddMoney;
    window.adminSetMoney = adminSetMoney;
    window.adminAddFlappyPoints = adminAddFlappyPoints;
    window.adminSetFlappyPoints = adminSetFlappyPoints;
    window.adminAddChaosCards = adminAddChaosCards;
    window.adminInfiniteChaosCards = adminInfiniteChaosCards;
    window.adminAddRandomProperty = adminAddRandomProperty;
    window.adminAddAllProperties = adminAddAllProperties;
    window.logout = logout;
    window.toggleAccountTab = toggleAccountTab;
}

