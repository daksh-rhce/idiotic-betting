// Minigames System
let minigamesState = {
    currentGame: null,
    playerMoney: 0
};

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
    const player = gameState.players[gameState.playerId];
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
    updateDisplay();
    
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
            updateDisplay();
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
    updateDisplay();
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
    const player = gameState.players[gameState.playerId];
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
    updateDisplay();
    
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
    updateDisplay();
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
    const player = gameState.players[gameState.playerId];
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
    updateDisplay();
    
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
    updateDisplay();
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
    const player = gameState.players[gameState.playerId];
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
    updateDisplay();
    
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
    updateDisplay();
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
    const player = gameState.players[gameState.playerId];
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
    updateDisplay();
    
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
    updateDisplay();
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
                const player = gameState.players[gameState.playerId];
                const win = bet * 3;
                player.money += win;
                document.getElementById('memory-result').innerHTML = `<div style="color: #00ff00; font-weight: bold;">You won! +${win} money!</div>`;
                addLog(`🧠 Memory Game: Won ${win} money!`);
                updateDisplay();
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
    const player = gameState.players[gameState.playerId];
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
    updateDisplay();
    
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
    updateDisplay();
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
    const player = gameState.players[gameState.playerId];
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    player.money -= bet;
    updateDisplay();
    
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
    updateDisplay();
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
    const player = gameState.players[gameState.playerId];
    
    if (!player || player.money < bet) {
        alert('Not enough money!');
        return;
    }
    
    if (!answer) {
        alert('Please enter an answer!');
        return;
    }
    
    player.money -= bet;
    updateDisplay();
    
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
    updateDisplay();
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
    { name: 'Quick Math', icon: '🔢', init: initQuickMath }
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

