// Minigames System
let minigamesState = {
    currentGame: null,
    playerMoney: 0,
    minigameCharge: 0  // New separate currency for minigames
};

// Get current username for per-user storage
function getCurrentUsername() {
    try {
        const user = localStorage.getItem('user');
        if (user) {
            const userObj = JSON.parse(user);
            return userObj.username || 'default';
        }
    } catch (e) {
        console.error('Error getting username:', e);
    }
    return 'default';
}

// Load minigame charge from localStorage (per username)
function loadMinigameCharge() {
    const username = getCurrentUsername();
    const saved = localStorage.getItem(`minigameCharge_${username}`);
    if (saved) {
        minigamesState.minigameCharge = parseInt(saved) || 0;
    }
    updateMinigameChargeDisplay();
}

// Save minigame charge to localStorage (per username)
function saveMinigameCharge() {
    const username = getCurrentUsername();
    localStorage.setItem(`minigameCharge_${username}`, minigamesState.minigameCharge.toString());
    updateMinigameChargeDisplay();
}

// Update minigame charge display
function updateMinigameChargeDisplay() {
    const display = document.getElementById('minigame-charge-count');
    if (display) {
        display.textContent = minigamesState.minigameCharge;
    }
    const menuDisplay = document.getElementById('menu-charge-display');
    if (menuDisplay) {
        menuDisplay.textContent = minigamesState.minigameCharge;
    }
    const soloDisplay = document.getElementById('solo-charge-count');
    if (soloDisplay) {
        soloDisplay.textContent = minigamesState.minigameCharge;
    }
}

// Add charge (called from minigames)
function addMinigameCharge(amount) {
    minigamesState.minigameCharge += amount;
    saveMinigameCharge();
    if (typeof addLog === 'function') {
        addLog(`⚡ Earned ${amount} minigame charge! (Total: ${minigamesState.minigameCharge})`);
    }
}

// Helper function to get player safely
function getMinigamePlayer() {
    if (typeof gameState === 'undefined' || !gameState.players || typeof gameState.playerId === 'undefined') {
        // Create a temporary player for minigames mode
        if (!minigamesState.tempPlayer) {
            minigamesState.tempPlayer = { money: 1000 };
        }
        return minigamesState.tempPlayer;
    }
    return gameState.players[gameState.playerId];
}

// Helper function to update display
function updateMinigameDisplay() {
    if (typeof updateDisplay === 'function' && typeof gameState !== 'undefined') {
        updateDisplay();
    }
}

// Minigame 1: Slot Machine
function initSlotMachine() {
    const container = document.getElementById('minigame-container');
    if (!container) return;
    loadMinigameCharge();
    container.innerHTML = `
        <div class="minigame-slot-machine">
            <h2>🎰 Slot Machine</h2>
            <div style="color: #FFD700; font-weight: bold; margin-bottom: 10px;">
                ⚡ Your Charge: <span id="slot-charge-display">${minigamesState.minigameCharge}</span>
            </div>
            <div class="slot-display">
                <div class="slot-reel" id="reel1">🍒</div>
                <div class="slot-reel" id="reel2">🍒</div>
                <div class="slot-reel" id="reel3">🍒</div>
            </div>
            <div class="slot-controls">
                <input type="number" id="slot-bet" min="10" value="50" placeholder="Bet charge amount">
                <button class="btn btn-large" onclick="spinSlotMachine()">SPIN</button>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                <button class="btn btn-small" onclick="showMinigamesMenu()">← Back to Minigames</button>
                <button class="btn btn-small" onclick="showMinigameSkinsShop('slot')">🎨 Skins</button>
            </div>
            <div id="slot-result" class="slot-result"></div>
        </div>
    `;
}

function spinSlotMachine() {
    const betInput = document.getElementById('slot-bet');
    const bet = parseInt(betInput.value) || 50;
    
    loadMinigameCharge();
    if (minigamesState.minigameCharge < bet) {
        alert(`Not enough minigame charge! You need ${bet}, but you have ${minigamesState.minigameCharge}. Play Snake to earn charge!`);
        return;
    }
    
    minigamesState.minigameCharge -= bet;
    saveMinigameCharge();
    updateMinigameChargeDisplay();
    
    const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐', '💎', '7️⃣'];
    const reel1 = document.getElementById('reel1');
    const reel2 = document.getElementById('reel2');
    const reel3 = document.getElementById('reel3');
    const resultDiv = document.getElementById('slot-result');
    
    // Animate spinning
    let spins = 0;
    const spinInterval = setInterval(() => {
        reel1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        reel2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        reel3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        spins++;
        if (spins > 20) {
            clearInterval(spinInterval);
            const final1 = symbols[Math.floor(Math.random() * symbols.length)];
            const final2 = symbols[Math.floor(Math.random() * symbols.length)];
            const final3 = symbols[Math.floor(Math.random() * symbols.length)];
            
            reel1.textContent = final1;
            reel2.textContent = final2;
            reel3.textContent = final3;
            
            // Check win
            let win = 0;
            if (final1 === final2 && final2 === final3) {
                if (final1 === '💎') {
                    win = bet * 10; // Diamond jackpot
                } else if (final1 === '7️⃣') {
                    win = bet * 5; // Triple 7
                } else if (final1 === '⭐') {
                    win = bet * 3; // Triple star
                } else {
                    win = bet * 2; // Triple match
                }
            } else if (final1 === final2 || final2 === final3 || final1 === final3) {
                win = bet; // Pair match
            }
            
            if (win > 0) {
                minigamesState.minigameCharge += win;
                resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold; font-size: 1.5em;">WIN! +${win} charge!</div>`;
                addLog(`🎰 Slot Machine: Won ${win} charge!`);
                saveMinigameCharge();
                updateMinigameChargeDisplay();
                const chargeDisplay = document.getElementById('slot-charge-display');
                if (chargeDisplay) chargeDisplay.textContent = minigamesState.minigameCharge;
            } else {
                resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">Lost ${bet} charge</div>`;
                addLog(`🎰 Slot Machine: Lost ${bet} charge`);
            }
            updateMinigameDisplay();
        }
    }, 50);
}

// Minigame 2: Number Guessing
function initNumberGuessing() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-number-guess">
            <h2>🎯 Number Guessing</h2>
            <p>Guess a number between 1-100!</p>
            <input type="number" id="number-bet" min="10" value="50" placeholder="Bet amount">
            <input type="number" id="number-guess" min="1" max="100" placeholder="Your guess (1-100)">
            <button class="btn btn-large" onclick="playNumberGuessing()">GUESS</button>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                <button class="btn btn-small" onclick="showMinigamesMenu()">← Back to Minigames</button>
                <button class="btn btn-small" onclick="showMinigameSkinsShop('number')">🎨 Skins</button>
            </div>
            <div id="number-result" class="number-result"></div>
        </div>
    `;
}

function playNumberGuessing() {
    const betInput = document.getElementById('number-bet');
    const guessInput = document.getElementById('number-guess');
    const bet = parseInt(betInput.value) || 50;
    const guess = parseInt(guessInput.value);
    loadMinigameCharge();
    
    if (minigamesState.minigameCharge < bet) {
        alert('Not enough minigame charge!');
        return;
    }
    
    if (!guess || guess < 1 || guess > 100) {
        alert('Please enter a number between 1-100!');
        return;
    }
    
    minigamesState.minigameCharge -= bet;
    saveMinigameCharge();
    
    const secretNumber = Math.floor(Math.random() * 100) + 1;
    const difference = Math.abs(guess - secretNumber);
    const resultDiv = document.getElementById('number-result');
    
    let win = 0;
    if (difference === 0) {
        win = bet * 5; // Exact match
    } else if (difference <= 5) {
        win = bet * 2; // Very close
    } else if (difference <= 10) {
        win = bet; // Close
    }
    
    if (win > 0) {
        addMinigameCharge(win);
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">Secret number was ${secretNumber}. You guessed ${guess}. WIN! +${win} charge!</div>`;
        addLog(`🎯 Number Guessing: Won ${win} charge!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">Secret number was ${secretNumber}. You guessed ${guess}. Lost ${bet} charge</div>`;
        addLog(`🎯 Number Guessing: Lost ${bet} charge`);
    }
    updateMinigameDisplay();
}

// Minigame 3: Rock Paper Scissors
function initRockPaperScissors() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-rps">
            <h2>✂️ Rock Paper Scissors</h2>
            <input type="number" id="rps-bet" min="10" value="50" placeholder="Bet amount">
            <div class="rps-choices">
                <button class="btn btn-large" onclick="playRPS('rock')">🪨 Rock</button>
                <button class="btn btn-large" onclick="playRPS('paper')">📄 Paper</button>
                <button class="btn btn-large" onclick="playRPS('scissors')">✂️ Scissors</button>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                <button class="btn btn-small" onclick="showMinigamesMenu()">← Back to Minigames</button>
                <button class="btn btn-small" onclick="showMinigameSkinsShop('rps')">🎨 Skins</button>
            </div>
            <div id="rps-result" class="rps-result"></div>
        </div>
    `;
}

function playRPS(choice) {
    const betInput = document.getElementById('rps-bet');
    const bet = parseInt(betInput.value) || 50;
    loadMinigameCharge();
    
    if (minigamesState.minigameCharge < bet) {
        alert('Not enough minigame charge!');
        return;
    }
    
    minigamesState.minigameCharge -= bet;
    saveMinigameCharge();
    updateMinigameDisplay();
    
    const choices = ['rock', 'paper', 'scissors'];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    const resultDiv = document.getElementById('rps-result');
    
    let win = 0;
    if (choice === computerChoice) {
        win = bet; // Tie - get bet back
    } else if (
        (choice === 'rock' && computerChoice === 'scissors') ||
        (choice === 'paper' && computerChoice === 'rock') ||
        (choice === 'scissors' && computerChoice === 'paper')
    ) {
        win = bet * 2; // Win
    }
    
    const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
    if (win > 0) {
        addMinigameCharge(win);
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">You: ${emojis[choice]} vs Computer: ${emojis[computerChoice]}. WIN! +${win} charge!</div>`;
        addLog(`✂️ Rock Paper Scissors: Won ${win} charge!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">You: ${emojis[choice]} vs Computer: ${emojis[computerChoice]}. Lost ${bet} charge</div>`;
        addLog(`✂️ Rock Paper Scissors: Lost ${bet} charge`);
    }
    updateMinigameDisplay();
}

// Minigame 4: Dice Roll
function initDiceRoll() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-dice">
            <h2>🎲 Dice Roll</h2>
            <p>Roll higher than the computer!</p>
            <input type="number" id="dice-bet" min="10" value="50" placeholder="Bet amount">
            <button class="btn btn-large" onclick="playDiceRoll()">ROLL DICE</button>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                <button class="btn btn-small" onclick="showMinigamesMenu()">← Back to Minigames</button>
                <button class="btn btn-small" onclick="showMinigameSkinsShop('dice')">🎨 Skins</button>
            </div>
            <div id="dice-result" class="dice-result"></div>
        </div>
    `;
}

function playDiceRoll() {
    const betInput = document.getElementById('dice-bet');
    const bet = parseInt(betInput.value) || 50;
    loadMinigameCharge();
    
    if (minigamesState.minigameCharge < bet) {
        alert('Not enough minigame charge!');
        return;
    }
    
    minigamesState.minigameCharge -= bet;
    saveMinigameCharge();
    
    const playerRoll = Math.floor(Math.random() * 6) + 1;
    const computerRoll = Math.floor(Math.random() * 6) + 1;
    const resultDiv = document.getElementById('dice-result');
    
    let win = 0;
    if (playerRoll > computerRoll) {
        win = bet * 2; // Win
    } else if (playerRoll === computerRoll) {
        win = bet; // Tie - get bet back
    }
    
    if (win > 0) {
        addMinigameCharge(win);
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">You: ${playerRoll} vs Computer: ${computerRoll}. WIN! +${win} charge!</div>`;
        addLog(`🎲 Dice Roll: Won ${win} charge!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">You: ${playerRoll} vs Computer: ${computerRoll}. Lost ${bet} charge</div>`;
        addLog(`🎲 Dice Roll: Lost ${bet} charge`);
    }
    updateMinigameDisplay();
}

// Minigame 5: Card Flip
function initCardFlip() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-card-flip">
            <h2>🃏 Card Flip</h2>
            <p>Pick a card higher than the dealer!</p>
            <input type="number" id="card-bet" min="10" value="50" placeholder="Bet amount">
            <button class="btn btn-large" onclick="playCardFlip()">FLIP CARD</button>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                <button class="btn btn-small" onclick="showMinigamesMenu()">← Back to Minigames</button>
                <button class="btn btn-small" onclick="showMinigameSkinsShop('card')">🎨 Skins</button>
            </div>
            <div id="card-result" class="card-result"></div>
        </div>
    `;
}

function playCardFlip() {
    const betInput = document.getElementById('card-bet');
    const bet = parseInt(betInput.value) || 50;
    loadMinigameCharge();
    
    if (minigamesState.minigameCharge < bet) {
        alert('Not enough minigame charge!');
        return;
    }
    
    minigamesState.minigameCharge -= bet;
    saveMinigameCharge();
    
    const suits = ['♠️', '♥️', '♦️', '♣️'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const valueOrder = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };
    
    const playerCard = { suit: suits[Math.floor(Math.random() * suits.length)], value: values[Math.floor(Math.random() * values.length)] };
    const dealerCard = { suit: suits[Math.floor(Math.random() * suits.length)], value: values[Math.floor(Math.random() * values.length)] };
    
    const resultDiv = document.getElementById('card-result');
    const playerValue = valueOrder[playerCard.value];
    const dealerValue = valueOrder[dealerCard.value];
    
    let win = 0;
    if (playerValue > dealerValue) {
        win = bet * 2; // Win
    } else if (playerValue === dealerValue) {
        win = bet; // Tie - get bet back
    }
    
    if (win > 0) {
        addMinigameCharge(win);
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">You: ${playerCard.suit}${playerCard.value} vs Dealer: ${dealerCard.suit}${dealerCard.value}. WIN! +${win} charge!</div>`;
        addLog(`🃏 Card Flip: Won ${win} charge!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">You: ${playerCard.suit}${playerCard.value} vs Dealer: ${dealerCard.suit}${dealerCard.value}. Lost ${bet} charge</div>`;
        addLog(`🃏 Card Flip: Lost ${bet} charge`);
    }
    updateMinigameDisplay();
}

// Minigame 6: Coin Flip
function initCoinFlip() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-coin">
            <h2>🪙 Coin Flip</h2>
            <input type="number" id="coin-bet" min="10" value="50" placeholder="Bet amount">
            <div class="coin-choices">
                <button class="btn btn-large" onclick="playCoinFlip('heads')">HEADS</button>
                <button class="btn btn-large" onclick="playCoinFlip('tails')">TAILS</button>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                <button class="btn btn-small" onclick="showMinigamesMenu()">← Back to Minigames</button>
                <button class="btn btn-small" onclick="showMinigameSkinsShop('coin')">🎨 Skins</button>
            </div>
            <div id="coin-result" class="coin-result"></div>
        </div>
    `;
}

function playCoinFlip(choice) {
    const betInput = document.getElementById('coin-bet');
    const bet = parseInt(betInput.value) || 50;
    loadMinigameCharge();
    
    if (minigamesState.minigameCharge < bet) {
        alert('Not enough minigame charge!');
        return;
    }
    
    minigamesState.minigameCharge -= bet;
    saveMinigameCharge();
    
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const resultDiv = document.getElementById('coin-result');
    
    let win = 0;
    if (choice === result) {
        win = bet * 2; // Win
    }
    
    if (win > 0) {
        addMinigameCharge(win);
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">Result: ${result}. You chose ${choice}. WIN! +${win} charge!</div>`;
        addLog(`🪙 Coin Flip: Won ${win} charge!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">Result: ${result}. You chose ${choice}. Lost ${bet} charge</div>`;
        addLog(`🪙 Coin Flip: Lost ${bet} charge`);
    }
    updateMinigameDisplay();
}

// Minigame 7: Memory Game
let memoryGameState = { cards: [], flipped: [], matches: 0, moves: 0 };
function initMemoryGame() {
    const container = document.getElementById('minigame-container');
    const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐'];
    const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    memoryGameState = { cards, flipped: [], matches: 0, moves: 0 };
    
    container.innerHTML = `
        <div class="minigame-memory">
            <h2>🧠 Memory Game</h2>
            <p>Match pairs! Bet: <input type="number" id="memory-bet" min="10" value="50"></p>
            <div style="display: flex; gap: 10px; justify-content: center; margin: 10px 0;">
                <button class="btn btn-small" onclick="showMinigamesMenu()">← Back to Minigames</button>
                <button class="btn btn-small" onclick="showMinigameSkinsShop('memory')">🎨 Skins</button>
            </div>
            <div class="memory-grid" id="memory-grid"></div>
            <div id="memory-result"></div>
        </div>
    `;
    
    const grid = document.getElementById('memory-grid');
    cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.symbol = symbol;
        card.textContent = '?';
        card.onclick = () => flipMemoryCard(index);
        grid.appendChild(card);
    });
}

