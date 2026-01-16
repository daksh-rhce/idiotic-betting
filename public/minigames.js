// Minigames System
let minigamesState = {
    currentGame: null,
    playerMoney: 0
};

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
    container.innerHTML = `
        <div class="minigame-slot-machine">
            <h2>🎰 Slot Machine</h2>
            <div class="slot-display">
                <div class="slot-reel" id="reel1">🍒</div>
                <div class="slot-reel" id="reel2">🍒</div>
                <div class="slot-reel" id="reel3">🍒</div>
            </div>
            <div class="slot-controls">
                <input type="number" id="slot-bet" min="10" value="50" placeholder="Bet amount">
                <button class="btn btn-large" onclick="spinSlotMachine()">SPIN</button>
            </div>
            <div id="slot-result" class="slot-result"></div>
        </div>
    `;
}

function spinSlotMachine() {
    const betInput = document.getElementById('slot-bet');
    const bet = parseInt(betInput.value) || 50;
    const player = getMinigamePlayer();
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
    updateMinigameDisplay();
    
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
                player.money += win;
                resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold; font-size: 1.5em;">WIN! +${win} money!</div>`;
                addLog(`🎰 Slot Machine: Won ${win} money!`);
            } else {
                resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">Lost ${bet} money</div>`;
                addLog(`🎰 Slot Machine: Lost ${bet} money`);
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
            <div id="number-result" class="number-result"></div>
        </div>
    `;
}

function playNumberGuessing() {
    const betInput = document.getElementById('number-bet');
    const guessInput = document.getElementById('number-guess');
    const bet = parseInt(betInput.value) || 50;
    const guess = parseInt(guessInput.value);
    const player = gameState.players[gameState.playerId];
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    if (!guess || guess < 1 || guess > 100) {
        alert('Please enter a number between 1-100!');
        return;
    }
    
    player.money -= bet;
    updateDisplay();
    
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
        player.money += win;
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">Secret number was ${secretNumber}. You guessed ${guess}. WIN! +${win} money!</div>`;
        addLog(`🎯 Number Guessing: Won ${win} money!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">Secret number was ${secretNumber}. You guessed ${guess}. Lost ${bet} money</div>`;
        addLog(`🎯 Number Guessing: Lost ${bet} money`);
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
            <div id="rps-result" class="rps-result"></div>
        </div>
    `;
}

function playRPS(choice) {
    const betInput = document.getElementById('rps-bet');
    const bet = parseInt(betInput.value) || 50;
    const player = getMinigamePlayer();
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
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
        player.money += win;
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">You: ${emojis[choice]} vs Computer: ${emojis[computerChoice]}. WIN! +${win} money!</div>`;
        addLog(`✂️ Rock Paper Scissors: Won ${win} money!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">You: ${emojis[choice]} vs Computer: ${emojis[computerChoice]}. Lost ${bet} money</div>`;
        addLog(`✂️ Rock Paper Scissors: Lost ${bet} money`);
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
            <div id="dice-result" class="dice-result"></div>
        </div>
    `;
}

function playDiceRoll() {
    const betInput = document.getElementById('dice-bet');
    const bet = parseInt(betInput.value) || 50;
    const player = getMinigamePlayer();
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
    updateMinigameDisplay();
    
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
        player.money += win;
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">You: ${playerRoll} vs Computer: ${computerRoll}. WIN! +${win} money!</div>`;
        addLog(`🎲 Dice Roll: Won ${win} money!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">You: ${playerRoll} vs Computer: ${computerRoll}. Lost ${bet} money</div>`;
        addLog(`🎲 Dice Roll: Lost ${bet} money`);
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
            <div id="card-result" class="card-result"></div>
        </div>
    `;
}

function playCardFlip() {
    const betInput = document.getElementById('card-bet');
    const bet = parseInt(betInput.value) || 50;
    const player = getMinigamePlayer();
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
    updateMinigameDisplay();
    
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
        player.money += win;
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">You: ${playerCard.suit}${playerCard.value} vs Dealer: ${dealerCard.suit}${dealerCard.value}. WIN! +${win} money!</div>`;
        addLog(`🃏 Card Flip: Won ${win} money!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">You: ${playerCard.suit}${playerCard.value} vs Dealer: ${dealerCard.suit}${dealerCard.value}. Lost ${bet} money</div>`;
        addLog(`🃏 Card Flip: Lost ${bet} money`);
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
            <div id="coin-result" class="coin-result"></div>
        </div>
    `;
}

function playCoinFlip(choice) {
    const betInput = document.getElementById('coin-bet');
    const bet = parseInt(betInput.value) || 50;
    const player = getMinigamePlayer();
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
    updateMinigameDisplay();
    
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const resultDiv = document.getElementById('coin-result');
    
    let win = 0;
    if (choice === result) {
        win = bet * 2; // Win
    }
    
    if (win > 0) {
        player.money += win;
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">Result: ${result}. You chose ${choice}. WIN! +${win} money!</div>`;
        addLog(`🪙 Coin Flip: Won ${win} money!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">Result: ${result}. You chose ${choice}. Lost ${bet} money</div>`;
        addLog(`🪙 Coin Flip: Lost ${bet} money`);
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
                const player = getMinigamePlayer();
                const win = bet * 3;
                player.money += win;
                document.getElementById('memory-result').innerHTML = `<div style="color: #00ff00; font-weight: bold;">You won! +${win} money!</div>`;
                addLog(`🧠 Memory Game: Won ${win} money!`);
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
            <div id="bj-result"></div>
        </div>
    `;
}

function startBlackjack() {
    const betInput = document.getElementById('bj-bet');
    const bet = parseInt(betInput.value) || 50;
    const player = getMinigamePlayer();
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
    updateMinigameDisplay();
    
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
        player.money += win;
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">You: ${playerTotal} vs Dealer: ${dealerTotal}. WIN! +${win} money!</div>`;
        addLog(`🃏 Blackjack: Won ${win} money!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">You: ${playerTotal} vs Dealer: ${dealerTotal}. Lost ${bet} money</div>`;
        addLog(`🃏 Blackjack: Lost ${bet} money`);
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
            <div id="color-result"></div>
        </div>
    `;
}

function playColorGuessing(choice) {
    const betInput = document.getElementById('color-bet');
    const bet = parseInt(betInput.value) || 50;
    const player = getMinigamePlayer();
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
    updateMinigameDisplay();
    
    const result = Math.random() < 0.5 ? 'red' : 'black';
    const resultDiv = document.getElementById('color-result');
    
    let win = 0;
    if (choice === result) {
        win = bet * 2; // Win
    }
    
    if (win > 0) {
        player.money += win;
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">Result: ${result.toUpperCase()}. You chose ${choice.toUpperCase()}. WIN! +${win} money!</div>`;
        addLog(`🎨 Color Guessing: Won ${win} money!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">Result: ${result.toUpperCase()}. You chose ${choice.toUpperCase()}. Lost ${bet} money</div>`;
        addLog(`🎨 Color Guessing: Lost ${bet} money`);
    }
    updateMinigameDisplay();
}

// Minigame 10: Quick Math
function initQuickMath() {
    const container = document.getElementById('minigame-container');
    const num1 = Math.floor(Math.random() * 50) + 1;
    const num2 = Math.floor(Math.random() * 50) + 1;
    const answer = num1 + num2;
    
    window.currentMathAnswer = answer;
    
    container.innerHTML = `
        <div class="minigame-math">
            <h2>🔢 Quick Math</h2>
            <p>Solve: ${num1} + ${num2} = ?</p>
            <input type="number" id="math-bet" min="10" value="50" placeholder="Bet amount">
            <input type="number" id="math-answer" placeholder="Your answer">
            <button class="btn btn-large" onclick="playQuickMath()">SUBMIT</button>
            <div id="math-result"></div>
        </div>
    `;
}

function playQuickMath() {
    const betInput = document.getElementById('math-bet');
    const answerInput = document.getElementById('math-answer');
    const bet = parseInt(betInput.value) || 50;
    const answer = parseInt(answerInput.value);
    const player = getMinigamePlayer();
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    if (!answer) {
        alert('Please enter an answer!');
        return;
    }
    
    player.money -= bet;
    updateMinigameDisplay();
    
    const resultDiv = document.getElementById('math-result');
    let win = 0;
    
    if (answer === window.currentMathAnswer) {
        win = bet * 2; // Correct
    }
    
    if (win > 0) {
        player.money += win;
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold;">Correct! Answer was ${window.currentMathAnswer}. WIN! +${win} money!</div>`;
        addLog(`🔢 Quick Math: Won ${win} money!`);
    } else {
        resultDiv.innerHTML = `<div style="color: #ff0000; font-weight: bold;">Wrong! Answer was ${window.currentMathAnswer}. You said ${answer}. Lost ${bet} money</div>`;
        addLog(`🔢 Quick Math: Lost ${bet} money`);
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
    const saved = localStorage.getItem('mazeGameSkin');
    if (saved && MAZE_SKINS[saved]) {
        mazeGameSkin = saved;
    }
    // Load owned skins
    const savedOwned = localStorage.getItem('mazeSkins');
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
    localStorage.setItem('mazeGameSkin', mazeGameSkin);
    const owned = {};
    Object.keys(MAZE_SKINS).forEach(key => {
        if (MAZE_SKINS[key].owned) {
            owned[key] = true;
        }
    });
    localStorage.setItem('mazeSkins', JSON.stringify(owned));
}

function showMazeSkinsShop() {
    loadMazeSkin();
    if (typeof loadFlappyPoints === 'function') {
        loadFlappyPoints();
    }
    
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
    
    const flappyPoints = (typeof flappyGame !== 'undefined' && flappyGame.flappyPoints) ? flappyGame.flappyPoints : 0;
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
            🎮 Flappy Points: ${flappyPoints}
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
        
        const canBuy = flappyPoints >= skin.cost;
        
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
                    Cost: 🎮 ${skin.cost} Flappy Points
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
                 ">${canBuy ? 'BUY' : 'NEED ' + skin.cost + ' POINTS'}</button>
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
    
    if (typeof loadFlappyPoints === 'function') {
        loadFlappyPoints();
    }
    const flappyPoints = (typeof flappyGame !== 'undefined' && flappyGame.flappyPoints) ? flappyGame.flappyPoints : 0;
    
    if (flappyPoints < skin.cost) {
        alert(`You need ${skin.cost} flappy points to buy this skin!`);
        return;
    }
    
    if (typeof flappyGame !== 'undefined') {
        flappyGame.flappyPoints -= skin.cost;
        if (typeof saveFlappyPoints === 'function') {
            saveFlappyPoints();
        }
    }
    skin.owned = true;
    saveMazeSkin();
    
    if (typeof addLog === 'function') {
        addLog(`🎨 Purchased ${skin.name} for ${skin.cost} flappy points!`);
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
                Money Collected: <span id="maze-money-count">0</span>
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
    exit: null
};

function startMazeGame() {
    const canvas = document.getElementById('maze-canvas');
    if (!canvas) return;
    
    mazeGame.canvas = canvas;
    mazeGame.ctx = canvas.getContext('2d');
    mazeGame.gameStarted = true;
    mazeGame.gameOver = false;
    mazeGame.level = 1;
    mazeGame.score = 0;
    mazeGame.totalMoney = 0;
    mazeGame.collectedKeys = { red: 0, blue: 0, green: 0, yellow: 0 };
    mazeGame.keys = {};
    
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
            if (cell.walls.top) {
                mazeGame.walls.push({ x: x * cellSize, y: y * cellSize, width: cellSize, height: 2 });
            }
            if (cell.walls.left) {
                mazeGame.walls.push({ x: x * cellSize, y: y * cellSize, width: 2, height: cellSize });
            }
            if (cell.walls.bottom) {
                mazeGame.walls.push({ x: x * cellSize, y: (y + 1) * cellSize - 2, width: cellSize, height: 2 });
            }
            if (cell.walls.right) {
                mazeGame.walls.push({ x: (x + 1) * cellSize - 2, y: y * cellSize, width: 2, height: cellSize });
            }
        }
    }
    
    // Add outer walls
    mazeGame.walls.push({ x: 0, y: 0, width: canvas.width, height: 2 });
    mazeGame.walls.push({ x: 0, y: 0, width: 2, height: canvas.height });
    mazeGame.walls.push({ x: canvas.width - 2, y: 0, width: 2, height: canvas.height });
    mazeGame.walls.push({ x: 0, y: canvas.height - 2, width: canvas.width, height: 2 });
    
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
            const bonus = mazeGame.level * 50;
            const player = getMinigamePlayer();
            if (player) {
                player.money += bonus;
                mazeGame.totalMoney += bonus;
            }
            
            if (typeof addLog === 'function') {
                addLog(`🧩 Level ${mazeGame.level - 1} Complete! Bonus: +${bonus} money!`);
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
        requestAnimationFrame(mazeGameLoop);
    }
}

// Minigames menu
// Minigame 12: Snake Game
function initSnakeGame() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-snake">
            <h2>🐍 Snake Game</h2>
            <p>Use Arrow Keys or WASD to control the snake! Eat food to grow. Each food = 5 money. Collision = Game Over!</p>
            <div id="snake-canvas-container" style="text-align: center; margin: 20px 0;">
                <canvas id="snake-canvas" style="border: 3px solid #FF0000; background: #000; cursor: pointer;"></canvas>
            </div>
            <div id="snake-info" style="color: #FFD700; font-weight: bold; font-size: 1.1em; margin: 10px 0;">
                Score: <span id="snake-score">0</span> | Money: <span id="snake-money">0</span>
            </div>
            <button class="btn btn-large" onclick="startSnakeGame()">Start Game</button>
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
    money: 0,
    gameStarted: false,
    gameOver: false,
    gridSize: 10
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
    snakeGame.money = 0;
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
        snakeGame.money += 5;
        const player = getMinigamePlayer();
        if (player) player.money += 5;
        updateMinigameDisplay();
        generateSnakeFood();
        updateSnakeDisplay();
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
        ctx.fillText(`Money: ${snakeGame.money}`, snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 + 40);
    }
}

function updateSnakeDisplay() {
    const scoreEl = document.getElementById('snake-score');
    const moneyEl = document.getElementById('snake-money');
    if (scoreEl) scoreEl.textContent = snakeGame.score;
    if (moneyEl) moneyEl.textContent = snakeGame.money;
}

function endSnakeGame() {
    const resultDiv = document.getElementById('snake-result');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold; font-size: 1.5em;">Game Over! Earned ${snakeGame.money} money!</div>`;
    }
    if (typeof addLog === 'function') {
        addLog(`🐍 Snake Game: Score ${snakeGame.score}, Earned ${snakeGame.money} money!`);
    }
}

function snakeGameLoop() {
    if (!snakeGame.gameStarted) return;
    updateSnakeGame();
    drawSnakeGame();
    updateSnakeDisplay();
    if (!snakeGame.gameOver) {
        setTimeout(() => snakeGameLoop(), 150);
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
    money: 0,
    lives: 3,
    gameStarted: false,
    gameOver: false,
    keys: {}
};

function startBreakoutGame() {
    const canvas = document.getElementById('breakout-canvas');
    if (!canvas) return;
    breakoutGame.canvas = canvas;
    breakoutGame.ctx = canvas.getContext('2d');
    breakoutGame.gameStarted = true;
    breakoutGame.gameOver = false;
    breakoutGame.score = 0;
    breakoutGame.money = 0;
    breakoutGame.lives = 3;
    breakoutGame.paddle = { x: 250, y: 380, width: 100, height: 10 };
    breakoutGame.ball = { x: 300, y: 360, radius: 8, dx: 3, dy: -3 };
    breakoutGame.blocks = [];
    
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
            breakoutGame.money += 10;
            const player = getMinigamePlayer();
            if (player) player.money += 10;
            updateMinigameDisplay();
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
        const bonus = 100;
        breakoutGame.money += bonus;
        const player = getMinigamePlayer();
        if (player) player.money += bonus;
        updateMinigameDisplay();
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
    const moneyEl = document.getElementById('breakout-money');
    const livesEl = document.getElementById('breakout-lives');
    if (scoreEl) scoreEl.textContent = breakoutGame.score;
    if (moneyEl) moneyEl.textContent = breakoutGame.money;
    if (livesEl) livesEl.textContent = breakoutGame.lives;
}

function endBreakoutGame() {
    const resultDiv = document.getElementById('breakout-result');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold; font-size: 1.5em;">Game Over! Earned ${breakoutGame.money} money!</div>`;
    }
    if (typeof addLog === 'function') {
        addLog(`🎾 Breakout: Score ${breakoutGame.score}, Earned ${breakoutGame.money} money!`);
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
            <p>Arrow Keys: Left/Right to move, Down to drop, Up to rotate. Clear lines for money! Each line = 50 money!</p>
            <div id="tetris-canvas-container" style="text-align: center; margin: 20px 0;">
                <canvas id="tetris-canvas" style="border: 3px solid #FF0000; background: #000; cursor: pointer;"></canvas>
            </div>
            <div id="tetris-info" style="color: #FFD700; font-weight: bold; font-size: 1.1em; margin: 10px 0;">
                Score: <span id="tetris-score">0</span> | Money: <span id="tetris-money">0</span> | Lines: <span id="tetris-lines">0</span>
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
    money: 0,
    lines: 0,
    gameStarted: false,
    gameOver: false,
    dropTime: 0,
    lastTime: 0,
    gridWidth: 10,
    gridHeight: 20,
    blockSize: 30
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
    tetrisGame.canvas = canvas;
    tetrisGame.ctx = canvas.getContext('2d');
    tetrisGame.gameStarted = true;
    tetrisGame.gameOver = false;
    tetrisGame.score = 0;
    tetrisGame.money = 0;
    tetrisGame.lines = 0;
    
    // Initialize grid
    tetrisGame.grid = Array(tetrisGame.gridHeight).fill().map(() => Array(tetrisGame.gridWidth).fill(0));
    
    spawnTetrisPiece();
    document.addEventListener('keydown', handleTetrisKeyDown);
    tetrisGame.lastTime = performance.now();
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
        const moneyEarned = linesCleared * 50;
        tetrisGame.money += moneyEarned;
        const player = getMinigamePlayer();
        if (player) player.money += moneyEarned;
        updateMinigameDisplay();
        updateTetrisDisplay();
    }
}

function updateTetrisGame(time) {
    if (!tetrisGame.gameStarted || tetrisGame.gameOver) return;
    
    const deltaTime = time - tetrisGame.lastTime;
    tetrisGame.dropTime += deltaTime;
    
    if (tetrisGame.dropTime > 1000) {
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
        ctx.fillText(`Money: ${tetrisGame.money}`, tetrisGame.canvas.width / 2, tetrisGame.canvas.height / 2 + 40);
    }
}

function updateTetrisDisplay() {
    const scoreEl = document.getElementById('tetris-score');
    const moneyEl = document.getElementById('tetris-money');
    const linesEl = document.getElementById('tetris-lines');
    if (scoreEl) scoreEl.textContent = tetrisGame.score;
    if (moneyEl) moneyEl.textContent = tetrisGame.money;
    if (linesEl) linesEl.textContent = tetrisGame.lines;
}

function endTetrisGame() {
    const resultDiv = document.getElementById('tetris-result');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold; font-size: 1.5em;">Game Over! Earned ${tetrisGame.money} money!</div>`;
    }
    if (typeof addLog === 'function') {
        addLog(`🧩 Tetris: Score ${tetrisGame.score}, Lines ${tetrisGame.lines}, Earned ${tetrisGame.money} money!`);
    }
}

function tetrisGameLoop(time) {
    if (!tetrisGame.gameStarted) return;
    updateTetrisGame(time);
    drawTetrisGame();
    updateTetrisDisplay();
    if (!tetrisGame.gameOver) {
        requestAnimationFrame(tetrisGameLoop);
    }
}

// Minigame 15: Pong
function initPongGame() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-pong">
            <h2>🏓 Pong</h2>
            <p>Use W/S or Arrow Up/Down to move paddle! Score points for money. Each point = 20 money!</p>
            <div id="pong-canvas-container" style="text-align: center; margin: 20px 0;">
                <canvas id="pong-canvas" style="border: 3px solid #FF0000; background: #000; cursor: pointer;"></canvas>
            </div>
            <div id="pong-info" style="color: #FFD700; font-weight: bold; font-size: 1.1em; margin: 10px 0;">
                Player: <span id="pong-player-score">0</span> | AI: <span id="pong-ai-score">0</span> | Money: <span id="pong-money">0</span>
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
    money: 0,
    gameStarted: false,
    gameOver: false,
    keys: {}
};

function startPongGame() {
    const canvas = document.getElementById('pong-canvas');
    if (!canvas) return;
    pongGame.canvas = canvas;
    pongGame.ctx = canvas.getContext('2d');
    pongGame.gameStarted = true;
    pongGame.gameOver = false;
    pongGame.playerScore = 0;
    pongGame.aiScore = 0;
    pongGame.money = 0;
    pongGame.playerPaddle = { x: 20, y: 150, width: 10, height: 100, speed: 5 };
    pongGame.aiPaddle = { x: 770, y: 150, width: 10, height: 100, speed: 3 };
    pongGame.ball = { x: 400, y: 200, radius: 10, dx: 4, dy: 4 };
    pongGame.keys = {};
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
        pongGame.ball.dx *= 1.1; // Speed up
    }
    
    if (pongGame.ball.x + pongGame.ball.radius >= pongGame.aiPaddle.x &&
        pongGame.ball.y >= pongGame.aiPaddle.y &&
        pongGame.ball.y <= pongGame.aiPaddle.y + pongGame.aiPaddle.height &&
        pongGame.ball.dx > 0) {
        pongGame.ball.dx = -pongGame.ball.dx;
        pongGame.ball.dx *= 1.1;
    }
    
    // Score
    if (pongGame.ball.x < 0) {
        pongGame.aiScore++;
        resetPongBall();
    } else if (pongGame.ball.x > pongGame.canvas.width) {
        pongGame.playerScore++;
        pongGame.money += 20;
        const player = getMinigamePlayer();
        if (player) player.money += 20;
        updateMinigameDisplay();
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
        ctx.fillText(`Money Earned: ${pongGame.money}`, pongGame.canvas.width / 2, pongGame.canvas.height / 2 + 50);
    }
}

