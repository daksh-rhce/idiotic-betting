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

// Minigame 11: Maze Game
function initMazeGame() {
    const container = document.getElementById('minigame-container');
    container.innerHTML = `
        <div class="minigame-maze">
            <h2>🧩 Maze Game</h2>
            <p>Use arrow keys to collect money bags! Each bag = 1 money</p>
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
    
    // Place player at start
    mazeGame.player = { x: cellSize + 10, y: cellSize + 10, size: 20, color: '#FF0000' };
    
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
    
    // Draw player (cat-like)
    ctx.fillStyle = mazeGame.player.color;
    ctx.beginPath();
    ctx.arc(mazeGame.player.x + mazeGame.player.size/2, mazeGame.player.y + mazeGame.player.size/2, mazeGame.player.size/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Cat eyes
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(mazeGame.player.x + mazeGame.player.size/2 - 4, mazeGame.player.y + mazeGame.player.size/2 - 2, 2, 0, Math.PI * 2);
    ctx.arc(mazeGame.player.x + mazeGame.player.size/2 + 4, mazeGame.player.y + mazeGame.player.size/2 - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    
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
    { name: 'Maze Game', icon: '🧩', init: initMazeGame }
];

function showMinigamesMenu() {
    const container = document.getElementById('minigame-container');
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
    window.showMinigamesMenu = showMinigamesMenu;
    window.selectMinigame = selectMinigame;
}