function flipMemoryCard(index) {
    if (memoryGameState.flipped.length >= 2) return;
    if (memoryGameState.flipped.includes(index)) return;
    
    const card = document.querySelector(`[data-index="${index}"]`);
    card.textContent = memoryGameState.cards[index];
    memoryGameState.flipped.push(index);
    memoryGameState.moves++;
    
    if (memoryGameState.flipped.length === 2) {
        setTimeout(() => {
            const [idx1, idx2] = memoryGameState.flipped;
            if (memoryGameState.cards[idx1] === memoryGameState.cards[idx2]) {
                memoryGameState.matches++;
                document.querySelector(`[data-index="${idx1}"]`).style.opacity = '0.5';
                document.querySelector(`[data-index="${idx2}"]`).style.opacity = '0.5';
            } else {
                document.querySelector(`[data-index="${idx1}"]`).textContent = '?';
                document.querySelector(`[data-index="${idx2}"]`).textContent = '?';
            }
            memoryGameState.flipped = [];
            
            if (memoryGameState.matches === 6) {
                const bet = parseInt(document.getElementById('memory-bet').value) || 50;
                loadMinigameCharge();
                if (minigamesState.minigameCharge < bet) {
                    alert('Not enough minigame charge!');
                    return;
                }
                minigamesState.minigameCharge -= bet;
                saveMinigameCharge();
                const win = bet * 3;
                addMinigameCharge(win);
                document.getElementById('memory-result').innerHTML = `<div style="color: #00ff00; font-weight: bold;">You won! +${win} charge!</div>`;
                addLog(`🧠 Memory Game: Won ${win} charge!`);
                updateMinigameDisplay();
            }
        }, 1000);
    }
}

// Minigame 8: Blackjack (Simplified)
function initBlackjack() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-blackjack">
            <h2>🃏 Blackjack</h2>
            <input type="number" id="bj-bet" min="10" value="50" placeholder="Bet amount">
            <button class="btn btn-large" onclick="startBlackjack()">DEAL</button>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                <button class="btn btn-small" onclick="showMinigamesMenu()">← Back to Minigames</button>
                <button class="btn btn-small" onclick="showMinigameSkinsShop('blackjack')">🎨 Skins</button>
            </div>
            <div id="bj-result"></div>
        </div>
    `;
}

function startBlackjack() {
    const betInput = document.getElementById('bj-bet');
    const bet = parseInt(betInput.value) || 50;
    loadMinigameCharge();
    
    if (minigamesState.minigameCharge < bet) {
        alert('Not enough minigame charge!');
        return;
    }
    
    minigamesState.minigameCharge -= bet;
    saveMinigameCharge();
    
    const getCard = () => Math.min(10, Math.floor(Math.random() * 13) + 1);
    const playerCards = [getCard(), getCard()];
    const dealerCards = [getCard(), getCard()];
    
    const playerTotal = playerCards.reduce((a, b) => a + b, 0);
    const dealerTotal = dealerCards.reduce((a, b) => a + b, 0);
    
    const resultDiv = document.getElementById('bj-result');
    let win = 0;
    
    if (playerTotal === 21) {
        win = bet * 3; // Blackjack
    } else if (playerTotal > 21) {
        win = 0; // Bust
    } else if (dealerTotal > 21) {
        win = bet * 2; // Dealer bust
    } else if (playerTotal > dealerTotal) {
        win = bet * 2; // Win
    } else if (playerTotal === dealerTotal) {
        win = bet; // Push
    }
    
    if (win > 0) {
        addMinigameCharge(win);
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">You: ${playerTotal} vs Dealer: ${dealerTotal}. WIN! +${win} charge!</div>`;
        addLog(`🃏 Blackjack: Won ${win} charge!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">You: ${playerTotal} vs Dealer: ${dealerTotal}. Lost ${bet} charge</div>`;
        addLog(`🃏 Blackjack: Lost ${bet} charge`);
    }
    updateMinigameDisplay();
}

// Minigame 9: Color Guessing
function initColorGuessing() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-color">
            <h2>🎨 Color Guessing</h2>
            <p>Guess the color!</p>
            <input type="number" id="color-bet" min="10" value="50" placeholder="Bet amount">
            <div class="color-choices">
                <button class="btn btn-large" style="background: red;" onclick="playColorGuessing('red')">RED</button>
                <button class="btn btn-large" style="background: black; color: white;" onclick="playColorGuessing('black')">BLACK</button>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                <button class="btn btn-small" onclick="showMinigamesMenu()">← Back to Minigames</button>
                <button class="btn btn-small" onclick="showMinigameSkinsShop('color')">🎨 Skins</button>
            </div>
            <div id="color-result"></div>
        </div>
    `;
}

function playColorGuessing(choice) {
    const betInput = document.getElementById('color-bet');
    const bet = parseInt(betInput.value) || 50;
    loadMinigameCharge();
    
    if (minigamesState.minigameCharge < bet) {
        alert('Not enough minigame charge!');
        return;
    }
    
    minigamesState.minigameCharge -= bet;
    saveMinigameCharge();
    
    const result = Math.random() < 0.5 ? 'red' : 'black';
    const resultDiv = document.getElementById('color-result');
    
    let win = 0;
    if (choice === result) {
        win = bet * 2; // Win
    }
    
    if (win > 0) {
        addMinigameCharge(win);
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">Result: ${result.toUpperCase()}. You chose ${choice.toUpperCase()}. WIN! +${win} charge!</div>`;
        addLog(`🎨 Color Guessing: Won ${win} charge!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">Result: ${result.toUpperCase()}. You chose ${choice.toUpperCase()}. Lost ${bet} charge</div>`;
        addLog(`🎨 Color Guessing: Lost ${bet} charge`);
    }
    updateMinigameDisplay();
}

// Minigame 10: Quick Math
const mathGame = {
    gameStarted: false,
    gameOver: false
};

function initQuickMath() {
    const container = document.getElementById('minigame-container');
    
    // Reset game state
    mathGame.gameStarted = false;
    mathGame.gameOver = false;
    
    const num1 = Math.floor(Math.random() * 50) + 1;
    const num2 = Math.floor(Math.random() * 50) + 1;
    const answer = num1 + num2;
    
    window.currentMathAnswer = answer;
    
    container.innerHTML = `
        <div class="minigame-math">
            <h2>🔢 Quick Math</h2>
            <p id="math-question">Solve: ${num1} + ${num2} = ?</p>
            <input type="number" id="math-bet" min="10" value="50" placeholder="Bet amount" disabled>
            <input type="number" id="math-answer" placeholder="Your answer" disabled>
            <button class="btn btn-large" id="math-submit-btn" onclick="startQuickMathGame()">Start Game</button>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                <button class="btn btn-small" onclick="showMinigamesMenu()">← Back to Minigames</button>
                <button class="btn btn-small" onclick="showMinigameSkinsShop('math')">🎨 Skins</button>
            </div>
            <div id="math-result"></div>
        </div>
    `;
}

function startQuickMathGame() {
    const betInput = document.getElementById('math-bet');
    const answerInput = document.getElementById('math-answer');
    const submitBtn = document.getElementById('math-submit-btn');
    
    // Start the game
    mathGame.gameStarted = true;
    mathGame.gameOver = false;
    
    // Enable inputs and change button
    if (betInput) betInput.disabled = false;
    if (answerInput) answerInput.disabled = false;
    if (submitBtn) {
        submitBtn.textContent = 'SUBMIT';
        submitBtn.onclick = playQuickMath;
    }
    
    // Clear result
    const resultDiv = document.getElementById('math-result');
    if (resultDiv) resultDiv.innerHTML = '';
    
    // Generate new question
    const num1 = Math.floor(Math.random() * 50) + 1;
    const num2 = Math.floor(Math.random() * 50) + 1;
    const answer = num1 + num2;
    window.currentMathAnswer = answer;
    
    const questionEl = document.getElementById('math-question');
    if (questionEl) questionEl.textContent = `Solve: ${num1} + ${num2} = ?`;
}