function updatePongDisplay() {
    const playerScoreEl = document.getElementById('pong-player-score');
    const aiScoreEl = document.getElementById('pong-ai-score');
    const moneyEl = document.getElementById('pong-money');
    if (playerScoreEl) playerScoreEl.textContent = pongGame.playerScore;
    if (aiScoreEl) aiScoreEl.textContent = pongGame.aiScore;
    if (moneyEl) moneyEl.textContent = pongGame.money;
}

function endPongGame() {
    const resultDiv = document.getElementById('pong-result');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="color: ${pongGame.playerScore >= 10 ? '#00ff00' : '#ff0000'}; font-weight: bold; font-size: 1.5em;">${pongGame.playerScore >= 10 ? 'You Win!' : 'AI Wins!'} Earned ${pongGame.money} money!</div>`;
    }
    if (typeof addLog === 'function') {
        addLog(`🏓 Pong: Final Score ${pongGame.playerScore}-${pongGame.aiScore}, Earned ${pongGame.money} money!`);
    }
}

function pongGameLoop() {
    if (!pongGame.gameStarted) return;
    updatePongGame();
    drawPongGame();
    if (!pongGame.gameOver) {
        requestAnimationFrame(pongGameLoop);
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
                Score: <span id="pacman-score">0</span> | Money: <span id="pacman-money">0</span> | Lives: <span id="pacman-lives">3</span>
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
    ghosts: [],
    score: 0,
    money: 0,
    lives: 3,
    gameStarted: false,
    gameOver: false,
    keys: {},
    gridSize: 20
};

function startPacManGame() {
    const canvas = document.getElementById('pacman-canvas');
    if (!canvas) return;
    pacManGame.canvas = canvas;
    pacManGame.ctx = canvas.getContext('2d');
    pacManGame.gameStarted = true;
    pacManGame.gameOver = false;
    pacManGame.score = 0;
    pacManGame.money = 0;
    pacManGame.lives = 3;
    pacManGame.player = { x: 50, y: 50, size: 20, direction: 'right', nextDirection: 'right' };
    pacManGame.dots = [];
    pacManGame.ghosts = [];
    
    // Generate dots
    for (let y = 30; y < canvas.height - 30; y += 30) {
        for (let x = 30; x < canvas.width - 30; x += 30) {
            if (Math.random() > 0.3) { // 70% chance of dot
                pacManGame.dots.push({ x, y, collected: false });
            }
        }
    }
    
    // Generate ghosts
    for (let i = 0; i < 3; i++) {
        pacManGame.ghosts.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: Math.random() * (canvas.height - 40) + 20,
            size: 20,
            dx: (Math.random() > 0.5 ? 1 : -1) * 2,
            dy: (Math.random() > 0.5 ? 1 : -1) * 2,
            color: ['#FF0000', '#00FFFF', '#FFFF00'][i]
        });
    }
    
    document.addEventListener('keydown', handlePacManKeyDown);
    pacManGameLoop();
}

function handlePacManKeyDown(e) {
    if (!pacManGame.gameStarted || pacManGame.gameOver) return;
    const key = e.key;
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
        pacManGame.player.nextDirection = 'up';
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
        pacManGame.player.nextDirection = 'down';
    } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
        pacManGame.player.nextDirection = 'left';
    } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
        pacManGame.player.nextDirection = 'right';
    }
    e.preventDefault();
}

function updatePacManGame() {
    if (!pacManGame.gameStarted || pacManGame.gameOver) return;
    
    const speed = 3;
    pacManGame.player.direction = pacManGame.player.nextDirection;
    
    // Move player
    if (pacManGame.player.direction === 'up') {
        pacManGame.player.y = Math.max(0, pacManGame.player.y - speed);
    } else if (pacManGame.player.direction === 'down') {
        pacManGame.player.y = Math.min(pacManGame.canvas.height - pacManGame.player.size, pacManGame.player.y + speed);
    } else if (pacManGame.player.direction === 'left') {
        pacManGame.player.x = Math.max(0, pacManGame.player.x - speed);
    } else if (pacManGame.player.direction === 'right') {
        pacManGame.player.x = Math.min(pacManGame.canvas.width - pacManGame.player.size, pacManGame.player.x + speed);
    }
    
    // Collect dots
    pacManGame.dots.forEach(dot => {
        if (!dot.collected) {
            const dx = dot.x - (pacManGame.player.x + pacManGame.player.size / 2);
            const dy = dot.y - (pacManGame.player.y + pacManGame.player.size / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
                dot.collected = true;
                pacManGame.score += 10;
                pacManGame.money += 2;
                const player = getMinigamePlayer();
                if (player) player.money += 2;
                updateMinigameDisplay();
                updatePacManDisplay();
            }
        }
    });
    
    // Move ghosts
    pacManGame.ghosts.forEach(ghost => {
        ghost.x += ghost.dx;
        ghost.y += ghost.dy;
        
        // Bounce off walls
        if (ghost.x <= 0 || ghost.x >= pacManGame.canvas.width - ghost.size) {
            ghost.dx = -ghost.dx;
        }
        if (ghost.y <= 0 || ghost.y >= pacManGame.canvas.height - ghost.size) {
            ghost.dy = -ghost.dy;
        }
        
        // Check collision with player
        const dx = ghost.x - pacManGame.player.x;
        const dy = ghost.y - pacManGame.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < (ghost.size + pacManGame.player.size) / 2) {
            pacManGame.lives--;
            if (pacManGame.lives <= 0) {
                pacManGame.gameOver = true;
                endPacManGame();
            } else {
                // Reset position
                pacManGame.player.x = 50;
                pacManGame.player.y = 50;
            }
        }
    });
    
    // Win condition
    if (pacManGame.dots.every(d => d.collected)) {
        pacManGame.gameOver = true;
        const bonus = 100;
        pacManGame.money += bonus;
        const player = getMinigamePlayer();
        if (player) player.money += bonus;
        updateMinigameDisplay();
        endPacManGame();
    }
}

function drawPacManGame() {
    if (!pacManGame.ctx) return;
    const ctx = pacManGame.ctx;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, pacManGame.canvas.width, pacManGame.canvas.height);
    
    // Draw dots
    ctx.fillStyle = '#FFD700';
    pacManGame.dots.forEach(dot => {
        if (!dot.collected) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
            ctx.fill();
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
        ctx.fillText(`Money: ${pacManGame.money}`, pacManGame.canvas.width / 2, pacManGame.canvas.height / 2 + 40);
    }
}

function updatePacManDisplay() {
    const scoreEl = document.getElementById('pacman-score');
    const moneyEl = document.getElementById('pacman-money');
    const livesEl = document.getElementById('pacman-lives');
    if (scoreEl) scoreEl.textContent = pacManGame.score;
    if (moneyEl) moneyEl.textContent = pacManGame.money;
    if (livesEl) livesEl.textContent = pacManGame.lives;
}

function endPacManGame() {
    const resultDiv = document.getElementById('pacman-result');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold; font-size: 1.5em;">Game Over! Earned ${pacManGame.money} money!</div>`;
    }
    if (typeof addLog === 'function') {
        addLog(`👻 Pac-Man: Score ${pacManGame.score}, Earned ${pacManGame.money} money!`);
    }
}