function playQuickMath() {
    // Check if game is already over
    if (mathGame.gameOver) {
        alert('Game finished! Click "Start Game" to play again.');
        return;
    }
    
    // Check if game has started
    if (!mathGame.gameStarted) {
        startQuickMathGame();
        return;
    }
    
    const betInput = document.getElementById('math-bet');
    const answerInput = document.getElementById('math-answer');
    const submitBtn = document.getElementById('math-submit-btn');
    const bet = parseInt(betInput.value) || 50;
    const answer = parseInt(answerInput.value);
    loadMinigameCharge();
    
    if (minigamesState.minigameCharge < bet) {
        alert('Not enough minigame charge!');
        return;
    }
    
    if (!answer) {
        alert('Please enter an answer!');
        return;
    }
    
    // Mark game as over
    mathGame.gameOver = true;
    mathGame.gameStarted = false;
    
    // Disable inputs and change button
    if (betInput) betInput.disabled = true;
    if (answerInput) answerInput.disabled = true;
    if (submitBtn) {
        submitBtn.textContent = 'Start Game';
        submitBtn.onclick = startQuickMathGame;
    }
    
    minigamesState.minigameCharge -= bet;
    saveMinigameCharge();
    
    const resultDiv = document.getElementById('math-result');
    let win = 0;
    
    if (answer === window.currentMathAnswer) {
        win = bet * 2; // Correct
    }
    
    if (win > 0) {
        addMinigameCharge(win);
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">Correct! Answer was ${window.currentMathAnswer}. WIN! +${win} charge!</div>`;
        addLog(`🔢 Quick Math: Won ${win} charge!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">Wrong! Answer was ${window.currentMathAnswer}. You said ${answer}. Lost ${bet} charge</div>`;
        addLog(`🔢 Quick Math: Lost ${bet} charge`);
    }
    updateMinigameDisplay();
}

// Maze Game Skins System
const MAZE_SKINS = {
    default: {
        name: 'Default Red',
        cost: 0,
        owned: true,
        playerColor: '#FF0000',
        playerSymbol: '●'
    },
    blue: {
        name: 'Blue Skin',
        cost: 150,
        owned: false,
        playerColor: '#0066FF',
        playerSymbol: '●'
    },
    green: {
        name: 'Green Skin',
        cost: 180,
        owned: false,
        playerColor: '#00FF00',
        playerSymbol: '●'
    },
    purple: {
        name: 'Purple Skin',
        cost: 200,
        owned: false,
        playerColor: '#9900FF',
        playerSymbol: '●'
    },
    gold: {
        name: 'Gold Skin',
        cost: 250,
        owned: false,
        playerColor: '#FFD700',
        playerSymbol: '●'
    },
    rainbow: {
        name: 'Rainbow Skin',
        cost: 300,
        owned: false,
        playerColor: '#FF0000',
        playerSymbol: '🌈',
        rainbow: true
    },
    ghost: {
        name: 'Ghost Skin',
        cost: 220,
        owned: false,
        playerColor: '#FFFFFF',
        playerSymbol: '👻'
    },
    robot: {
        name: 'Robot Skin',
        cost: 230,
        owned: false,
        playerColor: '#C0C0C0',
        playerSymbol: '🤖'
    },
    cat: {
        name: 'Cat Skin',
        cost: 240,
        owned: false,
        playerColor: '#FFA500',
        playerSymbol: '🐱'
    },
    ninja: {
        name: 'Ninja Skin',
        cost: 270,
        owned: false,
        playerColor: '#000000',
        playerSymbol: '🥷'
    }
};

let mazeGameSkin = 'default';

function loadMazeSkin() {
    const username = getCurrentUsername();
    const saved = localStorage.getItem(`mazeGameSkin_${username}`);
    if (saved && MAZE_SKINS[saved]) {
        mazeGameSkin = saved;
    }
    // Load owned skins
    const savedOwned = localStorage.getItem(`mazeSkins_${username}`);
    if (savedOwned) {
        try {
            const owned = JSON.parse(savedOwned);
            Object.keys(owned).forEach(key => {
                if (MAZE_SKINS[key]) {
                    MAZE_SKINS[key].owned = true;
                }
            });
        } catch (e) {
            console.error('Error loading maze skins:', e);
        }
    }
}

function saveMazeSkin() {
    const username = getCurrentUsername();
    localStorage.setItem(`mazeGameSkin_${username}`, mazeGameSkin);
    const owned = {};
    Object.keys(MAZE_SKINS).forEach(key => {
        if (MAZE_SKINS[key].owned) {
            owned[key] = true;
        }
    });
    localStorage.setItem(`mazeSkins_${username}`, JSON.stringify(owned));
}

function showMazeSkinsShop() {
    loadMazeSkin();
    loadMinigameCharge();
    
    const overlay = document.createElement('div');
    overlay.id = 'maze-skins-shop';
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
    
    shopContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="color: #FFD700; font-size: 2em; font-weight: bold;">🎨 Maze Game Skins Shop</h2>
            <button onclick="this.closest('#maze-skins-shop').remove()" style="
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
        <div style="color: #FFD700; font-size: 1.2em; margin-bottom: 20px; font-weight: bold;">
            ⚡ Minigame Charge: ${minigamesState.minigameCharge}
        </div>
        <div id="maze-skin-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
        </div>
    `;
    
    const skinList = shopContent.querySelector('#maze-skin-list');
    
    Object.keys(MAZE_SKINS).forEach(skinKey => {
        const skin = MAZE_SKINS[skinKey];
        const skinCard = document.createElement('div');
        skinCard.style.cssText = `
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border: 3px solid ${skin.owned ? '#00FF00' : '#FFD700'};
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            cursor: ${skin.owned ? 'pointer' : 'default'};
            opacity: ${skin.owned ? '1' : '0.7'};
        `;
        
        const canBuy = minigamesState.minigameCharge >= skin.cost;
        
        skinCard.innerHTML = `
            <div style="font-size: 4em; margin-bottom: 10px; color: ${skin.playerColor};">${skin.playerSymbol}</div>
            <h3 style="color: #FFD700; font-weight: bold; margin-bottom: 10px;">${skin.name}</h3>
            ${skin.owned ? 
                `<div style="color: #00FF00; font-weight: bold; margin-bottom: 10px;">✓ OWNED</div>
                 <button onclick="selectMazeSkin('${skinKey}')" style="
                     background: #00FF00;
                     color: #000;
                     border: none;
                     padding: 10px 20px;
                     border-radius: 10px;
                     font-weight: bold;
                     cursor: pointer;
                     ${mazeGameSkin === skinKey ? 'opacity: 0.5; cursor: not-allowed;' : ''}
                 ">${mazeGameSkin === skinKey ? 'CURRENT' : 'SELECT'}</button>` :
                `<div style="color: #FFD700; font-weight: bold; margin-bottom: 10px;">
                    Cost: ⚡ ${skin.cost} Minigame Charge
                </div>
                 <button onclick="buyMazeSkin('${skinKey}')" style="
                     background: ${canBuy ? '#FFD700' : '#666'};
                     color: #000;
                     border: none;
                     padding: 10px 20px;
                     border-radius: 10px;
                     font-weight: bold;
                     cursor: ${canBuy ? 'pointer' : 'not-allowed'};
                     opacity: ${canBuy ? '1' : '0.5'};
                 ">${canBuy ? 'BUY' : 'NEED ' + skin.cost + ' CHARGE'}</button>
                `
            }
        `;
        
        skinList.appendChild(skinCard);
    });
    
    overlay.appendChild(shopContent);
    document.body.appendChild(overlay);
}

function buyMazeSkin(skinKey) {
    const skin = MAZE_SKINS[skinKey];
    if (!skin || skin.owned) return;
    
    loadMinigameCharge();
    
    if (minigamesState.minigameCharge < skin.cost) {
        alert(`You need ${skin.cost} minigame charge to buy this skin!`);
        return;
    }
    
    minigamesState.minigameCharge -= skin.cost;
    saveMinigameCharge();
    
    skin.owned = true;
    saveMazeSkin();
    
    if (typeof addLog === 'function') {
        addLog(`🎨 Purchased ${skin.name} for ${skin.cost} minigame charge!`);
    }
    
    // Refresh shop
    const shop = document.getElementById('maze-skins-shop');
    if (shop) shop.remove();
    showMazeSkinsShop();
}

function selectMazeSkin(skinKey) {
    if (!MAZE_SKINS[skinKey] || !MAZE_SKINS[skinKey].owned) return;
    if (mazeGameSkin === skinKey) return;
    
    mazeGameSkin = skinKey;
    saveMazeSkin();
    
    // Update current game if active
    if (mazeGame.gameStarted && mazeGame.player) {
        const skin = MAZE_SKINS[skinKey];
        mazeGame.player.color = skin.playerColor;
        mazeGame.player.symbol = skin.playerSymbol;
    }
    
    if (typeof addLog === 'function') {
        addLog(`🎨 Switched to ${MAZE_SKINS[skinKey].name}!`);
    }
    
    // Close shop
    const shop = document.getElementById('maze-skins-shop');
    if (shop) shop.remove();
}

// Minigame 11: Maze Game
function initMazeGame() {
    const container = document.getElementById('minigame-container');
    if (!container) {
        console.error('minigame-container not found');
        return;
    }
    container.innerHTML = `
        <div class="minigame-maze">
            <h2>🧩 Scary Cat Maze Game - Level <span id="maze-level-display">1</span></h2>
            <p>Use WASD or arrow keys to collect money bags! Each bag = 10 money</p>
            <button class="btn btn-small" onclick="showMazeSkinsShop()" style="margin: 10px 0;">🎨 Skins Shop</button>
            <div id="maze-canvas-container" style="text-align: center; margin: 20px 0;">
                <canvas id="maze-canvas" style="border: 3px solid #FF0000; background: #000; cursor: pointer;"></canvas>
            </div>
            <div id="maze-score" style="color: #FFD700; font-weight: bold; font-size: 1.2em; margin: 10px 0;">
                Charge Collected: <span id="maze-money-count">0</span>
            </div>
            <button class="btn btn-large" onclick="startMazeGame()">Start Game</button>
            <div id="maze-result"></div>
        </div>
    `;
    
    const canvas = document.getElementById('maze-canvas');
    if (canvas) {
        canvas.width = 600;
        canvas.height = 400;
    }
}

let mazeGame = {
    canvas: null,
    ctx: null,
    player: { x: 20, y: 20, size: 20, color: '#FF0000' },
    moneyBags: [],
    walls: [],
    pressurePlates: [],
    keys: [],
    locks: [],
    collectedKeys: { red: 0, blue: 0, green: 0, yellow: 0 },
    level: 1,
    score: 0,
    totalMoney: 0,
    gameStarted: false,
    gameOver: false,
    keys: {},
    exit: null,
    gameLoopRunning: null
};

function startMazeGame() {
    const canvas = document.getElementById('maze-canvas');
    if (!canvas) return;
    
    // Reset game state completely to prevent speed issues
    if (mazeGame.gameLoopRunning) {
        cancelAnimationFrame(mazeGame.gameLoopRunning);
    }
    document.removeEventListener('keydown', handleMazeKeyDown);
    document.removeEventListener('keyup', handleMazeKeyUp);
    
    mazeGame.canvas = canvas;
    mazeGame.ctx = canvas.getContext('2d');
    mazeGame.gameStarted = true;
    mazeGame.gameOver = false;
    mazeGame.level = 1;
    mazeGame.score = 0;
    mazeGame.totalMoney = 0;
    mazeGame.collectedKeys = { red: 0, blue: 0, green: 0, yellow: 0 };
    mazeGame.keys = {};
    mazeGame.gameLoopRunning = null;
    
    // Load selected skin
    loadMazeSkin();
    
    generateMazeLevel(mazeGame.level);
    
    // WASD and Arrow key controls
    document.addEventListener('keydown', handleMazeKeyDown);
    document.addEventListener('keyup', handleMazeKeyUp);
    
    mazeGameLoop();
}

function generateMazeLevel(level) {
    const canvas = mazeGame.canvas;
    const cellSize = 40;
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);
    
    // Generate maze using recursive backtracking
    const maze = generateMazeAlgorithm(cols, rows);
    
    // Convert maze to walls
    mazeGame.walls = [];
    mazeGame.moneyBags = [];
    mazeGame.pressurePlates = [];
    mazeGame.keys = [];
    mazeGame.locks = [];
    
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = maze[y][x];
            const wallThickness = 3; // Match scary cat game style
            if (cell.walls.top) {
                mazeGame.walls.push({ x: x * cellSize, y: y * cellSize, width: cellSize, height: wallThickness });
            }
            if (cell.walls.left) {
                mazeGame.walls.push({ x: x * cellSize, y: y * cellSize, width: wallThickness, height: cellSize });
            }
            if (cell.walls.bottom) {
                mazeGame.walls.push({ x: x * cellSize, y: (y + 1) * cellSize - wallThickness, width: cellSize, height: wallThickness });
            }
            if (cell.walls.right) {
                mazeGame.walls.push({ x: (x + 1) * cellSize - wallThickness, y: y * cellSize, width: wallThickness, height: cellSize });
            }
        }
    }
    
    // Add outer walls (match scary cat game style)
    const wallThickness = 3;
    mazeGame.walls.push({ x: 0, y: 0, width: canvas.width, height: wallThickness });
    mazeGame.walls.push({ x: 0, y: 0, width: wallThickness, height: canvas.height });
    mazeGame.walls.push({ x: canvas.width - wallThickness, y: 0, width: wallThickness, height: canvas.height });
    mazeGame.walls.push({ x: 0, y: canvas.height - wallThickness, width: canvas.width, height: wallThickness });
    
    // Place player at start with current skin
    const skin = MAZE_SKINS[mazeGameSkin] || MAZE_SKINS.default;
    mazeGame.player = { x: cellSize + 10, y: cellSize + 10, size: 20, color: skin.playerColor, symbol: skin.playerSymbol };
    
    // Place exit at end
    mazeGame.exit = { x: (cols - 2) * cellSize + 10, y: (rows - 2) * cellSize + 10, size: 30 };
    
    // Generate keys and locks based on level
    const numKeys = Math.min(level, 4);
    const keyColors = ['red', 'blue', 'green', 'yellow'];
    
    for (let i = 0; i < numKeys; i++) {
        const color = keyColors[i];
        let x, y;
        do {
            x = Math.random() * (canvas.width - 60) + 30;
            y = Math.random() * (canvas.height - 60) + 30;
        } while (isWallCollision(x, y, 20) || isPositionOccupied(x, y));
        
        // Pressure plate that gives key
        mazeGame.pressurePlates.push({ x, y, size: 25, color, activated: false });
        
        // Lock that requires key
        let lockX, lockY;
        do {
            lockX = Math.random() * (canvas.width - 60) + 30;
            lockY = Math.random() * (canvas.height - 60) + 30;
        } while (isWallCollision(lockX, lockY, 30) || isPositionOccupied(lockX, lockY) || 
                 Math.abs(lockX - x) < 100 || Math.abs(lockY - y) < 100);
        
        mazeGame.locks.push({ x: lockX, y: lockY, size: 30, color, unlocked: false });
    }
    
    // Place money bag at exit (1 per level)
    mazeGame.moneyBags.push({ 
        x: mazeGame.exit.x + 5, 
        y: mazeGame.exit.y + 5, 
        size: 20, 
        collected: false 
    });
}

function generateMazeAlgorithm(cols, rows) {
    const maze = [];
    for (let y = 0; y < rows; y++) {
        maze[y] = [];
        for (let x = 0; x < cols; x++) {
            maze[y][x] = {
                walls: { top: true, right: true, bottom: true, left: true },
                visited: false
            };
        }
    }
    
    const stack = [];
    let current = { x: 0, y: 0 };
    maze[current.y][current.x].visited = true;
    
    while (true) {
        const neighbors = [];
        const { x, y } = current;
        
        if (y > 0 && !maze[y - 1][x].visited) neighbors.push({ x, y: y - 1, dir: 'top' });
        if (x < cols - 1 && !maze[y][x + 1].visited) neighbors.push({ x: x + 1, y, dir: 'right' });
        if (y < rows - 1 && !maze[y + 1][x].visited) neighbors.push({ x, y: y + 1, dir: 'bottom' });
        if (x > 0 && !maze[y][x - 1].visited) neighbors.push({ x: x - 1, y, dir: 'left' });
        
        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            stack.push(current);
            
            // Remove wall between current and next
            if (next.dir === 'top') {
                maze[y][x].walls.top = false;
                maze[y - 1][x].walls.bottom = false;
            } else if (next.dir === 'right') {
                maze[y][x].walls.right = false;
                maze[y][x + 1].walls.left = false;
            } else if (next.dir === 'bottom') {
                maze[y][x].walls.bottom = false;
                maze[y + 1][x].walls.top = false;
            } else if (next.dir === 'left') {
                maze[y][x].walls.left = false;
                maze[y][x - 1].walls.right = false;
            }
            
            current = { x: next.x, y: next.y };
            maze[current.y][current.x].visited = true;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            break;
        }
    }
    
    return maze;
}

function isPositionOccupied(x, y) {
    return mazeGame.pressurePlates.some(p => 
        Math.abs(p.x - x) < 50 && Math.abs(p.y - y) < 50
    ) || mazeGame.locks.some(l => 
        Math.abs(l.x - x) < 50 && Math.abs(l.y - y) < 50
    ) || mazeGame.moneyBags.some(b => 
        Math.abs(b.x - x) < 50 && Math.abs(b.y - y) < 50
    );
}

function handleMazeKeyDown(e) {
    if (!mazeGame.gameStarted || mazeGame.gameOver) return;
    mazeGame.keys[e.key] = true;
    e.preventDefault();
}

function handleMazeKeyUp(e) {
    mazeGame.keys[e.key] = false;
}

// generateMazeWalls removed - using generateMazeLevel instead

function isWallCollision(x, y, size) {
    return mazeGame.walls.some(wall => 
        x < wall.x + wall.width &&
        x + size > wall.x &&
        y < wall.y + wall.height &&
        y + size > wall.y
    );
}

function updateMazeGame() {
    if (!mazeGame.gameStarted || mazeGame.gameOver) return;
    
    const speed = 4;
    let newX = mazeGame.player.x;
    let newY = mazeGame.player.y;
    
    if (mazeGame.keys['ArrowUp'] || mazeGame.keys['w'] || mazeGame.keys['W']) {
        newY -= speed;
    }
    if (mazeGame.keys['ArrowDown'] || mazeGame.keys['s'] || mazeGame.keys['S']) {
        newY += speed;
    }
    if (mazeGame.keys['ArrowLeft'] || mazeGame.keys['a'] || mazeGame.keys['A']) {
        newX -= speed;
    }
    if (mazeGame.keys['ArrowRight'] || mazeGame.keys['d'] || mazeGame.keys['D']) {
        newX += speed;
    }
    
    // Check wall collisions
    if (!isWallCollision(newX, newY, mazeGame.player.size)) {
        // Keep in bounds
        if (newX >= 0 && newX <= mazeGame.canvas.width - mazeGame.player.size) {
            mazeGame.player.x = newX;
        }
        if (newY >= 0 && newY <= mazeGame.canvas.height - mazeGame.player.size) {
            mazeGame.player.y = newY;
        }
    }
    
    // Check pressure plate activation
    mazeGame.pressurePlates.forEach(plate => {
        if (!plate.activated) {
            const dx = plate.x - mazeGame.player.x;
            const dy = plate.y - mazeGame.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < (mazeGame.player.size + plate.size) / 2) {
                plate.activated = true;
                mazeGame.collectedKeys[plate.color]++;
                updateMazeDisplay();
            }
        }
    });
    
    // Check lock unlocking
    mazeGame.locks.forEach(lock => {
        if (!lock.unlocked && mazeGame.collectedKeys[lock.color] > 0) {
            const dx = lock.x - mazeGame.player.x;
            const dy = lock.y - mazeGame.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < (mazeGame.player.size + lock.size) / 2) {
                lock.unlocked = true;
                mazeGame.collectedKeys[lock.color]--;
                updateMazeDisplay();
            }
        }
    });
    
    // Check money bag collection
    mazeGame.moneyBags.forEach((bag) => {
        if (!bag.collected) {
            const dx = bag.x - mazeGame.player.x;
            const dy = bag.y - mazeGame.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < (mazeGame.player.size + bag.size) / 2) {
                bag.collected = true;
                mazeGame.score++;
                const player = getMinigamePlayer();
                if (player) {
                    player.money += 10; // 1 bag = 10 money
                    mazeGame.totalMoney += 10;
                }
                updateMazeDisplay();
                updateMinigameDisplay();
            }
        }
    });
    
    // Check exit (all locks must be unlocked)
    if (mazeGame.exit && mazeGame.moneyBags.every(bag => bag.collected) && 
        mazeGame.locks.every(lock => lock.unlocked)) {
        const dx = mazeGame.exit.x - mazeGame.player.x;
        const dy = mazeGame.exit.y - mazeGame.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (mazeGame.player.size + mazeGame.exit.size) / 2) {
            // Level complete!
            mazeGame.level++;
            // Give 10 minigame charge per level completion
            addMinigameCharge(10);
            
            if (typeof addLog === 'function') {
                addLog(`🧩 Level ${mazeGame.level - 1} Complete! +10 minigame charge!`);
            }
            
            // Generate next level
            generateMazeLevel(mazeGame.level);
            updateMazeDisplay();
        }
    }
}

function drawMazeGame() {
    if (!mazeGame.ctx || !mazeGame.canvas) return;
    
    const ctx = mazeGame.ctx;
    const canvas = mazeGame.canvas;
    
    // Clear canvas with dark background
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw walls (scary red theme)
    ctx.fillStyle = '#8B0000';
    mazeGame.walls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
    });
    
    // Draw locks (only if not unlocked)
    mazeGame.locks.forEach(lock => {
        if (!lock.unlocked) {
            const colors = { red: '#FF0000', blue: '#0000FF', green: '#00FF00', yellow: '#FFFF00' };
            ctx.fillStyle = colors[lock.color] || '#FF0000';
            ctx.fillRect(lock.x, lock.y, lock.size, lock.size);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(lock.x, lock.y, lock.size, lock.size);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🔒', lock.x + lock.size/2, lock.y + lock.size/2 + 7);
        }
    });
    
    // Draw pressure plates
    mazeGame.pressurePlates.forEach(plate => {
        const colors = { red: '#FF6666', blue: '#6666FF', green: '#66FF66', yellow: '#FFFF66' };
        ctx.fillStyle = plate.activated ? colors[plate.color] : '#444444';
        ctx.beginPath();
        ctx.arc(plate.x + plate.size/2, plate.y + plate.size/2, plate.size/2, 0, Math.PI * 2);
        ctx.fill();
        if (plate.activated) {
            ctx.fillStyle = '#000';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✓', plate.x + plate.size/2, plate.y + plate.size/2 + 5);
        } else {
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('⭕', plate.x + plate.size/2, plate.y + plate.size/2 + 4);
        }
    });
    
    // Draw money bags
    mazeGame.moneyBags.forEach(bag => {
        if (!bag.collected) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(bag.x + bag.size/2, bag.y + bag.size/2, bag.size/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('💰', bag.x + bag.size/2, bag.y + bag.size/2 + 5);
        }
    });
    
    // Draw exit
    if (mazeGame.exit) {
        const allUnlocked = mazeGame.locks.every(lock => lock.unlocked);
        ctx.fillStyle = allUnlocked ? '#00FF00' : '#666666';
        ctx.beginPath();
        ctx.arc(mazeGame.exit.x + mazeGame.exit.size/2, mazeGame.exit.y + mazeGame.exit.size/2, mazeGame.exit.size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🚪', mazeGame.exit.x + mazeGame.exit.size/2, mazeGame.exit.y + mazeGame.exit.size/2 + 7);
    }
    
    // Draw player with current skin
    const skin = MAZE_SKINS[mazeGameSkin] || MAZE_SKINS.default;
    ctx.fillStyle = skin.rainbow ? `hsl(${(Date.now() / 10) % 360}, 70%, 50%)` : (mazeGame.player.color || skin.playerColor);
    ctx.beginPath();
    ctx.arc(mazeGame.player.x + mazeGame.player.size/2, mazeGame.player.y + mazeGame.player.size/2, mazeGame.player.size/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw player symbol if it's not a simple circle
    if (mazeGame.player.symbol && mazeGame.player.symbol.length > 1) {
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(mazeGame.player.symbol, mazeGame.player.x + mazeGame.player.size/2, mazeGame.player.y + mazeGame.player.size/2);
    } else {
        // Default cat eyes for default skin
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(mazeGame.player.x + mazeGame.player.size/2 - 4, mazeGame.player.y + mazeGame.player.size/2 - 2, 2, 0, Math.PI * 2);
        ctx.arc(mazeGame.player.x + mazeGame.player.size/2 + 4, mazeGame.player.y + mazeGame.player.size/2 - 2, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw UI overlay
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Level: ${mazeGame.level}`, 10, 20);
    ctx.fillText(`Money: ${mazeGame.totalMoney}`, 10, 40);
    ctx.fillText(`Keys: R:${mazeGame.collectedKeys.red} B:${mazeGame.collectedKeys.blue} G:${mazeGame.collectedKeys.green} Y:${mazeGame.collectedKeys.yellow}`, 10, 60);
}

function updateMazeDisplay() {
    const moneyCount = document.getElementById('maze-money-count');
    const levelDisplay = document.getElementById('maze-level');
    const keysDisplay = document.getElementById('maze-keys');
    
    if (moneyCount) {
        moneyCount.textContent = mazeGame.totalMoney;
    }
    if (levelDisplay) {
        levelDisplay.textContent = mazeGame.level;
    }
    if (keysDisplay) {
        const totalKeys = mazeGame.collectedKeys.red + mazeGame.collectedKeys.blue + 
                         mazeGame.collectedKeys.green + mazeGame.collectedKeys.yellow;
        keysDisplay.textContent = totalKeys;
    }
}

function mazeGameLoop() {
    if (!mazeGame.gameStarted) return;
    
    updateMazeGame();
    drawMazeGame();
    updateMazeDisplay();
    
    if (!mazeGame.gameOver) {
        mazeGame.gameLoopRunning = requestAnimationFrame(mazeGameLoop);
    } else {
        mazeGame.gameLoopRunning = null;
    }
}

// Minigames menu
// Minigame 12: Snake Game
function initSnakeGame() {
    const container = document.getElementById('minigame-container');
    if (!container) return;
    loadMinigameCharge();
    container.innerHTML = `
        <div class="minigame-snake">
            <h2>🐍 Snake Game</h2>
            <p>Use Arrow Keys or WASD to control the snake! Eat food to grow. Each food = 5 charge! Collision = Game Over!</p>
            <div style="color: #FFD700; font-weight: bold; margin-bottom: 10px;">
                ⚡ Your Charge: <span id="snake-charge-display">${minigamesState.minigameCharge}</span>
            </div>
            <div id="snake-canvas-container" style="text-align: center; margin: 20px 0;">
                <canvas id="snake-canvas" style="border: 3px solid #FF0000; background: #000; cursor: pointer;"></canvas>
            </div>
            <div id="snake-info" style="color: #FFD700; font-weight: bold; font-size: 1.1em; margin: 10px 0;">
                Score: <span id="snake-score">0</span> | Charge Earned: <span id="snake-money">0</span>
            </div>
            <button class="btn btn-large" onclick="startSnakeGame()">Start Game</button>
            <button class="btn btn-small" onclick="showMinigamesMenu()" style="margin-top: 10px;">← Back to Minigames</button>
            <div id="snake-result"></div>
        </div>
    `;
    const canvas = document.getElementById('snake-canvas');
    if (canvas) {
        canvas.width = 600;
        canvas.height = 400;
    }
}

let snakeGame = {
    canvas: null,
    ctx: null,
    snake: [{ x: 200, y: 200 }],
    direction: { x: 10, y: 0 },
    food: null,
    score: 0,
    charge: 0, // Changed from money to charge
    gameStarted: false,
    gameOver: false,
    gridSize: 10,
    gameLoopTimeout: null
};

function startSnakeGame() {
    const canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    snakeGame.canvas = canvas;
    snakeGame.ctx = canvas.getContext('2d');
    snakeGame.gameStarted = true;
    snakeGame.gameOver = false;
    snakeGame.snake = [{ x: 200, y: 200 }];
    snakeGame.direction = { x: 10, y: 0 };
    snakeGame.score = 0;
    snakeGame.charge = 0; // Changed from money to charge
    snakeGame.gameLoopTimeout = null;
    generateSnakeFood();
    document.addEventListener('keydown', handleSnakeKeyDown);
    snakeGameLoop();
}

function handleSnakeKeyDown(e) {
    if (!snakeGame.gameStarted || snakeGame.gameOver) return;
    const key = e.key;
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        if (snakeGame.direction.y === 0) snakeGame.direction = { x: 0, y: -10 };
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        if (snakeGame.direction.y === 0) snakeGame.direction = { x: 0, y: 10 };
    } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        if (snakeGame.direction.x === 0) snakeGame.direction = { x: -10, y: 0 };
    } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        if (snakeGame.direction.x === 0) snakeGame.direction = { x: 10, y: 0 };
    }
    e.preventDefault();
}

function generateSnakeFood() {
    snakeGame.food = {
        x: Math.floor(Math.random() * (snakeGame.canvas.width / snakeGame.gridSize)) * snakeGame.gridSize,
        y: Math.floor(Math.random() * (snakeGame.canvas.height / snakeGame.gridSize)) * snakeGame.gridSize
    };
}

function updateSnakeGame() {
    if (!snakeGame.gameStarted || snakeGame.gameOver) return;
    
    const head = { ...snakeGame.snake[0] };
    head.x += snakeGame.direction.x;
    head.y += snakeGame.direction.y;
    
    // Check wall collision
    if (head.x < 0 || head.x >= snakeGame.canvas.width || head.y < 0 || head.y >= snakeGame.canvas.height) {
        snakeGame.gameOver = true;
        endSnakeGame();
        return;
    }
    
    // Check self collision
    if (snakeGame.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        snakeGame.gameOver = true;
        endSnakeGame();
        return;
    }
    
    snakeGame.snake.unshift(head);
    
    // Check food
    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score++;
        snakeGame.charge += 5; // 5 charge per food eaten
        addMinigameCharge(5);
        generateSnakeFood();
        updateSnakeDisplay();
        const chargeDisplay = document.getElementById('snake-charge-display');
        if (chargeDisplay) chargeDisplay.textContent = minigamesState.minigameCharge;
    } else {
        snakeGame.snake.pop();
    }
}

function drawSnakeGame() {
    if (!snakeGame.ctx) return;
    const ctx = snakeGame.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
    
    // Draw food
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(snakeGame.food.x, snakeGame.food.y, snakeGame.gridSize, snakeGame.gridSize);
    
    // Draw snake
    snakeGame.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#00FF00' : '#00AA00';
        ctx.fillRect(segment.x, segment.y, snakeGame.gridSize, snakeGame.gridSize);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(segment.x, segment.y, snakeGame.gridSize, snakeGame.gridSize);
    });
    
    if (snakeGame.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 - 20);
        ctx.fillText(`Score: ${snakeGame.score}`, snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 + 10);
        ctx.fillText(`Charge Earned: ${snakeGame.charge}`, snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 + 40);
    }
}

function updateSnakeDisplay() {
    const scoreEl = document.getElementById('snake-score');
    const chargeEl = document.getElementById('snake-money'); // Keep ID for compatibility
    const chargeDisplay = document.getElementById('snake-charge-display');
    if (scoreEl) scoreEl.textContent = snakeGame.score;
    if (chargeEl) chargeEl.textContent = snakeGame.charge; // Changed from money to charge
    if (chargeDisplay) chargeDisplay.textContent = minigamesState.minigameCharge;
}

function endSnakeGame() {
    const resultDiv = document.getElementById('snake-result');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold; font-size: 1.5em;">Game Over! Earned ${snakeGame.charge} charge! (Total Charge: ${minigamesState.minigameCharge})</div>`;
    }
    if (typeof addLog === 'function') {
        addLog(`🐍 Snake Game: Score ${snakeGame.score}, Earned ${snakeGame.charge} charge! (Total: ${minigamesState.minigameCharge})`);
    }
}

function snakeGameLoop() {
    if (!snakeGame.gameStarted) return;
    updateSnakeGame();
    drawSnakeGame();
    updateSnakeDisplay();
    if (!snakeGame.gameOver) {
        snakeGame.gameLoopTimeout = setTimeout(() => snakeGameLoop(), 150);
    } else {
        snakeGame.gameLoopTimeout = null;
    }
}

// Minigame 13: Breakout/Arkanoid
function initBreakoutGame() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-breakout">
            <h2>🎾 Breakout</h2>
            <p>Use Arrow Keys or A/D to move paddle! Break blocks for money. Each block = 10 money!</p>
            <div id="breakout-canvas-container" style="text-align: center; margin: 20px 0;">
                <canvas id="breakout-canvas" style="border: 3px solid #FF0000; background: #000; cursor: pointer;"></canvas>
            </div>
            <div id="breakout-info" style="color: #FFD700; font-weight: bold; font-size: 1.1em; margin: 10px 0;">
                Score: <span id="breakout-score">0</span> | Money: <span id="breakout-money">0</span> | Lives: <span id="breakout-lives">3</span>
            </div>
            <button class="btn btn-large" onclick="startBreakoutGame()">Start Game</button>
            <div id="breakout-result"></div>
        </div>
    `;
    const canvas = document.getElementById('breakout-canvas');
    if (canvas) {
        canvas.width = 600;
        canvas.height = 400;
    }
}

let breakoutGame = {
    canvas: null,
    ctx: null,
    paddle: { x: 250, y: 380, width: 100, height: 10 },
    ball: { x: 300, y: 360, radius: 8, dx: 3, dy: -3 },
    blocks: [],
    score: 0,
    charge: 0, // Changed from money to charge
    lives: 3,
    gameStarted: false,
    gameOver: false,
    keys: {},
    gameLoopRunning: null
};

function startBreakoutGame() {
    const canvas = document.getElementById('breakout-canvas');
    if (!canvas) return;
    
    // Reset game state completely to prevent speed issues
    if (breakoutGame.gameLoopRunning) {
        cancelAnimationFrame(breakoutGame.gameLoopRunning);
    }
    
    breakoutGame.canvas = canvas;
    breakoutGame.ctx = canvas.getContext('2d');
    breakoutGame.gameStarted = true;
    breakoutGame.gameOver = false;
    breakoutGame.score = 0;
    breakoutGame.charge = 0; // Changed from money to charge
    breakoutGame.lives = 3;
    breakoutGame.paddle = { x: 250, y: 380, width: 100, height: 10 };
    breakoutGame.ball = { x: 300, y: 360, radius: 8, dx: 3, dy: -3 }; // Reset ball speed
    breakoutGame.blocks = [];
    breakoutGame.gameLoopRunning = null;
    
    // Create blocks
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 8; col++) {
            breakoutGame.blocks.push({
                x: col * 75 + 10,
                y: row * 25 + 50,
                width: 70,
                height: 20,
                broken: false
            });
        }
    }
    
    document.addEventListener('keydown', handleBreakoutKeyDown);
    document.addEventListener('keyup', handleBreakoutKeyUp);
    breakoutGameLoop();
}

function handleBreakoutKeyDown(e) {
    if (!breakoutGame.gameStarted || breakoutGame.gameOver) return;
    breakoutGame.keys[e.key] = true;
    e.preventDefault();
}

function handleBreakoutKeyUp(e) {
    breakoutGame.keys[e.key] = false;
}

function updateBreakoutGame() {
    if (!breakoutGame.gameStarted || breakoutGame.gameOver) return;
    
    // Move paddle
    const speed = 5;
    if (breakoutGame.keys['ArrowLeft'] || breakoutGame.keys['a'] || breakoutGame.keys['A']) {
        breakoutGame.paddle.x = Math.max(0, breakoutGame.paddle.x - speed);
    }
    if (breakoutGame.keys['ArrowRight'] || breakoutGame.keys['d'] || breakoutGame.keys['D']) {
        breakoutGame.paddle.x = Math.min(breakoutGame.canvas.width - breakoutGame.paddle.width, breakoutGame.paddle.x + speed);
    }
    
    // Move ball
    breakoutGame.ball.x += breakoutGame.ball.dx;
    breakoutGame.ball.y += breakoutGame.ball.dy;
    
    // Wall collisions
    if (breakoutGame.ball.x - breakoutGame.ball.radius <= 0 || breakoutGame.ball.x + breakoutGame.ball.radius >= breakoutGame.canvas.width) {
        breakoutGame.ball.dx = -breakoutGame.ball.dx;
    }
    if (breakoutGame.ball.y - breakoutGame.ball.radius <= 0) {
        breakoutGame.ball.dy = -breakoutGame.ball.dy;
    }
    
    // Paddle collision
    if (breakoutGame.ball.y + breakoutGame.ball.radius >= breakoutGame.paddle.y &&
        breakoutGame.ball.x >= breakoutGame.paddle.x &&
        breakoutGame.ball.x <= breakoutGame.paddle.x + breakoutGame.paddle.width) {
        breakoutGame.ball.dy = -Math.abs(breakoutGame.ball.dy);
        const hitPos = (breakoutGame.ball.x - breakoutGame.paddle.x) / breakoutGame.paddle.width;
        breakoutGame.ball.dx = (hitPos - 0.5) * 6;
    }
    
    // Block collisions
    breakoutGame.blocks.forEach(block => {
        if (!block.broken &&
            breakoutGame.ball.x + breakoutGame.ball.radius >= block.x &&
            breakoutGame.ball.x - breakoutGame.ball.radius <= block.x + block.width &&
            breakoutGame.ball.y + breakoutGame.ball.radius >= block.y &&
            breakoutGame.ball.y - breakoutGame.ball.radius <= block.y + block.height) {
            block.broken = true;
            breakoutGame.score += 10;
            breakoutGame.charge += 1; // Each block gives 1 minigame charge
            addMinigameCharge(1);
            breakoutGame.ball.dy = -breakoutGame.ball.dy;
            updateBreakoutDisplay();
        }
    });
    
    // Ball lost
    if (breakoutGame.ball.y > breakoutGame.canvas.height) {
        breakoutGame.lives--;
        if (breakoutGame.lives <= 0) {
            breakoutGame.gameOver = true;
            endBreakoutGame();
        } else {
            breakoutGame.ball = { x: 300, y: 360, radius: 8, dx: 3, dy: -3 };
        }
    }
    
    // Win condition
    if (breakoutGame.blocks.every(b => b.broken)) {
        breakoutGame.gameOver = true;
        endBreakoutGame();
    }
}

function drawBreakoutGame() {
    if (!breakoutGame.ctx) return;
    const ctx = breakoutGame.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, breakoutGame.canvas.width, breakoutGame.canvas.height);
    
    // Draw blocks
    breakoutGame.blocks.forEach(block => {
        if (!block.broken) {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(block.x, block.y, block.width, block.height);
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(block.x, block.y, block.width, block.height);
        }
    });
    
    // Draw paddle
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(breakoutGame.paddle.x, breakoutGame.paddle.y, breakoutGame.paddle.width, breakoutGame.paddle.height);
    
    // Draw ball
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(breakoutGame.ball.x, breakoutGame.ball.y, breakoutGame.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    if (breakoutGame.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, breakoutGame.canvas.width, breakoutGame.canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(breakoutGame.blocks.every(b => b.broken) ? 'You Win!' : 'Game Over!', breakoutGame.canvas.width / 2, breakoutGame.canvas.height / 2);
        ctx.fillText(`Money: ${breakoutGame.money}`, breakoutGame.canvas.width / 2, breakoutGame.canvas.height / 2 + 40);
    }
}

function updateBreakoutDisplay() {
    const scoreEl = document.getElementById('breakout-score');
    const chargeEl = document.getElementById('breakout-money'); // Keep ID for compatibility
    const livesEl = document.getElementById('breakout-lives');
    if (scoreEl) scoreEl.textContent = breakoutGame.score;
    if (chargeEl) chargeEl.textContent = breakoutGame.charge; // Changed from money to charge
    if (livesEl) livesEl.textContent = breakoutGame.lives;
}

function endBreakoutGame() {
    const resultDiv = document.getElementById('breakout-result');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold; font-size: 1.5em;">Game Over! Earned ${breakoutGame.charge} minigame charge!</div>`;
    }
    if (typeof addLog === 'function') {
        addLog(`🎾 Breakout: Score ${breakoutGame.score}, Earned ${breakoutGame.charge} minigame charge!`);
    }
    // Add charge to player
    if (breakoutGame.charge > 0) {
        addMinigameCharge(breakoutGame.charge);
    }
}

function breakoutGameLoop() {
    if (!breakoutGame.gameStarted) return;
    updateBreakoutGame();
    drawBreakoutGame();
    updateBreakoutDisplay();
    if (!breakoutGame.gameOver) {
        requestAnimationFrame(breakoutGameLoop);
    }
}