function pacManGameLoop() {
    if (!pacManGame.gameStarted) return;
    updatePacManGame();
    drawPacManGame();
    updatePacManDisplay();
    if (!pacManGame.gameOver) {
        requestAnimationFrame(pacManGameLoop);
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
    money: 0,
    lives: 3,
    gameStarted: false,
    gameOver: false,
    keys: {},
    lastShot: 0
};

function startSpaceInvadersGame() {
    const canvas = document.getElementById('space-invaders-canvas');
    if (!canvas) return;
    spaceInvadersGame.canvas = canvas;
    spaceInvadersGame.ctx = canvas.getContext('2d');
    spaceInvadersGame.gameStarted = true;
    spaceInvadersGame.gameOver = false;
    spaceInvadersGame.score = 0;
    spaceInvadersGame.money = 0;
    spaceInvadersGame.lives = 3;
    spaceInvadersGame.player = { x: 300, y: 450, width: 50, height: 20, speed: 5 };
    spaceInvadersGame.bullets = [];
    spaceInvadersGame.alienBullets = [];
    spaceInvadersGame.aliens = [];
    
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
                    spaceInvadersGame.money += 15;
                    const player = getMinigamePlayer();
                    if (player) player.money += 15;
                    updateMinigameDisplay();
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
        const bonus = 200;
        spaceInvadersGame.money += bonus;
        const player = getMinigamePlayer();
        if (player) player.money += bonus;
        updateMinigameDisplay();
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
        ctx.fillText(`Money: ${spaceInvadersGame.money}`, spaceInvadersGame.canvas.width / 2, spaceInvadersGame.canvas.height / 2 + 40);
    }
}

function updateSpaceInvadersDisplay() {
    const scoreEl = document.getElementById('space-invaders-score');
    const moneyEl = document.getElementById('space-invaders-money');
    const livesEl = document.getElementById('space-invaders-lives');
    if (scoreEl) scoreEl.textContent = spaceInvadersGame.score;
    if (moneyEl) moneyEl.textContent = spaceInvadersGame.money;
    if (livesEl) livesEl.textContent = spaceInvadersGame.lives;
}

function endSpaceInvadersGame() {
    const resultDiv = document.getElementById('space-invaders-result');
    if (resultDiv) {
        resultDiv.innerHTML = `<div style="color: #00ff00; font-weight: bold; font-size: 1.5em;">Game Over! Earned ${spaceInvadersGame.money} money!</div>`;
    }
    if (typeof addLog === 'function') {
        addLog(`👾 Space Invaders: Score ${spaceInvadersGame.score}, Earned ${spaceInvadersGame.money} money!`);
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
    container.innerHTML = `
        <div class="minigames-menu">
            <h2>🎮 Minigames</h2>
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
}