// Minigame 14: Tetris
function initTetrisGame() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-tetris">
            <h2>🧩 Tetris</h2>
            <p>Arrow Keys: Left/Right to move, Down to drop, Up to rotate. Clear lines for charge! Each line = 15 charge!</p>
            <div id="tetris-canvas-container" style="text-align: center; margin: 20px 0;">
                <canvas id="tetris-canvas" style="border: 3px solid #FF0000; background: #000; cursor: pointer;"></canvas>
            </div>
            <div id="tetris-info" style="color: #FFD700; font-weight: bold; font-size: 1.1em; margin: 10px 0;">
                Score: <span id="tetris-score">0</span> | Charge: <span id="tetris-charge">0</span> | Lines: <span id="tetris-lines">0</span>
            </div>
            <button class="btn btn-large" onclick="startTetrisGame()">Start Game</button>
            <div id="tetris-result"></div>
        </div>
    `;
    const canvas = document.getElementById('tetris-canvas');
    if (canvas) {
        canvas.width = 300;
        canvas.height = 600;
    }
}

let tetrisGame = {
    canvas: null,
    ctx: null,
    grid: [],
    currentPiece: null,
    nextPiece: null,
    score: 0,
    charge: 0, // Changed from money to charge
    lines: 0,
    gameStarted: false,
    gameOver: false,
    dropTime: 0,
    lastTime: 0,
    gridWidth: 10,
    gridHeight: 20,
    blockSize: 30,
    gameLoopRunning: null
};

const tetrisPieces = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[0,1,1],[1,1,0]], // S
    [[1,1,0],[0,1,1]], // Z
    [[1,0,0],[1,1,1]], // J
    [[0,0,1],[1,1,1]]  // L
];

function startTetrisGame() {
    const canvas = document.getElementById('tetris-canvas');
    if (!canvas) return;
    
    // Reset game state completely to prevent speed issues
    if (tetrisGame.gameLoopRunning) {
        cancelAnimationFrame(tetrisGame.gameLoopRunning);
    }
    document.removeEventListener('keydown', handleTetrisKeyDown);
    
    tetrisGame.canvas = canvas;
    tetrisGame.ctx = canvas.getContext('2d');
    tetrisGame.gameStarted = true;
    tetrisGame.gameOver = false;
    tetrisGame.score = 0;
    tetrisGame.charge = 0; // Changed from money to charge
    tetrisGame.lines = 0;
    tetrisGame.gameLoopRunning = null;
    
    // Initialize grid
    tetrisGame.grid = Array(tetrisGame.gridHeight).fill().map(() => Array(tetrisGame.gridWidth).fill(0));
    
    spawnTetrisPiece();
    document.addEventListener('keydown', handleTetrisKeyDown);
    tetrisGame.lastTime = performance.now();
    tetrisGame.dropTime = 0;
    tetrisGameLoop();
}

function spawnTetrisPiece() {
    const shape = tetrisPieces[Math.floor(Math.random() * tetrisPieces.length)];
    tetrisGame.currentPiece = {
        shape: shape.map(row => [...row]),
        x: Math.floor(tetrisGame.gridWidth / 2) - 1,
        y: 0,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
}

function handleTetrisKeyDown(e) {
    if (!tetrisGame.gameStarted || tetrisGame.gameOver) return;
    const key = e.key;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        moveTetrisPiece(-1, 0);
    } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        moveTetrisPiece(1, 0);
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        moveTetrisPiece(0, 1);
    } else if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        rotateTetrisPiece();
    }
    e.preventDefault();
}

function moveTetrisPiece(dx, dy) {
    const newX = tetrisGame.currentPiece.x + dx;
    const newY = tetrisGame.currentPiece.y + dy;
    if (isValidTetrisPosition(tetrisGame.currentPiece.shape, newX, newY)) {
        tetrisGame.currentPiece.x = newX;
        tetrisGame.currentPiece.y = newY;
    } else if (dy > 0) {
        lockTetrisPiece();
    }
}

function rotateTetrisPiece() {
    const rotated = tetrisGame.currentPiece.shape[0].map((_, i) =>
        tetrisGame.currentPiece.shape.map(row => row[i]).reverse()
    );
    if (isValidTetrisPosition(rotated, tetrisGame.currentPiece.x, tetrisGame.currentPiece.y)) {
        tetrisGame.currentPiece.shape = rotated;
    }
}

function isValidTetrisPosition(shape, x, y) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (newX < 0 || newX >= tetrisGame.gridWidth || 
                    newY >= tetrisGame.gridHeight ||
                    (newY >= 0 && tetrisGame.grid[newY][newX])) {
                    return false;
                }
            }
        }
    }
    return true;
}

function lockTetrisPiece() {
    tetrisGame.currentPiece.shape.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
            if (cell) {
                const y = tetrisGame.currentPiece.y + rowIdx;
                const x = tetrisGame.currentPiece.x + colIdx;
                if (y >= 0) {
                    tetrisGame.grid[y][x] = tetrisGame.currentPiece.color;
                } else {
                    tetrisGame.gameOver = true;
                    endTetrisGame();
                }
            }
        });
    });
    clearTetrisLines();
    spawnTetrisPiece();
}

function clearTetrisLines() {
    let linesCleared = 0;
    for (let y = tetrisGame.gridHeight - 1; y >= 0; y--) {
        if (tetrisGame.grid[y].every(cell => cell !== 0)) {
            tetrisGame.grid.splice(y, 1);
            tetrisGame.grid.unshift(Array(tetrisGame.gridWidth).fill(0));
            linesCleared++;
            y++;
        }
    }
    if (linesCleared > 0) {
        tetrisGame.lines += linesCleared;
        tetrisGame.score += linesCleared * 100;
        tetrisGame.charge += linesCleared * 15; // Each line cleared gives 15 minigame charge
        addMinigameCharge(linesCleared * 15);
        updateTetrisDisplay();
    }
}

function updateTetrisGame(time) {
    if (!tetrisGame.gameStarted || tetrisGame.gameOver) return;
    
    const deltaTime = time - tetrisGame.lastTime;
    tetrisGame.dropTime += deltaTime;
    tetrisGame.lastTime = time;
    
    // Auto-drop 1 block per second
    if (tetrisGame.dropTime >= 1000) {
        moveTetrisPiece(0, 1);
        tetrisGame.dropTime = 0;
    }
    
    tetrisGame.lastTime = time;
}

function drawTetrisGame() {
    if (!tetrisGame.ctx) return;
    const ctx = tetrisGame.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, tetrisGame.canvas.width, tetrisGame.canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let y = 0; y < tetrisGame.gridHeight; y++) {
        for (let x = 0; x < tetrisGame.gridWidth; x++) {
            if (tetrisGame.grid[y][x]) {
                ctx.fillStyle = tetrisGame.grid[y][x];
                ctx.fillRect(x * tetrisGame.blockSize, y * tetrisGame.blockSize, tetrisGame.blockSize, tetrisGame.blockSize);
                ctx.strokeRect(x * tetrisGame.blockSize, y * tetrisGame.blockSize, tetrisGame.blockSize, tetrisGame.blockSize);
            }
        }
    }
    
    // Draw current piece
    if (tetrisGame.currentPiece) {
        ctx.fillStyle = tetrisGame.currentPiece.color;
        tetrisGame.currentPiece.shape.forEach((row, rowIdx) => {
            row.forEach((cell, colIdx) => {
                if (cell) {
                    const x = (tetrisGame.currentPiece.x + colIdx) * tetrisGame.blockSize;
                    const y = (tetrisGame.currentPiece.y + rowIdx) * tetrisGame.blockSize;
                    if (y >= 0) {
                        ctx.fillRect(x, y, tetrisGame.blockSize, tetrisGame.blockSize);
                        ctx.strokeStyle = '#FFF';
                        ctx.strokeRect(x, y, tetrisGame.blockSize, tetrisGame.blockSize);
                    }
                }
            });
        });
    }
    
    if (tetrisGame.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, tetrisGame.canvas.width, tetrisGame.canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', tetrisGame.canvas.width / 2, tetrisGame.canvas.height / 2);
        ctx.fillText(`Charge: ${tetrisGame.charge}`, tetrisGame.canvas.width / 2, tetrisGame.canvas.height / 2 + 40);
    }
}

function updateTetrisDisplay() {
    const scoreEl = document.getElementById('tetris-score');
    const chargeEl = document.getElementById('tetris-charge');
    const linesEl = document.getElementById('tetris-lines');
    if (scoreEl) scoreEl.textContent = tetrisGame.score;
    if (chargeEl) chargeEl.textContent = tetrisGame.charge; // Changed from money to charge
    if (linesEl) linesEl.textContent = tetrisGame.lines;
}

function endTetrisGame() {
    const resultDiv = document.getElementById('tetris-result');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold; font-size: 1.5em;">Game Over! Earned ${tetrisGame.charge} minigame charge!</div>`;
    }
    if (typeof addLog === 'function') {
        addLog(`🧩 Tetris: Score ${tetrisGame.score}, Lines ${tetrisGame.lines}, Earned ${tetrisGame.charge} minigame charge!`);
    }
    // Add charge to player
    if (tetrisGame.charge > 0) {
        addMinigameCharge(tetrisGame.charge);
    }
}

function tetrisGameLoop(time) {
    if (!tetrisGame.gameStarted) return;
    updateTetrisGame(time);
    drawTetrisGame();
    updateTetrisDisplay();
    if (!tetrisGame.gameOver) {
        tetrisGame.gameLoopRunning = requestAnimationFrame(tetrisGameLoop);
    } else {
        tetrisGame.gameLoopRunning = null;
    }
}

// Minigame 15: Pong
function initPongGame() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-pong">
            <h2>🏓 Pong</h2>
            <p>Use W/S or Arrow Up/Down to move paddle! Score points for charge. Each point = 5 charge!</p>
            <div id="pong-canvas-container" style="text-align: center; margin: 20px 0;">
                <canvas id="pong-canvas" style="border: 3px solid #FF0000; background: #000; cursor: pointer;"></canvas>
            </div>
            <div id="pong-info" style="color: #FFD700; font-weight: bold; font-size: 1.1em; margin: 10px 0;">
                Player: <span id="pong-player-score">0</span> | AI: <span id="pong-ai-score">0</span> | Charge: <span id="pong-charge">0</span>
            </div>
            <button class="btn btn-large" onclick="startPongGame()">Start Game</button>
            <div id="pong-result"></div>
        </div>
    `;
    const canvas = document.getElementById('pong-canvas');
    if (canvas) {
        canvas.width = 800;
        canvas.height = 400;
    }
}

let pongGame = {
    canvas: null,
    ctx: null,
    playerPaddle: { x: 20, y: 150, width: 10, height: 100, speed: 5 },
    aiPaddle: { x: 770, y: 150, width: 10, height: 100, speed: 3 },
    ball: { x: 400, y: 200, radius: 10, dx: 4, dy: 4 },
    playerScore: 0,
    aiScore: 0,
    charge: 0, // Changed from money to charge
    gameStarted: false,
    gameOver: false,
    keys: {},
    gameLoopRunning: null
};

function startPongGame() {
    const canvas = document.getElementById('pong-canvas');
    if (!canvas) return;
    
    // Reset game state completely to prevent speed increase
    if (pongGame.gameLoopRunning) {
        cancelAnimationFrame(pongGame.gameLoopRunning);
    }
    document.removeEventListener('keydown', handlePongKeyDown);
    document.removeEventListener('keyup', handlePongKeyUp);
    
    pongGame.canvas = canvas;
    pongGame.ctx = canvas.getContext('2d');
    pongGame.gameStarted = true;
    pongGame.gameOver = false;
    pongGame.playerScore = 0;
    pongGame.aiScore = 0;
    pongGame.charge = 0; // Changed from money to charge
    pongGame.playerPaddle = { x: 20, y: 150, width: 10, height: 100, speed: 5 };
    pongGame.aiPaddle = { x: 770, y: 150, width: 10, height: 100, speed: 3 };
    pongGame.ball = { x: 400, y: 200, radius: 10, dx: 4, dy: 4 }; // Reset ball speed
    pongGame.keys = {};
    pongGame.gameLoopRunning = null;
    document.addEventListener('keydown', handlePongKeyDown);
    document.addEventListener('keyup', handlePongKeyUp);
    pongGameLoop();
}

function handlePongKeyDown(e) {
    if (!pongGame.gameStarted || pongGame.gameOver) return;
    pongGame.keys[e.key] = true;
    e.preventDefault();
}

function handlePongKeyUp(e) {
    pongGame.keys[e.key] = false;
}

function updatePongGame() {
    if (!pongGame.gameStarted || pongGame.gameOver) return;
    
    // Move player paddle
    if (pongGame.keys['ArrowUp'] || pongGame.keys['w'] || pongGame.keys['W']) {
        pongGame.playerPaddle.y = Math.max(0, pongGame.playerPaddle.y - pongGame.playerPaddle.speed);
    }
    if (pongGame.keys['ArrowDown'] || pongGame.keys['s'] || pongGame.keys['S']) {
        pongGame.playerPaddle.y = Math.min(pongGame.canvas.height - pongGame.playerPaddle.height, pongGame.playerPaddle.y + pongGame.playerPaddle.speed);
    }
    
    // AI paddle (simple follow ball)
    const aiCenter = pongGame.aiPaddle.y + pongGame.aiPaddle.height / 2;
    if (aiCenter < pongGame.ball.y - 10) {
        pongGame.aiPaddle.y = Math.min(pongGame.canvas.height - pongGame.aiPaddle.height, pongGame.aiPaddle.y + pongGame.aiPaddle.speed);
    } else if (aiCenter > pongGame.ball.y + 10) {
        pongGame.aiPaddle.y = Math.max(0, pongGame.aiPaddle.y - pongGame.aiPaddle.speed);
    }
    
    // Move ball
    pongGame.ball.x += pongGame.ball.dx;
    pongGame.ball.y += pongGame.ball.dy;
    
    // Ball wall collisions
    if (pongGame.ball.y - pongGame.ball.radius <= 0 || pongGame.ball.y + pongGame.ball.radius >= pongGame.canvas.height) {
        pongGame.ball.dy = -pongGame.ball.dy;
    }
    
    // Paddle collisions
    if (pongGame.ball.x - pongGame.ball.radius <= pongGame.playerPaddle.x + pongGame.playerPaddle.width &&
        pongGame.ball.y >= pongGame.playerPaddle.y &&
        pongGame.ball.y <= pongGame.playerPaddle.y + pongGame.playerPaddle.height &&
        pongGame.ball.dx < 0) {
        pongGame.ball.dx = -pongGame.ball.dx;
        // Don't speed up to prevent game getting faster on restart
    }
    
    if (pongGame.ball.x + pongGame.ball.radius >= pongGame.aiPaddle.x &&
        pongGame.ball.y >= pongGame.aiPaddle.y &&
        pongGame.ball.y <= pongGame.aiPaddle.y + pongGame.aiPaddle.height &&
        pongGame.ball.dx > 0) {
        pongGame.ball.dx = -pongGame.ball.dx;
        // Don't speed up to prevent game getting faster on restart
    }
    
    // Score
    if (pongGame.ball.x < 0) {
        pongGame.aiScore++;
        resetPongBall();
    } else if (pongGame.ball.x > pongGame.canvas.width) {
        pongGame.playerScore++;
        pongGame.charge += 5; // Each point is now 5 minigame charge
        addMinigameCharge(5);
        resetPongBall();
    }
    
    // Game over condition
    if (pongGame.playerScore >= 10 || pongGame.aiScore >= 10) {
        pongGame.gameOver = true;
        endPongGame();
    }
    
    updatePongDisplay();
}

function resetPongBall() {
    pongGame.ball = {
        x: pongGame.canvas.width / 2,
        y: pongGame.canvas.height / 2,
        radius: 10,
        dx: (Math.random() > 0.5 ? 1 : -1) * 4,
        dy: (Math.random() > 0.5 ? 1 : -1) * 4
    };
}

function drawPongGame() {
    if (!pongGame.ctx) return;
    const ctx = pongGame.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, pongGame.canvas.width, pongGame.canvas.height);
    
    // Draw center line
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(pongGame.canvas.width / 2, 0);
    ctx.lineTo(pongGame.canvas.width / 2, pongGame.canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw paddles
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(pongGame.playerPaddle.x, pongGame.playerPaddle.y, pongGame.playerPaddle.width, pongGame.playerPaddle.height);
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(pongGame.aiPaddle.x, pongGame.aiPaddle.y, pongGame.aiPaddle.width, pongGame.aiPaddle.height);
    
    // Draw ball
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(pongGame.ball.x, pongGame.ball.y, pongGame.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw scores
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(pongGame.playerScore, pongGame.canvas.width / 4, 50);
    ctx.fillText(pongGame.aiScore, 3 * pongGame.canvas.width / 4, 50);
    
    if (pongGame.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, pongGame.canvas.width, pongGame.canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 40px Arial';
        ctx.fillText(pongGame.playerScore >= 10 ? 'You Win!' : 'AI Wins!', pongGame.canvas.width / 2, pongGame.canvas.height / 2);
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`Charge Earned: ${pongGame.charge}`, pongGame.canvas.width / 2, pongGame.canvas.height / 2 + 50);
    }
}

function updatePongDisplay() {
    const playerScoreEl = document.getElementById('pong-player-score');
    const aiScoreEl = document.getElementById('pong-ai-score');
    const chargeEl = document.getElementById('pong-charge');
    if (playerScoreEl) playerScoreEl.textContent = pongGame.playerScore;
    if (aiScoreEl) aiScoreEl.textContent = pongGame.aiScore;
    if (chargeEl) chargeEl.textContent = pongGame.charge; // Changed from money to charge
}

function endPongGame() {
    const resultDiv = document.getElementById('pong-result');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="color: ${pongGame.playerScore >= 10 ? '#00ff00' : '#ff0000'}; font-weight: bold; font-size: 1.5em;">${pongGame.playerScore >= 10 ? 'You Win!' : 'AI Wins!'} Earned ${pongGame.charge} minigame charge!</div>`;
    }
    if (typeof addLog === 'function') {
        addLog(`🏓 Pong: Final Score ${pongGame.playerScore}-${pongGame.aiScore}, Earned ${pongGame.charge} minigame charge!`);
    }
    // Add charge to player
    if (pongGame.charge > 0) {
        addMinigameCharge(pongGame.charge);
    }
}

function pongGameLoop() {
    if (!pongGame.gameStarted) return;
    updatePongGame();
    drawPongGame();
    if (!pongGame.gameOver) {
        pongGame.gameLoopRunning = requestAnimationFrame(pongGameLoop);
    } else {
        pongGame.gameLoopRunning = null;
    }
}

// Minigame 16: Pac-Man Style
function initPacManGame() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-pacman">
            <h2>👻 Pac-Man Style</h2>
            <p>Use Arrow Keys or WASD to move! Collect dots for money (2 money each). Avoid ghosts!</p>
            <div id="pacman-canvas-container" style="text-align: center; margin: 20px 0;">
                <canvas id="pacman-canvas" style="border: 3px solid #FF0000; background: #000; cursor: pointer;"></canvas>
            </div>
            <div id="pacman-info" style="color: #FFD700; font-weight: bold; font-size: 1.1em; margin: 10px 0;">
                Score: <span id="pacman-score">0</span> | Charge: <span id="pacman-charge">0</span> | Lives: <span id="pacman-lives">3</span> | Level: <span id="pacman-level">1</span>
            </div>
            <button class="btn btn-large" onclick="startPacManGame()">Start Game</button>
            <div id="pacman-result"></div>
        </div>
    `;
    const canvas = document.getElementById('pacman-canvas');
    if (canvas) {
        canvas.width = 600;
        canvas.height = 400;
    }
}

let pacManGame = {
    canvas: null,
    ctx: null,
    player: { x: 50, y: 50, size: 20, direction: 'right', nextDirection: 'right' },
    dots: [],
    bigOrbs: [],
    ghosts: [],
    walls: [],
    maze: null,
    score: 0,
    charge: 0,
    lives: 3,
    level: 1,
    gameStarted: false,
    gameOver: false,
    keys: {},
    gridSize: 20,
    cellSize: 20,
    gameLoopRunning: null
};

function startPacManGame() {
    const canvas = document.getElementById('pacman-canvas');
    if (!canvas) return;
    
    // Reset game state completely to prevent speed issues
    if (pacManGame.gameLoopRunning) {
        cancelAnimationFrame(pacManGame.gameLoopRunning);
    }
    document.removeEventListener('keydown', handlePacManKeyDown);
    
    pacManGame.canvas = canvas;
    pacManGame.ctx = canvas.getContext('2d');
    pacManGame.gameStarted = true;
    pacManGame.gameOver = false;
    pacManGame.score = 0;
    pacManGame.charge = 0;
    pacManGame.lives = 3;
    pacManGame.level = 1;
    pacManGame.player = { x: 50, y: 50, size: 20, direction: 'right', nextDirection: 'right' };
    pacManGame.dots = [];
    pacManGame.bigOrbs = [];
    pacManGame.ghosts = [];
    pacManGame.walls = [];
    pacManGame.gameLoopRunning = null;
    
    generatePacManMaze();
    
    document.addEventListener('keydown', handlePacManKeyDown);
    pacManGameLoop();
}

function generatePacManMaze() {
    const canvas = pacManGame.canvas;
    const cols = Math.floor(canvas.width / pacManGame.cellSize);
    const rows = Math.floor(canvas.height / pacManGame.cellSize);
    
    // Generate maze using recursive backtracking
    const maze = generatePacManMazeAlgorithm(cols, rows);
    
    // Convert maze to walls
    pacManGame.walls = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = maze[y][x];
            const wallThickness = 4; // Wider walls for easier movement
            if (cell.walls.top) {
                pacManGame.walls.push({ x: x * pacManGame.cellSize, y: y * pacManGame.cellSize, width: pacManGame.cellSize, height: wallThickness });
            }
            if (cell.walls.left) {
                pacManGame.walls.push({ x: x * pacManGame.cellSize, y: y * pacManGame.cellSize, width: wallThickness, height: pacManGame.cellSize });
            }
            if (cell.walls.bottom) {
                pacManGame.walls.push({ x: x * pacManGame.cellSize, y: (y + 1) * pacManGame.cellSize - wallThickness, width: pacManGame.cellSize, height: wallThickness });
            }
            if (cell.walls.right) {
                pacManGame.walls.push({ x: (x + 1) * pacManGame.cellSize - wallThickness, y: y * pacManGame.cellSize, width: wallThickness, height: pacManGame.cellSize });
            }
        }
    }
    
    // Add outer walls (wider)
    const wallThickness = 4;
    pacManGame.walls.push({ x: 0, y: 0, width: canvas.width, height: wallThickness });
    pacManGame.walls.push({ x: 0, y: 0, width: wallThickness, height: canvas.height });
    pacManGame.walls.push({ x: canvas.width - wallThickness, y: 0, width: wallThickness, height: canvas.height });
    pacManGame.walls.push({ x: 0, y: canvas.height - wallThickness, width: canvas.width, height: wallThickness });
    
    // Place dots in all walkable areas (not in walls)
    pacManGame.dots = [];
    for (let y = pacManGame.cellSize; y < canvas.height - pacManGame.cellSize; y += pacManGame.cellSize) {
        for (let x = pacManGame.cellSize; x < canvas.width - pacManGame.cellSize; x += pacManGame.cellSize) {
            // Check if position is not in a wall
            const inWall = pacManGame.walls.some(wall => 
                x >= wall.x && x < wall.x + wall.width &&
                y >= wall.y && y < wall.y + wall.height
            );
            if (!inWall) {
                pacManGame.dots.push({ x, y, collected: false });
            }
        }
    }
    
    // Place big orbs rarely (5% chance)
    pacManGame.bigOrbs = [];
    pacManGame.dots.forEach(dot => {
        if (!dot.collected && Math.random() < 0.05) {
            pacManGame.bigOrbs.push({ x: dot.x, y: dot.y, collected: false });
            dot.collected = true; // Replace dot with big orb
        }
    });
    
    // Generate ghosts based on level
    const numGhosts = 3 + (pacManGame.level - 1);
    pacManGame.ghosts = [];
    for (let i = 0; i < numGhosts; i++) {
        // Find a valid spawn position (not in wall, not on player)
        let spawnX, spawnY;
        let attempts = 0;
        do {
            spawnX = Math.floor(Math.random() * (cols - 2) + 1) * pacManGame.cellSize;
            spawnY = Math.floor(Math.random() * (rows - 2) + 1) * pacManGame.cellSize;
            attempts++;
        } while (attempts < 50 && (
            pacManGame.walls.some(w => spawnX >= w.x && spawnX < w.x + w.width && spawnY >= w.y && spawnY < w.y + w.height) ||
            (spawnX === pacManGame.player.x && spawnY === pacManGame.player.y)
        ));
        
        pacManGame.ghosts.push({
            x: spawnX,
            y: spawnY,
            size: 20,
            direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
            color: ['#FF0000', '#00FFFF', '#FFFF00', '#FF00FF', '#00FF00'][i % 5],
            targetX: spawnX,
            targetY: spawnY
        });
    }
    
    // Place player at start
    pacManGame.player.x = pacManGame.cellSize + 10;
    pacManGame.player.y = pacManGame.cellSize + 10;
    // Ensure player always has a valid direction
    if (!pacManGame.player.direction || pacManGame.player.direction === '') {
        pacManGame.player.direction = 'right';
    }
    if (!pacManGame.player.nextDirection || pacManGame.player.nextDirection === '') {
        pacManGame.player.nextDirection = pacManGame.player.direction;
    }
}

function generatePacManMazeAlgorithm(cols, rows) {
    const maze = [];
    for (let y = 0; y < rows; y++) {
        maze[y] = [];
        for (let x = 0; x < cols; x++) {
            maze[y][x] = {
                walls: { top: true, right: true, bottom: true, left: true },
                visited: false
            };
        }
    }
    
    const stack = [];
    let current = { x: 0, y: 0 };
    maze[current.y][current.x].visited = true;
    
    while (true) {
        const neighbors = [];
        const { x, y } = current;
        
        if (y > 0 && !maze[y - 1][x].visited) neighbors.push({ x, y: y - 1, dir: 'top' });
        if (x < cols - 1 && !maze[y][x + 1].visited) neighbors.push({ x: x + 1, y, dir: 'right' });
        if (y < rows - 1 && !maze[y + 1][x].visited) neighbors.push({ x, y: y + 1, dir: 'bottom' });
        if (x > 0 && !maze[y][x - 1].visited) neighbors.push({ x: x - 1, y, dir: 'left' });
        
        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            stack.push(current);
            
            if (next.dir === 'top') {
                maze[y][x].walls.top = false;
                maze[y - 1][x].walls.bottom = false;
            } else if (next.dir === 'right') {
                maze[y][x].walls.right = false;
                maze[y][x + 1].walls.left = false;
            } else if (next.dir === 'bottom') {
                maze[y][x].walls.bottom = false;
                maze[y + 1][x].walls.top = false;
            } else if (next.dir === 'left') {
                maze[y][x].walls.left = false;
                maze[y][x - 1].walls.right = false;
            }
            
            current = { x: next.x, y: next.y };
            maze[current.y][current.x].visited = true;
        } else if (stack.length > 0) {
            current = stack.pop();
        } else {
            break;
        }
    }
    
    return maze;
}

function handlePacManKeyDown(e) {
    // Only handle if Pac-Man game is active and we're in the game screen
    const pacManCanvas = document.getElementById('pacman-canvas');
    if (!pacManGame.gameStarted || pacManGame.gameOver || !pacManCanvas) return;
    
    // Only prevent default if the key is relevant to Pac-Man
    const key = e.key;
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        pacManGame.player.nextDirection = 'up';
        e.preventDefault();
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        pacManGame.player.nextDirection = 'down';
        e.preventDefault();
    } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        pacManGame.player.nextDirection = 'left';
        e.preventDefault();
    } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        pacManGame.player.nextDirection = 'right';
        e.preventDefault();
    }
}

function isPacManWallCollision(x, y, size) {
    return pacManGame.walls.some(wall => 
        x < wall.x + wall.width &&
        x + size > wall.x &&
        y < wall.y + wall.height &&
        y + size > wall.y
    );
}

function updatePacManGame() {
    if (!pacManGame.gameStarted || pacManGame.gameOver) return;
    
    const speed = 2; // Slightly slower for better control
    
    // Ensure player always has a direction
    if (!pacManGame.player.direction || pacManGame.player.direction === '') {
        pacManGame.player.direction = 'right';
    }
    
    // Try to change direction if nextDirection is set and different
    if (pacManGame.player.nextDirection && pacManGame.player.nextDirection !== pacManGame.player.direction) {
        // Check if we can change direction
        let testX = pacManGame.player.x;
        let testY = pacManGame.player.y;
        
        if (pacManGame.player.nextDirection === 'up') {
            testY = pacManGame.player.y - speed;
        } else if (pacManGame.player.nextDirection === 'down') {
            testY = pacManGame.player.y + speed;
        } else if (pacManGame.player.nextDirection === 'left') {
            testX = pacManGame.player.x - speed;
        } else if (pacManGame.player.nextDirection === 'right') {
            testX = pacManGame.player.x + speed;
        }
        
        if (!isPacManWallCollision(testX, testY, pacManGame.player.size)) {
            pacManGame.player.direction = pacManGame.player.nextDirection;
        }
    }
    
    // Constantly move player in current direction
    let newX = pacManGame.player.x;
    let newY = pacManGame.player.y;
    
    if (pacManGame.player.direction === 'up') {
        newY = Math.max(0, pacManGame.player.y - speed);
    } else if (pacManGame.player.direction === 'down') {
        newY = Math.min(pacManGame.canvas.height - pacManGame.player.size, pacManGame.player.y + speed);
    } else if (pacManGame.player.direction === 'left') {
        newX = Math.max(0, pacManGame.player.x - speed);
    } else if (pacManGame.player.direction === 'right') {
        newX = Math.min(pacManGame.canvas.width - pacManGame.player.size, pacManGame.player.x + speed);
    }
    
    if (!isPacManWallCollision(newX, newY, pacManGame.player.size)) {
        pacManGame.player.x = newX;
        pacManGame.player.y = newY;
    } else {
        // If can't move in current direction, try to continue in a valid direction
        // Try all four directions to find a valid path
        const directions = ['up', 'down', 'left', 'right'];
        let foundPath = false;
        for (const dir of directions) {
            let testX2 = pacManGame.player.x;
            let testY2 = pacManGame.player.y;
            if (dir === 'up') testY2 = Math.max(0, pacManGame.player.y - speed);
            else if (dir === 'down') testY2 = Math.min(pacManGame.canvas.height - pacManGame.player.size, pacManGame.player.y + speed);
            else if (dir === 'left') testX2 = Math.max(0, pacManGame.player.x - speed);
            else if (dir === 'right') testX2 = Math.min(pacManGame.canvas.width - pacManGame.player.size, pacManGame.player.x + speed);
            
            if (!isPacManWallCollision(testX2, testY2, pacManGame.player.size)) {
                pacManGame.player.direction = dir;
                pacManGame.player.x = testX2;
                pacManGame.player.y = testY2;
                foundPath = true;
                break;
            }
        }
        if (!foundPath) {
            // Truly stuck - reset nextDirection but keep trying current direction
            pacManGame.player.nextDirection = pacManGame.player.direction;
        }
    }
    
    // Collect dots (worth 1/8 charge each)
    pacManGame.dots.forEach(dot => {
        if (!dot.collected) {
            const dx = dot.x - (pacManGame.player.x + pacManGame.player.size / 2);
            const dy = dot.y - (pacManGame.player.y + pacManGame.player.size / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
                dot.collected = true;
                pacManGame.score += 10;
                pacManGame.charge += 1/8; // 1/8 charge per dot
                updatePacManDisplay();
            }
        }
    });
    
    // Collect big orbs (worth 5 charge each)
    pacManGame.bigOrbs.forEach(orb => {
        if (!orb.collected) {
            const dx = orb.x - (pacManGame.player.x + pacManGame.player.size / 2);
            const dy = orb.y - (pacManGame.player.y + pacManGame.player.size / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
                orb.collected = true;
                pacManGame.score += 50;
                pacManGame.charge += 5; // 5 charge per big orb
                updatePacManDisplay();
            }
        }
    });
    
    // Move ghosts (follow maze paths)
    pacManGame.ghosts.forEach(ghost => {
        // Simple AI: try to move towards player, but follow maze
        const dx = pacManGame.player.x - ghost.x;
        const dy = pacManGame.player.y - ghost.y;
        
        // Try to move in direction of player
        const directions = [];
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) directions.push('right');
            else directions.push('left');
        } else {
            if (dy > 0) directions.push('down');
            else directions.push('up');
        }
        
        // Try to move in preferred direction
        let moved = false;
        for (const dir of directions) {
            let testX = ghost.x;
            let testY = ghost.y;
            if (dir === 'up') testY -= speed;
            else if (dir === 'down') testY += speed;
            else if (dir === 'left') testX -= speed;
            else if (dir === 'right') testX += speed;
            
            if (!isPacManWallCollision(testX, testY, ghost.size)) {
                ghost.x = testX;
                ghost.y = testY;
                ghost.direction = dir;
                moved = true;
                break;
            }
        }
        
        // If couldn't move, try random direction
        if (!moved) {
            const randomDirs = ['up', 'down', 'left', 'right'];
            for (const dir of randomDirs.sort(() => Math.random() - 0.5)) {
                let testX = ghost.x;
                let testY = ghost.y;
                if (dir === 'up') testY -= speed;
                else if (dir === 'down') testY += speed;
                else if (dir === 'left') testX -= speed;
                else if (dir === 'right') testX += speed;
                
                if (!isPacManWallCollision(testX, testY, ghost.size)) {
                    ghost.x = testX;
                    ghost.y = testY;
                    ghost.direction = dir;
                    break;
                }
            }
        }
        
        // Check collision with player
        const dx2 = ghost.x - pacManGame.player.x;
        const dy2 = ghost.y - pacManGame.player.y;
        const distance = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        
        if (distance < (ghost.size + pacManGame.player.size) / 2) {
            pacManGame.lives--;
            if (pacManGame.lives <= 0) {
                pacManGame.gameOver = true;
                endPacManGame();
            } else {
                // Reset position
                pacManGame.player.x = pacManGame.cellSize + 10;
                pacManGame.player.y = pacManGame.cellSize + 10;
            }
        }
    });
    
    // Win condition: all dots collected
    if (pacManGame.dots.every(d => d.collected) && pacManGame.bigOrbs.every(o => o.collected)) {
        // Round charge to nearest integer and add it
        const roundedCharge = Math.round(pacManGame.charge);
        addMinigameCharge(roundedCharge);
        
        // Move to next level
        pacManGame.level++;
        const levelChange = Math.random() < 0.5 ? 'ghost' : 'size';
        if (levelChange === 'ghost') {
            // Add 1 more ghost
        } else {
            // Make map 50% bigger (scale canvas)
            pacManGame.canvas.width = Math.min(900, Math.floor(pacManGame.canvas.width * 1.5));
            pacManGame.canvas.height = Math.min(600, Math.floor(pacManGame.canvas.height * 1.5));
        }
        
        generatePacManMaze();
        updatePacManDisplay();
    }
}

function drawPacManGame() {
    if (!pacManGame.ctx) return;
    const ctx = pacManGame.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, pacManGame.canvas.width, pacManGame.canvas.height);
    
    // Draw walls
    ctx.fillStyle = '#0000FF';
    pacManGame.walls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
    
    // Draw dots
    ctx.fillStyle = '#FFD700';
    pacManGame.dots.forEach(dot => {
        if (!dot.collected) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Draw big orbs
    ctx.fillStyle = '#FFFFFF';
    pacManGame.bigOrbs.forEach(orb => {
        if (!orb.collected) {
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
    
    // Draw ghosts
    pacManGame.ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(ghost.x + ghost.size / 2, ghost.y + ghost.size / 2, ghost.size / 2, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(ghost.x + ghost.size / 2 - 5, ghost.y + ghost.size / 2 - 3, 3, 0, Math.PI * 2);
        ctx.arc(ghost.x + ghost.size / 2 + 5, ghost.y + ghost.size / 2 - 3, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw player (Pac-Man)
    ctx.fillStyle = '#FFFF00';
    const angle = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 }[pacManGame.player.direction] || 0;
    ctx.beginPath();
    ctx.arc(pacManGame.player.x + pacManGame.player.size / 2, pacManGame.player.y + pacManGame.player.size / 2, pacManGame.player.size / 2, angle + 0.3, angle + 2 * Math.PI - 0.3);
    ctx.lineTo(pacManGame.player.x + pacManGame.player.size / 2, pacManGame.player.y + pacManGame.player.size / 2);
    ctx.closePath();
    ctx.fill();
    
    if (pacManGame.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, pacManGame.canvas.width, pacManGame.canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', pacManGame.canvas.width / 2, pacManGame.canvas.height / 2);
        ctx.fillText(`Charge Earned: ${Math.round(pacManGame.charge)}`, pacManGame.canvas.width / 2, pacManGame.canvas.height / 2 + 40);
    }
}

function updatePacManDisplay() {
    const levelEl = document.getElementById('pacman-level');
    const scoreEl = document.getElementById('pacman-score');
    const chargeEl = document.getElementById('pacman-charge');
    const livesEl = document.getElementById('pacman-lives');
    if (levelEl) levelEl.textContent = pacManGame.level;
    if (scoreEl) scoreEl.textContent = pacManGame.score;
    if (chargeEl) chargeEl.textContent = (Math.round(pacManGame.charge * 100) / 100).toFixed(2);
    if (livesEl) livesEl.textContent = pacManGame.lives;
}

function endPacManGame() {
    const resultDiv = document.getElementById('pacman-result');
    const roundedCharge = Math.round(pacManGame.charge);
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold; font-size: 1.5em;">Game Over! Earned ${roundedCharge} minigame charge!</div>`;
    }
    if (typeof addLog === 'function') {
        addLog(`👻 Pac-Man: Score ${pacManGame.score}, Level ${pacManGame.level}, Earned ${roundedCharge} minigame charge!`);
    }
    // Add rounded charge
    addMinigameCharge(roundedCharge);
}

function pacManGameLoop() {
    if (!pacManGame.gameStarted) return;
    updatePacManGame();
    drawPacManGame();
    updatePacManDisplay();
    if (!pacManGame.gameOver) {
        pacManGame.gameLoopRunning = requestAnimationFrame(pacManGameLoop);
    } else {
        pacManGame.gameLoopRunning = null;
    }
}

// Minigame 17: Space Invaders
function initSpaceInvadersGame() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-space-invaders">
            <h2>👾 Space Invaders</h2>
            <p>Arrow Keys or A/D to move, Spacebar to shoot! Destroy aliens for money. Each alien = 15 money!</p>
            <div id="space-invaders-canvas-container" style="text-align: center; margin: 20px 0;">
                <canvas id="space-invaders-canvas" style="border: 3px solid #FF0000; background: #000; cursor: pointer;"></canvas>
            </div>
            <div id="space-invaders-info" style="color: #FFD700; font-weight: bold; font-size: 1.1em; margin: 10px 0;">
                Score: <span id="space-invaders-score">0</span> | Money: <span id="space-invaders-money">0</span> | Lives: <span id="space-invaders-lives">3</span>
            </div>
            <button class="btn btn-large" onclick="startSpaceInvadersGame()">Start Game</button>
            <div id="space-invaders-result"></div>
        </div>
    `;
    const canvas = document.getElementById('space-invaders-canvas');
    if (canvas) {
        canvas.width = 600;
        canvas.height = 500;
    }
}

let spaceInvadersGame = {
    canvas: null,
    ctx: null,
    player: { x: 300, y: 450, width: 50, height: 20, speed: 5 },
    bullets: [],
    aliens: [],
    alienBullets: [],
    score: 0,
    charge: 0, // Changed from money to charge
    lives: 3,
    gameStarted: false,
    gameOver: false,
    keys: {},
    lastShot: 0,
    gameLoopRunning: null
};

function startSpaceInvadersGame() {
    const canvas = document.getElementById('space-invaders-canvas');
    if (!canvas) return;
    
    // Reset game state completely to prevent speed issues
    if (spaceInvadersGame.gameLoopRunning) {
        cancelAnimationFrame(spaceInvadersGame.gameLoopRunning);
    }
    document.removeEventListener('keydown', handleSpaceInvadersKeyDown);
    document.removeEventListener('keyup', handleSpaceInvadersKeyUp);
    
    spaceInvadersGame.canvas = canvas;
    spaceInvadersGame.ctx = canvas.getContext('2d');
    spaceInvadersGame.gameStarted = true;
    spaceInvadersGame.gameOver = false;
    spaceInvadersGame.score = 0;
    spaceInvadersGame.charge = 0; // Changed from money to charge
    spaceInvadersGame.lives = 3;
    spaceInvadersGame.player = { x: 300, y: 450, width: 25, height: 20, speed: 5 }; // Half width
    spaceInvadersGame.bullets = [];
    spaceInvadersGame.alienBullets = [];
    spaceInvadersGame.aliens = [];
    spaceInvadersGame.keys = {};
    spaceInvadersGame.lastShot = 0;
    
    // Create aliens grid
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
            spaceInvadersGame.aliens.push({
                x: col * 70 + 50,
                y: row * 40 + 50,
                width: 40,
                height: 30,
                destroyed: false,
                dx: 1
            });
        }
    }
    
    document.addEventListener('keydown', handleSpaceInvadersKeyDown);
    document.addEventListener('keyup', handleSpaceInvadersKeyUp);
    spaceInvadersGameLoop();
}

function handleSpaceInvadersKeyDown(e) {
    if (!spaceInvadersGame.gameStarted || spaceInvadersGame.gameOver) return;
    spaceInvadersGame.keys[e.key] = true;
    
    if (e.key === ' ' || e.code === 'Space') {
        const now = Date.now();
        if (now - spaceInvadersGame.lastShot > 300) { // Limit fire rate
            spaceInvadersGame.bullets.push({
                x: spaceInvadersGame.player.x + spaceInvadersGame.player.width / 2,
                y: spaceInvadersGame.player.y,
                width: 4,
                height: 10,
                dy: -7
            });
            spaceInvadersGame.lastShot = now;
        }
    }
    e.preventDefault();
}

function handleSpaceInvadersKeyUp(e) {
    spaceInvadersGame.keys[e.key] = false;
}

function updateSpaceInvadersGame() {
    if (!spaceInvadersGame.gameStarted || spaceInvadersGame.gameOver) return;
    
    // Move player
    if (spaceInvadersGame.keys['ArrowLeft'] || spaceInvadersGame.keys['a'] || spaceInvadersGame.keys['A']) {
        spaceInvadersGame.player.x = Math.max(0, spaceInvadersGame.player.x - spaceInvadersGame.player.speed);
    }
    if (spaceInvadersGame.keys['ArrowRight'] || spaceInvadersGame.keys['d'] || spaceInvadersGame.keys['D']) {
        spaceInvadersGame.player.x = Math.min(spaceInvadersGame.canvas.width - spaceInvadersGame.player.width, spaceInvadersGame.player.x + spaceInvadersGame.player.speed);
    }
    
    // Move bullets
    spaceInvadersGame.bullets.forEach((bullet, index) => {
        bullet.y += bullet.dy;
        if (bullet.y < 0) {
            spaceInvadersGame.bullets.splice(index, 1);
        } else {
            // Check collision with aliens
            spaceInvadersGame.aliens.forEach(alien => {
                if (!alien.destroyed &&
                    bullet.x >= alien.x &&
                    bullet.x <= alien.x + alien.width &&
                    bullet.y >= alien.y &&
                    bullet.y <= alien.y + alien.height) {
                    alien.destroyed = true;
                    spaceInvadersGame.bullets.splice(index, 1);
                    spaceInvadersGame.score += 100;
                    spaceInvadersGame.charge += 1; // 1 charge per alien
                    updateSpaceInvadersDisplay();
                }
            });
        }
    });
    
    // Move aliens
    let shouldMoveDown = false;
    spaceInvadersGame.aliens.forEach(alien => {
        if (!alien.destroyed) {
            if (alien.x + alien.width >= spaceInvadersGame.canvas.width || alien.x <= 0) {
                shouldMoveDown = true;
            }
        }
    });
    
    spaceInvadersGame.aliens.forEach(alien => {
        if (!alien.destroyed) {
            if (shouldMoveDown) {
                alien.dy = 5;
                alien.dx = -alien.dx;
            }
            alien.x += alien.dx;
            alien.y += (alien.dy || 0);
            alien.dy = 0;
            
            // Alien reached bottom
            if (alien.y + alien.height >= spaceInvadersGame.canvas.height) {
                spaceInvadersGame.gameOver = true;
                endSpaceInvadersGame();
            }
            
            // Random alien shooting
            if (Math.random() < 0.005) {
                spaceInvadersGame.alienBullets.push({
                    x: alien.x + alien.width / 2,
                    y: alien.y + alien.height,
                    width: 4,
                    height: 10,
                    dy: 3
                });
            }
        }
    });
    
    // Move alien bullets
    spaceInvadersGame.alienBullets.forEach((bullet, index) => {
        bullet.y += bullet.dy;
        if (bullet.y > spaceInvadersGame.canvas.height) {
            spaceInvadersGame.alienBullets.splice(index, 1);
        } else {
            // Check collision with player
            if (bullet.x >= spaceInvadersGame.player.x &&
                bullet.x <= spaceInvadersGame.player.x + spaceInvadersGame.player.width &&
                bullet.y >= spaceInvadersGame.player.y &&
                bullet.y <= spaceInvadersGame.player.y + spaceInvadersGame.player.height) {
                spaceInvadersGame.alienBullets.splice(index, 1);
                spaceInvadersGame.lives--;
                if (spaceInvadersGame.lives <= 0) {
                    spaceInvadersGame.gameOver = true;
                    endSpaceInvadersGame();
                }
            }
        }
    });
    
    // Win condition
    if (spaceInvadersGame.aliens.every(a => a.destroyed)) {
        spaceInvadersGame.gameOver = true;
        // Add charge earned
        if (spaceInvadersGame.charge > 0) {
            addMinigameCharge(spaceInvadersGame.charge);
        }
        endSpaceInvadersGame();
    }
}

function drawSpaceInvadersGame() {
    if (!spaceInvadersGame.ctx) return;
    const ctx = spaceInvadersGame.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, spaceInvadersGame.canvas.width, spaceInvadersGame.canvas.height);
    
    // Draw stars background
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 50; i++) {
        ctx.fillRect(Math.random() * spaceInvadersGame.canvas.width, Math.random() * spaceInvadersGame.canvas.height, 2, 2);
    }
    
    // Draw aliens
    spaceInvadersGame.aliens.forEach(alien => {
        if (!alien.destroyed) {
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(alien.x, alien.y, alien.width, alien.height);
        }
    });
    
    // Draw bullets
    ctx.fillStyle = '#FFFF00';
    spaceInvadersGame.bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
    });
    
    // Draw alien bullets
    ctx.fillStyle = '#FF0000';
    spaceInvadersGame.alienBullets.forEach(bullet => {
        ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
    });
    
    // Draw player
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(spaceInvadersGame.player.x, spaceInvadersGame.player.y, spaceInvadersGame.player.width, spaceInvadersGame.player.height);
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(spaceInvadersGame.player.x, spaceInvadersGame.player.y, spaceInvadersGame.player.width, spaceInvadersGame.player.height);
    
    if (spaceInvadersGame.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, spaceInvadersGame.canvas.width, spaceInvadersGame.canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', spaceInvadersGame.canvas.width / 2, spaceInvadersGame.canvas.height / 2);
        ctx.fillText(`Charge: ${spaceInvadersGame.charge}`, spaceInvadersGame.canvas.width / 2, spaceInvadersGame.canvas.height / 2 + 40);
    }
}

function updateSpaceInvadersDisplay() {
    const scoreEl = document.getElementById('space-invaders-score');
    const chargeEl = document.getElementById('space-invaders-charge');
    const livesEl = document.getElementById('space-invaders-lives');
    if (scoreEl) scoreEl.textContent = spaceInvadersGame.score;
    if (chargeEl) chargeEl.textContent = spaceInvadersGame.charge;
    if (livesEl) livesEl.textContent = spaceInvadersGame.lives;
}

function endSpaceInvadersGame() {
    const resultDiv = document.getElementById('space-invaders-result');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold; font-size: 1.5em;">Game Over! Earned ${spaceInvadersGame.charge} minigame charge!</div>`;
    }
    if (typeof addLog === 'function') {
        addLog(`👾 Space Invaders: Score ${spaceInvadersGame.score}, Earned ${spaceInvadersGame.charge} minigame charge!`);
    }
    // Add charge to player
    if (spaceInvadersGame.charge > 0) {
        addMinigameCharge(spaceInvadersGame.charge);
    }
}

function spaceInvadersGameLoop() {
    if (!spaceInvadersGame.gameStarted) return;
    updateSpaceInvadersGame();
    drawSpaceInvadersGame();
    updateSpaceInvadersDisplay();
    if (!spaceInvadersGame.gameOver) {
        requestAnimationFrame(spaceInvadersGameLoop);
    }
}

const MINIGAMES = [
    { name: 'Slot Machine', icon: '🎰', init: initSlotMachine },
    { name: 'Number Guessing', icon: '🎯', init: initNumberGuessing },
    { name: 'Rock Paper Scissors', icon: '✂️', init: initRockPaperScissors },
    { name: 'Dice Roll', icon: '🎲', init: initDiceRoll },
    { name: 'Card Flip', icon: '🃏', init: initCardFlip },
    { name: 'Coin Flip', icon: '🪙', init: initCoinFlip },
    { name: 'Memory Game', icon: '🧠', init: initMemoryGame },
    { name: 'Blackjack', icon: '🃏', init: initBlackjack },
    { name: 'Color Guessing', icon: '🎨', init: initColorGuessing },
    { name: 'Quick Math', icon: '🔢', init: initQuickMath },
    { name: 'Scary Cat Maze', icon: '🧩', init: initMazeGame },
    { name: 'Snake', icon: '🐍', init: initSnakeGame },
    { name: 'Breakout', icon: '🎾', init: initBreakoutGame },
    { name: 'Tetris', icon: '🧩', init: initTetrisGame },
    { name: 'Pong', icon: '🏓', init: initPongGame },
    { name: 'Pac-Man', icon: '👻', init: initPacManGame },
    { name: 'Space Invaders', icon: '👾', init: initSpaceInvadersGame }
];

function showMinigamesMenu() {
    const container = document.getElementById('minigame-container');
    if (!container) {
        console.error('minigame-container not found');
        // Wait a bit and try again
        setTimeout(() => {
            const retryContainer = document.getElementById('minigame-container');
            if (retryContainer) {
                showMinigamesMenu();
            }
        }, 100);
        return;
    }
    loadMinigameCharge();
    container.innerHTML = `
        <div class="minigames-menu">
            <h2>🎮 Minigames</h2>
            <div style="color: #FFD700; font-weight: bold; font-size: 1.1em; margin-bottom: 20px; text-align: center;">
                ⚡ Your Minigame Charge: <span id="menu-charge-display">${minigamesState.minigameCharge}</span>
            </div>
            <p style="text-align: center; color: #FFD700; margin-bottom: 20px;">Play minigames like Snake to earn charge! Each food in Snake = 5 charge!</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 20px;">
                <button class="btn btn-large" onclick="showGameThemes()">🎨 Game Themes</button>
            </div>
            <div class="minigames-grid">
                ${MINIGAMES.map((game, index) => `
                    <div class="minigame-card" onclick="selectMinigame(${index})">
                        <div class="minigame-icon">${game.icon}</div>
                        <div class="minigame-name">${game.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    updateMinigameChargeDisplay();
}

function selectMinigame(index) {
    if (MINIGAMES[index]) {
        MINIGAMES[index].init();
    }
}

// Initialize minigames on load
function initMinigames() {
    showMinigamesMenu();
}

// Make all minigame functions globally available
if (typeof window !== 'undefined') {
    window.spinSlotMachine = spinSlotMachine;
    window.playNumberGuessing = playNumberGuessing;
    window.playRPS = playRPS;
    window.playDiceRoll = playDiceRoll;
    window.playCardFlip = playCardFlip;
    window.playCoinFlip = playCoinFlip;
    window.flipMemoryCard = flipMemoryCard;
    window.startBlackjack = startBlackjack;
    window.playColorGuessing = playColorGuessing;
    window.playQuickMath = playQuickMath;
    window.startQuickMathGame = startQuickMathGame;
    window.startMazeGame = startMazeGame;
    window.startSnakeGame = startSnakeGame;
    window.startBreakoutGame = startBreakoutGame;
    window.startTetrisGame = startTetrisGame;
    window.startPongGame = startPongGame;
    window.startPacManGame = startPacManGame;
    window.startSpaceInvadersGame = startSpaceInvadersGame;
    window.showMinigamesMenu = showMinigamesMenu;
    window.selectMinigame = selectMinigame;
    window.initMinigames = initMinigames;
    window.showMazeSkinsShop = showMazeSkinsShop;
    window.loadMazeSkin = loadMazeSkin;
    window.buyMazeSkin = buyMazeSkin;
    window.selectMazeSkin = selectMazeSkin;
    window.loadMinigameCharge = loadMinigameCharge;
    window.addMinigameCharge = addMinigameCharge;
    window.updateMinigameChargeDisplay = updateMinigameChargeDisplay;
    window.showChargeConversion = showChargeConversion;
    window.convertChargeToMoney = convertChargeToMoney;
    window.updateSoloChargeDisplay = updateSoloChargeDisplay;
}

// Charge to Money Conversion (10 charge = 5 money)
function showChargeConversion() {
    loadMinigameCharge();
    const overlay = document.createElement('div');
    overlay.id = 'charge-conversion-modal';
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
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
        border: 5px solid #FFD700;
        border-radius: 20px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
    `;
    
    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="color: #FFD700; font-size: 2em; font-weight: bold; margin: 0;">💰 Convert Charge to Money</h2>
            <button onclick="this.closest('#charge-conversion-modal').remove()" style="
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
        <div style="color: #FFD700; font-size: 1.2em; margin-bottom: 20px; font-weight: bold;">
            ⚡ Your Charge: ${minigamesState.minigameCharge}
        </div>
        <div style="color: #FFD700; font-size: 1em; margin-bottom: 20px;">
            Conversion Rate: <strong>10 Charge = 5 Money</strong>
        </div>
        <div style="margin-bottom: 20px;">
            <label style="color: #FFD700; font-weight: bold; display: block; margin-bottom: 10px;">Amount of Charge to Convert:</label>
            <input type="number" id="charge-convert-amount" min="10" step="10" value="10" style="
                width: 100%;
                padding: 10px;
                background: #2a2a2a;
                border: 2px solid #FFD700;
                border-radius: 10px;
                color: #FFD700;
                font-size: 1.1em;
                font-weight: bold;
            ">
        </div>
        <div style="color: #FFD700; font-size: 1em; margin-bottom: 20px; font-weight: bold;">
            You will receive: <span id="money-preview">0</span> money
        </div>
        <button class="btn btn-large" onclick="convertChargeToMoney()" style="width: 100%;">Convert</button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Update preview on input change
    const amountInput = document.getElementById('charge-convert-amount');
    const preview = document.getElementById('money-preview');
    amountInput.addEventListener('input', () => {
        const amount = parseInt(amountInput.value) || 0;
        const money = Math.floor(amount / 10) * 5;
        preview.textContent = money;
    });
    amountInput.dispatchEvent(new Event('input'));
}

function convertChargeToMoney() {
    loadMinigameCharge();
    const amountInput = document.getElementById('charge-convert-amount');
    const amount = parseInt(amountInput.value) || 0;
    
    if (amount < 10) {
        alert('Minimum conversion is 10 charge!');
        return;
    }
    
    if (amount % 10 !== 0) {
        alert('Amount must be a multiple of 10!');
        return;
    }
    
    if (minigamesState.minigameCharge < amount) {
        alert(`You don't have enough charge! You have ${minigamesState.minigameCharge}, but need ${amount}.`);
        return;
    }
    
    const money = Math.floor(amount / 10) * 5;
    minigamesState.minigameCharge -= amount;
    saveMinigameCharge();
    
    // Add money to solo mode player if in solo mode
    if (typeof gameState !== 'undefined' && gameState.players && gameState.playerId !== undefined) {
        const player = gameState.players[gameState.playerId];
        if (player) {
            player.money += money;
            if (typeof updateDisplay === 'function') {
                updateDisplay();
            }
        }
    }
    
    if (typeof addLog === 'function') {
        addLog(`💰 Converted ${amount} charge to ${money} money!`);
    }
    
    // Close modal
    const modal = document.getElementById('charge-conversion-modal');
    if (modal) modal.remove();
    
    // Update displays
    updateMinigameChargeDisplay();
}

// Update solo charge display
function updateSoloChargeDisplay() {
    loadMinigameCharge();
    const soloDisplay = document.getElementById('solo-charge-count');
    if (soloDisplay) {
        soloDisplay.textContent = minigamesState.minigameCharge;
    }
}

// ==================== MINIGAME SKINS SYSTEM ====================
// Generic skin system for all minigames
const MINIGAME_SKINS = {
    slot: {
        default: { name: 'Default', cost: 0, owned: true, colors: { primary: '#FFD700', secondary: '#FF0000', bg: '#000' } },
        brown: { name: 'Brown Slot', cost: 150, owned: false, colors: { primary: '#8B4513', secondary: '#A0522D', bg: '#3E2723' } },
        neon: { name: 'Neon', cost: 175, owned: false, colors: { primary: '#00FFFF', secondary: '#FF00FF', bg: '#000' } },
        gold: { name: 'Gold', cost: 200, owned: false, colors: { primary: '#FFD700', secondary: '#FFA500', bg: '#1a1a1a' } },
        retro: { name: 'Retro', cost: 180, owned: false, colors: { primary: '#FF00FF', secondary: '#00FFFF', bg: '#0a0a0a' } }
    },
    number: {
        default: { name: 'Default', cost: 0, owned: true, colors: { primary: '#FFD700', secondary: '#FF0000', bg: '#000' } },
        neon: { name: 'Neon', cost: 150, owned: false, colors: { primary: '#00FFFF', secondary: '#FF00FF', bg: '#000' } },
        gold: { name: 'Gold', cost: 200, owned: false, colors: { primary: '#FFD700', secondary: '#FFA500', bg: '#1a1a1a' } },
        retro: { name: 'Retro', cost: 175, owned: false, colors: { primary: '#FF00FF', secondary: '#00FFFF', bg: '#0a0a0a' } }
    },
    rps: {
        default: { name: 'Default', cost: 0, owned: true, colors: { primary: '#FFD700', secondary: '#FF0000', bg: '#000' } },
        neon: { name: 'Neon', cost: 150, owned: false, colors: { primary: '#00FFFF', secondary: '#FF00FF', bg: '#000' } },
        gold: { name: 'Gold', cost: 200, owned: false, colors: { primary: '#FFD700', secondary: '#FFA500', bg: '#1a1a1a' } },
        retro: { name: 'Retro', cost: 175, owned: false, colors: { primary: '#FF00FF', secondary: '#00FFFF', bg: '#0a0a0a' } }
    },
    dice: {
        default: { name: 'Default', cost: 0, owned: true, colors: { primary: '#FFD700', secondary: '#FF0000', bg: '#000' } },
        neon: { name: 'Neon', cost: 150, owned: false, colors: { primary: '#00FFFF', secondary: '#FF00FF', bg: '#000' } },
        gold: { name: 'Gold', cost: 200, owned: false, colors: { primary: '#FFD700', secondary: '#FFA500', bg: '#1a1a1a' } },
        retro: { name: 'Retro', cost: 175, owned: false, colors: { primary: '#FF00FF', secondary: '#00FFFF', bg: '#0a0a0a' } }
    },
    card: {
        default: { name: 'Default', cost: 0, owned: true, colors: { primary: '#FFD700', secondary: '#FF0000', bg: '#000' } },
        neon: { name: 'Neon', cost: 150, owned: false, colors: { primary: '#00FFFF', secondary: '#FF00FF', bg: '#000' } },
        gold: { name: 'Gold', cost: 200, owned: false, colors: { primary: '#FFD700', secondary: '#FFA500', bg: '#1a1a1a' } },
        retro: { name: 'Retro', cost: 175, owned: false, colors: { primary: '#FF00FF', secondary: '#00FFFF', bg: '#0a0a0a' } }
    },
    coin: {
        default: { name: 'Default', cost: 0, owned: true, colors: { primary: '#FFD700', secondary: '#FF0000', bg: '#000' } },
        green: { name: 'Green Coin', cost: 150, owned: false, colors: { primary: '#00FF00', secondary: '#32CD32', bg: '#001100' } },
        neon: { name: 'Neon', cost: 175, owned: false, colors: { primary: '#00FFFF', secondary: '#FF00FF', bg: '#000' } },
        gold: { name: 'Gold', cost: 200, owned: false, colors: { primary: '#FFD700', secondary: '#FFA500', bg: '#1a1a1a' } },
        retro: { name: 'Retro', cost: 180, owned: false, colors: { primary: '#FF00FF', secondary: '#00FFFF', bg: '#0a0a0a' } }
    },
    memory: {
        default: { name: 'Default', cost: 0, owned: true, colors: { primary: '#FFD700', secondary: '#FF0000', bg: '#000' } },
        neon: { name: 'Neon', cost: 150, owned: false, colors: { primary: '#00FFFF', secondary: '#FF00FF', bg: '#000' } },
        gold: { name: 'Gold', cost: 200, owned: false, colors: { primary: '#FFD700', secondary: '#FFA500', bg: '#1a1a1a' } },
        retro: { name: 'Retro', cost: 175, owned: false, colors: { primary: '#FF00FF', secondary: '#00FFFF', bg: '#0a0a0a' } }
    },
    blackjack: {
        default: { name: 'Default', cost: 0, owned: true, colors: { primary: '#FFD700', secondary: '#FF0000', bg: '#000' } },
        neon: { name: 'Neon', cost: 150, owned: false, colors: { primary: '#00FFFF', secondary: '#FF00FF', bg: '#000' } },
        gold: { name: 'Gold', cost: 200, owned: false, colors: { primary: '#FFD700', secondary: '#FFA500', bg: '#1a1a1a' } },
        retro: { name: 'Retro', cost: 175, owned: false, colors: { primary: '#FF00FF', secondary: '#00FFFF', bg: '#0a0a0a' } }
    },
    color: {
        default: { name: 'Default', cost: 0, owned: true, colors: { primary: '#FFD700', secondary: '#FF0000', bg: '#000' } },
        neon: { name: 'Neon', cost: 150, owned: false, colors: { primary: '#00FFFF', secondary: '#FF00FF', bg: '#000' } },
        gold: { name: 'Gold', cost: 200, owned: false, colors: { primary: '#FFD700', secondary: '#FFA500', bg: '#1a1a1a' } },
        retro: { name: 'Retro', cost: 175, owned: false, colors: { primary: '#FF00FF', secondary: '#00FFFF', bg: '#0a0a0a' } }
    },
    math: {
        default: { name: 'Default', cost: 0, owned: true, colors: { primary: '#FFD700', secondary: '#FF0000', bg: '#000' } },
        neon: { name: 'Neon', cost: 150, owned: false, colors: { primary: '#00FFFF', secondary: '#FF00FF', bg: '#000' } },
        gold: { name: 'Gold', cost: 200, owned: false, colors: { primary: '#FFD700', secondary: '#FFA500', bg: '#1a1a1a' } },
        retro: { name: 'Retro', cost: 175, owned: false, colors: { primary: '#FF00FF', secondary: '#00FFFF', bg: '#0a0a0a' } }
    }
};

// Load minigame skins
function loadMinigameSkins(gameType) {
    const saved = localStorage.getItem(`minigameSkin_${gameType}`);
    if (saved) {
        const owned = JSON.parse(saved);
        Object.keys(owned).forEach(key => {
            if (MINIGAME_SKINS[gameType] && MINIGAME_SKINS[gameType][key]) {
                MINIGAME_SKINS[gameType][key].owned = true;
            }
        });
    }
}

// Save minigame skins
function saveMinigameSkins(gameType) {
    const owned = {};
    if (MINIGAME_SKINS[gameType]) {
        Object.keys(MINIGAME_SKINS[gameType]).forEach(key => {
            if (MINIGAME_SKINS[gameType][key].owned) {
                owned[key] = true;
            }
        });
        localStorage.setItem(`minigameSkin_${gameType}`, JSON.stringify(owned));
    }
}

// Show minigame skins shop
function showMinigameSkinsShop(gameType) {
    loadMinigameCharge();
    loadMinigameSkins(gameType);
    
    if (!MINIGAME_SKINS[gameType]) {
        alert('No skins available for this minigame!');
        return;
    }
    
    const gameNames = {
        'slot': 'Slot Machine',
        'number': 'Number Guessing',
        'rps': 'Rock Paper Scissors',
        'dice': 'Dice Roll',
        'card': 'Card Flip',
        'coin': 'Coin Flip',
        'memory': 'Memory Game',
        'blackjack': 'Blackjack',
        'color': 'Color Guessing',
        'math': 'Quick Math'
    };
    
    const overlay = document.createElement('div');
    overlay.id = `minigame-skins-shop-${gameType}`;
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
    
    shopContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="color: #FFD700; font-size: 2em; font-weight: bold;">🎨 ${gameNames[gameType] || 'Minigame'} Skins</h2>
            <button onclick="this.closest('[id^=minigame-skins-shop]').remove()" style="
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
        <div style="color: #FFD700; font-size: 1.2em; margin-bottom: 20px; font-weight: bold;">
            ⚡ Minigame Charge: ${minigamesState.minigameCharge}
        </div>
        <div id="minigame-skin-list-${gameType}" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
        </div>
    `;
    
    const skinList = shopContent.querySelector(`#minigame-skin-list-${gameType}`);
    
    Object.keys(MINIGAME_SKINS[gameType]).forEach(skinKey => {
        const skin = MINIGAME_SKINS[gameType][skinKey];
        const skinCard = document.createElement('div');
        skinCard.style.cssText = `
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border: 3px solid ${skin.owned ? '#00FF00' : '#FFD700'};
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            cursor: ${skin.owned ? 'pointer' : 'default'};
            opacity: ${skin.owned ? '1' : '0.7'};
        `;
        
        const canBuy = minigamesState.minigameCharge >= skin.cost;
        const currentSkin = localStorage.getItem(`currentMinigameSkin_${gameType}`) || 'default';
        
        skinCard.innerHTML = `
            <div style="font-size: 3em; margin-bottom: 10px; color: ${skin.colors.primary};">🎨</div>
            <h3 style="color: #FFD700; font-weight: bold; margin-bottom: 10px;">${skin.name}</h3>
            ${skin.owned ? 
                `<div style="color: #00FF00; font-weight: bold; margin-bottom: 10px;">✓ OWNED</div>
                 <button onclick="selectMinigameSkin('${gameType}', '${skinKey}')" style="
                     background: ${currentSkin === skinKey ? '#666' : '#00FF00'};
                     color: #000;
                     border: none;
                     padding: 10px 20px;
                     border-radius: 10px;
                     font-weight: bold;
                     cursor: ${currentSkin === skinKey ? 'not-allowed' : 'pointer'};
                     opacity: ${currentSkin === skinKey ? '0.5' : '1'};
                 ">${currentSkin === skinKey ? 'CURRENT' : 'SELECT'}</button>` :
                `<div style="color: #FFD700; font-weight: bold; margin-bottom: 10px;">
                    Cost: ⚡ ${skin.cost} Minigame Charge
                </div>
                 <button onclick="buyMinigameSkin('${gameType}', '${skinKey}')" style="
                     background: ${canBuy ? '#FFD700' : '#666'};
                     color: #000;
                     border: none;
                     padding: 10px 20px;
                     border-radius: 10px;
                     font-weight: bold;
                     cursor: ${canBuy ? 'pointer' : 'not-allowed'};
                     opacity: ${canBuy ? '1' : '0.5'};
                 ">${canBuy ? 'BUY' : 'NEED ' + skin.cost + ' CHARGE'}</button>
                `
            }
        `;
        
        skinList.appendChild(skinCard);
    });
    
    overlay.appendChild(shopContent);
    document.body.appendChild(overlay);
}

// Buy minigame skin
function buyMinigameSkin(gameType, skinKey) {
    const skin = MINIGAME_SKINS[gameType] && MINIGAME_SKINS[gameType][skinKey];
    if (!skin || skin.owned) return;
    
    loadMinigameCharge();
    
    if (minigamesState.minigameCharge < skin.cost) {
        alert(`You need ${skin.cost} minigame charge to buy this skin!`);
        return;
    }
    
    minigamesState.minigameCharge -= skin.cost;
    saveMinigameCharge();
    
    skin.owned = true;
    saveMinigameSkins(gameType);
    
    if (typeof addLog === 'function') {
        addLog(`🎨 Purchased ${skin.name} for ${gameType} minigame for ${skin.cost} minigame charge!`);
    }
    
    // Refresh shop
    const overlay = document.getElementById(`minigame-skins-shop-${gameType}`);
    if (overlay) overlay.remove();
    showMinigameSkinsShop(gameType);
}

// Select minigame skin
function selectMinigameSkin(gameType, skinKey) {
    const skin = MINIGAME_SKINS[gameType] && MINIGAME_SKINS[gameType][skinKey];
    if (!skin || !skin.owned) return;
    
    localStorage.setItem(`currentMinigameSkin_${gameType}`, skinKey);
    
    // Apply skin to current minigame
    applyMinigameSkin(gameType, skinKey);
    
    if (typeof addLog === 'function') {
        addLog(`🎨 Selected ${skin.name} skin for ${gameType} minigame!`);
    }
    
    // Refresh shop
    const overlay = document.getElementById(`minigame-skins-shop-${gameType}`);
    if (overlay) overlay.remove();
    showMinigameSkinsShop(gameType);
}

// Apply minigame skin
function applyMinigameSkin(gameType, skinKey) {
    const skin = MINIGAME_SKINS[gameType] && MINIGAME_SKINS[gameType][skinKey];
    if (!skin) return;
    
    const container = document.getElementById('minigame-container');
    if (!container) return;
    
    // Apply CSS variables for skin
    const styleId = `minigame-skin-${gameType}`;
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `
        .minigame-${gameType}, .minigame-${gameType.replace('-', '-')} {
            --primary-color: ${skin.colors.primary};
            --secondary-color: ${skin.colors.secondary};
            --bg-color: ${skin.colors.bg};
        }
        .minigame-${gameType} h2,
        .minigame-${gameType} .btn {
            color: ${skin.colors.primary} !important;
        }
        .minigame-${gameType} {
            background: ${skin.colors.bg} !important;
        }
    `;
}

// Export functions
window.showMinigameSkinsShop = showMinigameSkinsShop;
window.buyMinigameSkin = buyMinigameSkin;
window.selectMinigameSkin = selectMinigameSkin;
window.applyMinigameSkin = applyMinigameSkin;

// Load minigame charge on page load
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            loadMinigameCharge();
            updateSoloChargeDisplay();
        });
    } else {
        loadMinigameCharge();
        updateSoloChargeDisplay();
    }
}

