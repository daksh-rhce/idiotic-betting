// Game State
let gameState = {
    players: [],
    currentPlayerIndex: 0,
    propertyDeck: [],
    taskDeck: [],
    chaosDeck: [],
    currentPhase: 'setup',
    round: 0,
    currentAuction: null,
    currentBid: 50,
    highestBidder: null,
    biddingOrder: [],
    currentBidderIndex: 0,
    biddingHistory: [],
    gameEnded: false,
    playerId: 0,
    selectedTasks: [],
    chaosCardPlayedThisTurn: false,
    gameMode: 'solo',
    wheelSpun: false
};

// Import card data (same as before)
const PROPERTY_CARDS = [
    { name: "Crumpets & Tea Lane", value: 100, tier: "low", effect: "Every turn, you must politely insult another player in a fake posh accent." },
    { name: "Peeping Tom Bath Estate", value: 120, tier: "low", effect: "Whenever you look at the board, you must maintain eye contact with one player for 5 seconds." },
    { name: "Questionable Lemonade Stand", value: 110, tier: "low", effect: "Every time you gain money, you must explain where it came from like you're lying." },
    { name: "Suspicious Storage Unit", value: 130, tier: "low", effect: "Speak only in whispers during your turn." },
    { name: "Garage Full of \"Totally Not Stolen\" Bikes", value: 140, tier: "low", effect: "If you win an auction, you must celebrate like you just committed a crime." },
    { name: "Unlicensed Tarot Reader Booth", value: 125, tier: "low", effect: "Compliment someone in a way that sounds almost inappropriate." },
    { name: "Basement Arcade With Sticky Floors", value: 115, tier: "low", effect: "End every sentence with \"…meow.\"" },
    { name: "Rubber Chicken Factory", value: 200, tier: "mid", effect: "You must squeeze an imaginary chicken before playing a Chaos card." },
    { name: "Donut Shop With Bad Coffee", value: 220, tier: "mid", effect: "Introduce yourself again every turn with a new fake personality." },
    { name: "Used Car Lot of Broken Dreams", value: 210, tier: "mid", effect: "Every time you sell anything, you must apologize to it." },
    { name: "Antique Spoon Museum", value: 230, tier: "mid", effect: "You must pretend to carefully handle an invisible spoon whenever you speak." },
    { name: "Luxury Dog Spa (No Dogs Allowed)", value: 240, tier: "mid", effect: "If targeted by a Chaos card, bark once before it resolves." },
    { name: "Pop-Up Escape Room That Never Opens", value: 250, tier: "mid", effect: "At the start of your turn, attempt to escape your chair dramatically." },
    { name: "Mystery Meat Food Truck", value: 235, tier: "mid", effect: "Give terrible relationship advice confidently." },
    { name: "Fast-Food Franchise With a Lawsuit", value: 350, tier: "high", effect: "Every time you gain money, dance for 3 seconds." },
    { name: "Gated Community of Karenhood", value: 380, tier: "high", effect: "React whenever a specific player does anything." },
    { name: "Offshore \"Consulting\" Firm", value: 400, tier: "high", effect: "You must refuse to explain your actions and say \"It's complicated.\"" },
    { name: "Luxury Condo Built on a Sinkhole", value: 420, tier: "high", effect: "If someone steals from you, dramatically fall over." },
    { name: "Black-Market Storage Dock", value: 450, tier: "high", effect: "Whenever you play a Chaos card, look around nervously first." },
    { name: "Influencer Content House", value: 430, tier: "high", effect: "Every turn, pretend you're livestreaming and ask for likes." },
    { name: "Haunted Mattress Warehouse", value: 500, tier: "chaos", effect: "Occasionally moan loudly for no reason." },
    { name: "Cryogenic Pet Freezer", value: 480, tier: "chaos", effect: "Speak very slowly until your next turn." },
    { name: "Unethical Clown College", value: 470, tier: "chaos", effect: "Laugh at your own jokes, even bad ones." },
    { name: "\"Temporary\" Roadwork Zone (10 Years)", value: 460, tier: "chaos", effect: "Interrupt someone once per round with \"Almost done.\"" },
    { name: "Illegal Fireworks Bunker", value: 490, tier: "chaos", effect: "Make explosion noises whenever someone bids." },
    { name: "Abandoned Mall Santa Throne", value: 510, tier: "chaos", effect: "Call everyone \"buddy\" or \"champ.\"" },
    { name: "Wellness Cult Retreat", value: 520, tier: "chaos", effect: "Offer unsolicited life advice." },
    { name: "Gold-Plated Public Toilet", value: 530, tier: "chaos", effect: "Pretend something embarrassing just popped up." },
    { name: "DIY Plastic Surgery Clinic", value: 540, tier: "chaos", effect: "Compliment then insult the same person in one sentence." },
    { name: "Psychic Hotline Server Farm", value: 550, tier: "chaos", effect: "Claim you knew every outcome already." },
    { name: "Luxury Bunker Airbnb", value: 560, tier: "chaos", effect: "Act paranoid whenever Chaos cards appear." },
    { name: "Expired Theme Park Zone", value: 570, tier: "chaos", effect: "Pretend everything is \"still under construction.\"" },
    { name: "Celebrity Cry Room", value: 580, tier: "chaos", effect: "Fake cry when someone else wins something." },
    { name: "Extreme Couponer HQ", value: 590, tier: "chaos", effect: "Fake confess to one of the people." },
    { name: "Underground Reality TV Studio", value: 600, tier: "chaos", effect: "Narrate drama like a TV voiceover." }
];

const CHAOS_CARDS = [
    { name: "Petty Crime, Big Smile", type: "steal", description: "Steal 100 OR a random Chaos card.", needsTarget: true },
    { name: "Inside Job", type: "steal", description: "Steal a property from a player with 4+ properties.", needsTarget: true },
    { name: "Asset Freeze", type: "sabotage", description: "Choose a property. It does nothing for 1 round.", needsTarget: false },
    { name: "Wrong Pocket", type: "defense", description: "Redirect a steal to a different player. (out of turn)", needsTarget: true },
    { name: "Fake Bidder", type: "auction", description: "Raise the current bid by 200. You don't pay.", needsTarget: false },
    { name: "Bid Sniper", type: "auction", description: "Instantly become highest bidder at current price. (out of turn)", needsTarget: false },
    { name: "Auction Goes Sideways", type: "auction", description: "Cancel auction. Discard property.", needsTarget: false },
    { name: "Sudden Disinterest", type: "auction", description: "All bids reset to 0.", needsTarget: false },
    { name: "Accounting Error (In Your Favor)", type: "money", description: "Gain 300.", needsTarget: false },
    { name: "Unexpected Fine", type: "money", description: "Target player pays 200 or sells a property.", needsTarget: true },
    { name: "Double or Nothing", type: "money", description: "Flip a coin: double your money OR lose half.", needsTarget: false },
    { name: "We Found a Loophole", type: "money", description: "Ignore all money limits this round.", needsTarget: false },
    { name: "Swap Lists!", type: "task", description: "Swap one Task Card with another player.", needsTarget: true },
    { name: "Lost the Paperwork", type: "task", description: "Un-complete one finished task (back to hand).", needsTarget: true },
    { name: "Fast-Track Approval", type: "task", description: "Instantly complete a task if you own the property.", needsTarget: false },
    { name: "Security Upgrade", type: "defense", description: "You can't be stolen from until your next turn.", needsTarget: false },
    { name: "Worthless Junk", type: "property", description: "A property becomes valueless but still completes tasks.", needsTarget: false },
    { name: "Idiotic Investment", type: "money", description: "Pay 200 now. Gain 500 in two rounds.", needsTarget: false },
    { name: "Rules Are Suggestions", type: "power", description: "Ignore one rule for the rest of this round.", needsTarget: false },
    { name: "This Is Fine", type: "defense", description: "Cancel all Chaos cards played this round.", needsTarget: false }
];

// Initialize Solo Game
function initSoloGame() {
    gameState.gameMode = 'solo';
    gameState.players = [
        { id: 0, name: playerName || 'You', money: 500, properties: [], tasks: [], completedTasks: [], chaosCards: [], hasReceivedCatchUp: false }
    ];
    
    // Add AI players with random casino names
    const usedNames = [playerName || 'You'];
    for (let i = 1; i < 4; i++) {
        const botName = getRandomBotName(usedNames);
        usedNames.push(botName);
        gameState.players.push({
            id: i,
            name: botName,
            money: 500,
            properties: [],
            tasks: [],
            completedTasks: [],
            chaosCards: [],
            hasReceivedCatchUp: false
        });
    }
    
    initializeDecks();
    showTaskSelection();
}

// Initialize Online Game
function initOnlineGame() {
    // Check if deployed (has GitHub repo or production URL)
    const isDeployed = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    if (!isDeployed) {
        alert('Online mode requires the game to be deployed to a server.\n\nPlease deploy to GitHub and a hosting service (Railway, Render, etc.) first.\n\nSee DEPLOY_NOW.md for instructions.');
        showScreen('mode-screen');
        return;
    }
    
    gameState.gameMode = 'online';
    showScreen('lobby-screen');
    loadLobbyScreen();
}

// Initialize Decks
function initializeDecks() {
    gameState.propertyDeck = [...PROPERTY_CARDS];
    shuffleDeck(gameState.propertyDeck);
    
    // Create task deck (2 tasks per property)
    gameState.taskDeck = [];
    PROPERTY_CARDS.forEach(property => {
        const taskFormats = [
            `Secure Control of ${property.name}`,
            `Acquire the Deeds to ${property.name}`,
            `Become the Proud Owner of ${property.name}`,
            `Exploit ${property.name}`,
            `Monetize ${property.name}`
        ];
        gameState.taskDeck.push({
            propertyName: property.name,
            description: taskFormats[Math.floor(Math.random() * taskFormats.length)],
            id: Math.random()
        });
        gameState.taskDeck.push({
            propertyName: property.name,
            description: taskFormats[Math.floor(Math.random() * taskFormats.length)],
            id: Math.random()
        });
    });
    shuffleDeck(gameState.taskDeck);
    
    // Initialize chaos deck
    gameState.chaosDeck = [];
    CHAOS_CARDS.forEach(card => {
        for (let i = 0; i < 2; i++) {
            gameState.chaosDeck.push({ ...card, id: Math.random() });
        }
    });
    shuffleDeck(gameState.chaosDeck);
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Show Task Selection Screen
function showTaskSelection() {
    // Show 10 random task cards for selection
    const availableTasks = [...gameState.taskDeck].slice(0, 10);
    const grid = document.getElementById('task-selection-grid');
    grid.innerHTML = '';
    
    availableTasks.forEach((task, index) => {
        const card = document.createElement('div');
        card.className = 'card task-card';
        if (gameState.selectedTasks.includes(task.id)) {
            card.classList.add('selected');
        }
        card.innerHTML = `
            <div class="card-title">${task.description}</div>
            <div class="card-description">Property: ${task.propertyName}</div>
        `;
        card.onclick = () => toggleTaskSelection(task, index);
        grid.appendChild(card);
    });
    
    showScreen('task-selection-screen');
}

function toggleTaskSelection(task, index) {
    if (gameState.selectedTasks.includes(task.id)) {
        gameState.selectedTasks = gameState.selectedTasks.filter(id => id !== task.id);
    } else {
        if (gameState.selectedTasks.length < 5) {
            gameState.selectedTasks.push(task.id);
        } else {
            alert('You can only select 5 task cards!');
            return;
        }
    }
    
    updateTaskSelectionDisplay();
}

function updateTaskSelectionDisplay() {
    const count = gameState.selectedTasks.length;
    document.getElementById('selected-count').textContent = count;
    document.getElementById('confirm-tasks-btn').disabled = count !== 5;
    
    // Update visual selection
    document.querySelectorAll('#task-selection-grid .card').forEach((card, index) => {
        const task = [...gameState.taskDeck].slice(0, 10)[index];
        if (gameState.selectedTasks.includes(task.id)) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

function confirmTaskSelection() {
    if (gameState.selectedTasks.length !== 5) {
        addLog('Please select exactly 5 task cards!');
        return;
    }
    
    // Assign selected tasks to player
    const player = gameState.players[0];
    player.tasks = gameState.taskDeck.filter(task => gameState.selectedTasks.includes(task.id));
    
    // Remove selected tasks from deck
    gameState.taskDeck = gameState.taskDeck.filter(task => !gameState.selectedTasks.includes(task.id));
    
    // Deal tasks to AI players
    gameState.players.slice(1).forEach(aiPlayer => {
        for (let i = 0; i < 5; i++) {
            if (gameState.taskDeck.length > 0) {
                aiPlayer.tasks.push(gameState.taskDeck.pop());
            }
        }
    });
    
    // Deal 5 chaos cards to each player
    gameState.players.forEach(player => {
        for (let i = 0; i < 5; i++) {
            if (gameState.chaosDeck.length > 0) {
                player.chaosCards.push(gameState.chaosDeck.pop());
            }
        }
    });
    
    // Start first auction
    gameState.round = 1;
    gameState.currentPlayerIndex = Math.floor(Math.random() * gameState.players.length);
    gameState.wheelSpun = false; // Reset wheel for new game
    showScreen('game-screen');
    startAuction();
}

function startAuction() {
    if (gameState.propertyDeck.length === 0) {
        endGame();
        return;
    }
    
    gameState.currentAuction = gameState.propertyDeck.pop();
    gameState.currentBid = 50;
    gameState.highestBidder = null;
    gameState.biddingHistory = []; // Clear ALL bidding history for new auction
    gameState.chaosCardPlayedThisTurn = false;
    
    // Set up bidding order (all players - everyone can bid on new property)
    gameState.biddingOrder = [...gameState.players];
    shuffleDeck(gameState.biddingOrder); // Randomize order
    gameState.currentBidderIndex = 0;
    
    gameState.currentPhase = 'auction';
    
    // Make sure buttons are enabled for human player
    const player = gameState.players[gameState.playerId];
    if (player && player.money >= 50) {
        // Buttons will be enabled when it's player's turn
    }
    
    updateDisplay();
    addLog(`🏷️ New Property: ${gameState.currentAuction.name} (Value: ${gameState.currentAuction.value})`);
    addLog(`⚠️ EFFECT: ${gameState.currentAuction.effect}`);
    showEffectNotification(gameState.currentAuction.name, gameState.currentAuction.effect);
    
    // Start bidding
    processNextBidder();
}

function processNextBidder() {
    // First check: If highest bidder has bid so high no one else can afford, auto-win
    if (gameState.highestBidder !== null) {
        const highestBidder = gameState.players.find(p => p.id === gameState.highestBidder);
        const canAnyoneElseBid = gameState.players.some(p => {
            if (p.id === gameState.highestBidder) return false; // Skip the highest bidder
            // Only check if they can afford - passing doesn't prevent bidding
            return p.money >= gameState.currentBid + 50;
        });
        
        if (!canAnyoneElseBid && highestBidder) {
            addLog(`🎯 ${highestBidder.name} wins! No one else can afford to bid higher.`);
            setTimeout(() => {
                endAuction();
                updateDisplay(); // Make sure property shows up immediately
            }, 1000);
            return;
        }
    }
    
    if (gameState.currentBidderIndex >= gameState.biddingOrder.length) {
        // All players have had a chance, check if anyone wants to continue
        // Only exclude players who can't afford, not those who passed (they can bid again next round)
        const activeBidders = gameState.biddingOrder.filter((p, idx) => {
            const player = gameState.players.find(pl => pl.id === p.id);
            // Only exclude if they can't afford - passing doesn't exclude them
            return player && player.money >= gameState.currentBid + 50;
        });
        
        if (activeBidders.length === 0) {
            // No one else can bid - highest bidder auto-buys
            if (gameState.highestBidder !== null) {
                const winner = gameState.players.find(p => p.id === gameState.highestBidder);
                addLog(`🎯 ${winner.name} wins! No one else can bid.`);
            }
            setTimeout(() => {
                endAuction();
                updateDisplay(); // Make sure property shows up immediately
            }, 1000);
            return;
        }
        
        // Reset for another round - clear pass history for this round only
        // Remove pass entries from this round so players can bid again
        gameState.biddingHistory = gameState.biddingHistory.filter(h => h.action !== 'pass' || h.reason !== 'player-passed');
        gameState.biddingOrder = activeBidders;
        gameState.currentBidderIndex = 0;
    }
    
    const currentBidder = gameState.biddingOrder[gameState.currentBidderIndex];
    const player = gameState.players.find(p => p.id === currentBidder.id);
    
    if (!player) {
        gameState.currentBidderIndex++;
        setTimeout(() => processNextBidder(), 500);
        return;
    }
    
    if (player.money < gameState.currentBid + 50) {
        gameState.biddingHistory.push({ playerId: player.id, playerName: player.name, action: 'pass', reason: 'insufficient funds' });
        addLog(`${player.name} can't afford to bid (needs ${gameState.currentBid + 50}, has ${player.money})`);
        gameState.currentBidderIndex++;
        setTimeout(() => processNextBidder(), 800);
        return;
    }
    
    if (player.id === gameState.playerId) {
        // Human player's turn - always enable buttons if they can afford
        const canBid = player.money >= gameState.currentBid + 50;
        const bidBtn = document.getElementById('bid-btn');
        const passBtn = document.getElementById('pass-btn');
        if (bidBtn) bidBtn.disabled = !canBid;
        if (passBtn) passBtn.disabled = false; // Can always pass
        if (canBid) {
            addLog(`Your turn to bid! Current bid: ${gameState.currentBid}`);
        } else {
            addLog(`Your turn, but you can't afford to bid (need ${gameState.currentBid + 50}, have ${player.money})`);
        }
    } else {
        // NPC player's turn - always acts
        aiBid(player);
    }
}

// NPC Bot with fixed commands - always bids or plays chaos card to keep game moving
function aiBid(aiPlayer) {
    const minBid = gameState.currentBid + 50;
    const needsProperty = aiPlayer.tasks.some(task => task.propertyName === gameState.currentAuction.name);
    const canAfford = aiPlayer.money >= minBid;
    
    // NPC DECISION: Always try to keep game moving
    // Priority 1: If needs property and can afford, BID
    if (needsProperty && canAfford) {
        const bid = Math.min(minBid, Math.floor(aiPlayer.money * 0.7));
        placeBidForPlayer(aiPlayer.id, bid);
        return;
    }
    
    // Priority 2: If needs property but can't afford, use chaos card to get money
    if (needsProperty && !canAfford && aiPlayer.chaosCards.length > 0) {
        const moneyCard = aiPlayer.chaosCards.find(card => 
            card.name === "Accounting Error (In Your Favor)" || 
            card.name === "We Found a Loophole"
        );
        if (moneyCard) {
            const cardIndex = aiPlayer.chaosCards.indexOf(moneyCard);
            executeChaosCardForAI(aiPlayer, moneyCard, cardIndex, null);
            setTimeout(() => {
                if (aiPlayer.money >= minBid) {
                    const bid = Math.min(minBid, Math.floor(aiPlayer.money * 0.7));
                    placeBidForPlayer(aiPlayer.id, bid);
                } else {
                    passBidForPlayer(aiPlayer.id);
                }
            }, 800);
            return;
        }
    }
    
    // Priority 3: If can afford, 70% chance to bid (keep game moving)
    if (canAfford) {
        if (Math.random() < 0.7) {
            const bid = Math.min(minBid, Math.floor(aiPlayer.money * 0.6));
            placeBidForPlayer(aiPlayer.id, bid);
            return;
        }
    }
    
    // Priority 4: If can't afford and has chaos cards, use one
    if (!canAfford && aiPlayer.chaosCards.length > 0) {
        const usableCard = aiPlayer.chaosCards.find(card => 
            card.name === "Accounting Error (In Your Favor)" || 
            card.name === "We Found a Loophole" ||
            card.name === "Fake Bidder"
        );
        if (usableCard) {
            const cardIndex = aiPlayer.chaosCards.indexOf(usableCard);
            executeChaosCardForAI(aiPlayer, usableCard, cardIndex, null);
            setTimeout(() => {
                if (aiPlayer.money >= minBid && gameState.currentAuction) {
                    const bid = Math.min(minBid, Math.floor(aiPlayer.money * 0.7));
                    placeBidForPlayer(aiPlayer.id, bid);
                } else {
                    passBidForPlayer(aiPlayer.id);
                }
            }, 800);
            return;
        }
    }
    
    // Last resort: Pass
    passBidForPlayer(aiPlayer.id);
}

function placeBid() {
    const modal = document.getElementById('bid-modal');
    const minBid = gameState.currentBid + 50;
    const player = gameState.players[gameState.playerId];
    
    document.getElementById('min-bid-display').textContent = minBid;
    document.getElementById('your-money-display').textContent = player.money;
    document.getElementById('bid-amount-input').value = minBid;
    document.getElementById('bid-amount-input').min = minBid;
    document.getElementById('bid-amount-input').max = player.money;
    
    modal.style.display = 'block';
}

function submitBid() {
    const input = document.getElementById('bid-amount-input');
    const bid = parseInt(input.value);
    const minBid = gameState.currentBid + 50;
    const player = gameState.players[gameState.playerId];
    
    if (isNaN(bid) || bid < minBid || bid > player.money) {
        alert(`Invalid bid! Must be between ${minBid} and ${player.money}`);
        return;
    }
    
    document.getElementById('bid-modal').style.display = 'none';
    placeBidForPlayer(gameState.playerId, bid);
}

function placeBidForPlayer(playerId, bidAmount) {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || bidAmount < gameState.currentBid + 50 || bidAmount > player.money) {
        return;
    }
    
    // Update bid amount (must be at least 50 more)
    const actualBid = Math.max(gameState.currentBid + 50, bidAmount);
    gameState.currentBid = actualBid;
    gameState.highestBidder = playerId;
    gameState.biddingHistory.push({ playerId, playerName: player.name, action: 'bid', amount: actualBid });
    
    addLog(`💰 ${player.name} bids ${actualBid}!`);
    
    // Check if anyone else can afford to bid higher
    const canAnyoneElseBid = gameState.players.some(p => {
        if (p.id === playerId) return false; // Skip the bidder
        // Only check if they can afford - passing doesn't prevent bidding
        return p.money >= actualBid + 50;
    });
    
    // If no one else can bid, auto-win!
    if (!canAnyoneElseBid) {
        addLog(`🎯 ${player.name} bid so high that no one else can afford it!`);
        setTimeout(() => {
            endAuction();
            updateDisplay(); // Make sure property shows up immediately
        }, 1500);
        return;
    }
    
    // If tie, first to bid that amount wins
    gameState.currentBidderIndex++;
    updateDisplay();
    
    setTimeout(() => processNextBidder(), 1200);
}

function passBid() {
    // One-touch pass
    passBidForPlayer(gameState.playerId);
}

function passBidForPlayer(playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    // Use 'pass' instead of 'final-pass' - allows player to bid again in next round of same auction
    gameState.biddingHistory.push({ playerId, playerName: player.name, action: 'pass', reason: 'player-passed' });
    addLog(`${player.name} passes.`);
    
    // Disable buttons temporarily
    if (playerId === gameState.playerId) {
        document.getElementById('bid-btn').disabled = true;
        document.getElementById('pass-btn').disabled = true;
    }
    
    gameState.currentBidderIndex++;
    updateDisplay();
    
    setTimeout(() => processNextBidder(), 1000);
}

function endAuction() {
    if (gameState.highestBidder === null) {
        addLog("No one bid! Property discarded.");
        gameState.propertyDeck.unshift(gameState.currentAuction);
    } else {
        const winner = gameState.players.find(p => p.id === gameState.highestBidder);
        const oldMoney = winner.money;
        winner.money -= gameState.currentBid;
        winner.properties.push(gameState.currentAuction);
        
        addLog(`🏆 ${winner.name} wins ${gameState.currentAuction.name} for ${gameState.currentBid}!`);
        addLog(`💰 ${winner.name} money: ${oldMoney} → ${winner.money}`);
        
        // Show money change animation
        if (winner.id === gameState.playerId) {
            const moneyEl = document.getElementById('player-money');
            const moneyHeaderEl = document.getElementById('player-money-header');
            if (moneyEl && moneyHeaderEl) {
                moneyEl.style.color = '#ff6b6b';
                moneyHeaderEl.style.color = '#ff6b6b';
                setTimeout(() => {
                    moneyEl.style.color = '#FFD700';
                    moneyHeaderEl.style.color = '#FFD700';
                }, 1500);
            }
            showEffectNotification(gameState.currentAuction.name, gameState.currentAuction.effect, "You now own this property!");
        }
        
        // Update display immediately so property shows in owned list
        updateDisplay();
        
        checkTaskCompletion(gameState.highestBidder);
    }
    
    // Move to action phase - start with first player
    gameState.currentPhase = 'action';
    gameState.currentPlayerIndex = 0;
    gameState.chaosCardPlayedThisTurn = false;
    
    // Reset chaos card played flags for all players
    gameState.players.forEach(p => p.chaosCardPlayedThisTurn = false);
    
    addLog("Action Phase: Players take turns playing Chaos cards.");
    
    // Update display one more time to ensure property is visible
    updateDisplay();
    
    const firstPlayer = gameState.players[0];
    if (firstPlayer.id === gameState.playerId) {
        if (firstPlayer.chaosCards.length > 0) {
            document.getElementById('play-chaos-btn').disabled = false;
        }
        addLog("Your turn! You can play one Chaos card.");
    } else {
        processAITurn(firstPlayer);
    }
}

function playChaosCard() {
    // STRICT CHECK: Only allow on player's turn in action phase
    if (gameState.currentPlayerIndex !== gameState.playerId) {
        addLog("⏸️ Wait for your turn!");
        return;
    }
    
    if (gameState.currentPhase !== 'action') {
        addLog("⏸️ You can only play Chaos cards during the Action Phase!");
        return;
    }
    
    if (gameState.chaosCardPlayedThisTurn) {
        addLog("⏸️ You can only play one Chaos card per turn!");
        return;
    }
    
    const player = gameState.players[gameState.playerId];
    if (player.chaosCards.length === 0) {
        addLog("⏸️ You have no Chaos cards!");
        return;
    }
    
    showChaosCardSelection();
}

function showChaosCardSelection() {
    // Check if it's player's turn
    if (gameState.currentPlayerIndex !== gameState.playerId) {
        addLog("⏸️ Wait for your turn!");
        return;
    }
    
    if (gameState.currentPhase !== 'action') {
        addLog("⏸️ You can only play Chaos cards during the Action Phase!");
        return;
    }
    
    if (gameState.chaosCardPlayedThisTurn) {
        addLog("⏸️ You can only play one Chaos card per turn!");
        return;
    }
    
    const modal = document.getElementById('card-modal');
    const modalBody = document.getElementById('modal-body');
    const player = gameState.players[gameState.playerId];
    
    modalBody.innerHTML = '<h3 style="color: #FFD700; margin-bottom: 20px; font-weight: bold;">Select a Chaos Card to Play (Click card to play):</h3><div class="cards-grid">';
    
    player.chaosCards.forEach((card, index) => {
        modalBody.innerHTML += `
            <div class="card chaos-card playable" onclick="selectChaosCard(${index})" style="cursor: pointer; border: 3px solid #FFD700;">
                <div class="card-title" style="font-weight: bold; font-size: 1.1em;">${card.name}</div>
                <div class="card-description" style="font-weight: bold;">${card.description}</div>
                <div style="margin-top: 10px; font-size: 0.9em; color: #FFD700; font-weight: bold;">Type: ${card.type}</div>
                <div style="margin-top: 10px; color: #51cf66; font-weight: bold;">Click to Play</div>
            </div>
        `;
    });
    
    modalBody.innerHTML += '</div>';
    modal.style.display = 'block';
}

function selectChaosCard(index) {
    // STRICT CHECK: Only allow on player's turn
    if (gameState.currentPlayerIndex !== gameState.playerId) {
        addLog("⏸️ Wait for your turn!");
        document.getElementById('card-modal').style.display = 'none';
        return;
    }
    
    if (gameState.currentPhase !== 'action') {
        addLog("⏸️ You can only play Chaos cards during the Action Phase!");
        document.getElementById('card-modal').style.display = 'none';
        return;
    }
    
    if (gameState.chaosCardPlayedThisTurn) {
        addLog("⏸️ You can only play one Chaos card per turn!");
        document.getElementById('card-modal').style.display = 'none';
        return;
    }
    
    const player = gameState.players[gameState.playerId];
    const card = player.chaosCards[index];
    
    if (!card) {
        addLog("Card not found!");
        return;
    }
    
    // Close modal first
    document.getElementById('card-modal').style.display = 'none';
    
    if (card.needsTarget) {
        showPlayerSelection(card, index);
    } else {
        executeChaosCard(card, index, null);
    }
}

function showPlayerSelection(card, cardIndex) {
    const modal = document.getElementById('player-select-modal');
    const optionsDiv = document.getElementById('player-select-options');
    optionsDiv.innerHTML = '';
    
    gameState.players.forEach(target => {
        if (target.id !== gameState.playerId) {
            const option = document.createElement('div');
            option.className = 'player-option';
            option.innerHTML = `${target.name} (💰${target.money} | 🏠${target.properties.length})`;
            option.onclick = () => {
                modal.style.display = 'none';
                executeChaosCard(card, cardIndex, target.id);
            };
            optionsDiv.appendChild(option);
        }
    });
    
    document.getElementById('modal-title').textContent = `Select target for: ${card.name}`;
    modal.style.display = 'block';
}

// Execute chaos card for AI players
function executeChaosCardForAI(aiPlayer, card, cardIndex, targetId) {
    const target = targetId ? gameState.players.find(p => p.id === targetId) : null;
    
    // Check if card still exists (might have been removed)
    if (cardIndex >= aiPlayer.chaosCards.length || aiPlayer.chaosCards[cardIndex] !== card) {
        // Find card by name instead
        const actualIndex = aiPlayer.chaosCards.findIndex(c => c.name === card.name);
        if (actualIndex === -1) {
            addLog(`${aiPlayer.name} tried to play ${card.name} but card not found!`);
            return;
        }
        cardIndex = actualIndex;
    }
    
    // Remove card from AI's hand
    aiPlayer.chaosCards.splice(cardIndex, 1);
    aiPlayer.chaosCardPlayedThisTurn = true;
    gameState.chaosCardPlayedThisTurn = true; // Also set global flag
    
    addLog(`${aiPlayer.name} played: ${card.name}${target ? ` on ${target.name}` : ''}`);
    
    // Execute effect
    executeChaosCardEffect(aiPlayer, card, target);
    updateDisplay();
}

function executeChaosCard(card, cardIndex, targetId) {
    // Only allow on player's turn
    if (gameState.currentPlayerIndex !== gameState.playerId) {
        addLog("Wait for your turn!");
        return;
    }
    
    const player = gameState.players[gameState.playerId];
    
    if (gameState.chaosCardPlayedThisTurn) {
        addLog("You can only play one Chaos card per turn!");
        return;
    }
    
    const target = targetId ? gameState.players.find(p => p.id === targetId) : null;
    
    // Remove card (cards are consumed when played)
    player.chaosCards.splice(cardIndex, 1);
    gameState.chaosCardPlayedThisTurn = true;
    document.getElementById('play-chaos-btn').disabled = true;
    
    addLog(`You played: ${card.name}${target ? ` on ${target.name}` : ''}`);
    
    // Execute effect
    executeChaosCardEffect(player, card, target);
    updateDisplay();
    
    // Advance to next player's turn after playing card
    advanceTurn();
}

function executeChaosCardEffect(player, card, target) {
    // Execute effect - ALL CARDS IMPLEMENTED
    const oldPlayerMoney = player.money;
    const oldTargetMoney = target ? target.money : 0;
    
    switch (card.name) {
        case "Petty Crime, Big Smile":
            if (target) {
                if (target.money >= 100) {
                    target.money -= 100;
                    player.money += 100;
                    addLog(`💰 ${player.name} stole 100 from ${target.name}!`);
                    addLog(`💰 ${player.name} money: ${oldPlayerMoney} → ${player.money}`);
                    addLog(`💰 ${target.name} money: ${oldTargetMoney} → ${target.money}`);
                } else if (target.chaosCards.length > 0) {
                    const stolen = target.chaosCards.splice(Math.floor(Math.random() * target.chaosCards.length), 1)[0];
                    player.chaosCards.push(stolen);
                    addLog(`🃏 ${player.name} stole ${stolen.name} from ${target.name}!`);
                }
            }
            break;
        case "Inside Job":
            if (target && target.properties.length >= 4) {
                const stolen = target.properties.splice(Math.floor(Math.random() * target.properties.length), 1)[0];
                player.properties.push(stolen);
                addLog(`🏠 ${player.name} stole ${stolen.name} from ${target.name}!`);
            }
            break;
        case "Accounting Error (In Your Favor)":
            player.money += 300;
            addLog(`💰 ${player.name} gained 300 money!`);
            addLog(`💰 ${player.name} money: ${oldPlayerMoney} → ${player.money}`);
            break;
        case "Unexpected Fine":
            if (target) {
                if (target.money >= 200) {
                    target.money -= 200;
                    player.money += 200;
                    addLog(`💰 ${target.name} paid 200 to ${player.name}!`);
                    addLog(`💰 ${player.name} money: ${oldPlayerMoney} → ${player.money}`);
                    addLog(`💰 ${target.name} money: ${oldTargetMoney} → ${target.money}`);
                } else if (target.properties.length > 0) {
                    const sold = target.properties.pop();
                    const oldTargetMoney2 = target.money;
                    target.money += Math.floor(sold.value / 2);
                    gameState.propertyDeck.unshift(sold);
                    addLog(`🏠 ${target.name} sold ${sold.name} to pay fine!`);
                    addLog(`💰 ${target.name} money: ${oldTargetMoney2} → ${target.money}`);
                }
            }
            break;
        case "Fake Bidder":
            if (gameState.currentAuction) {
                gameState.currentBid += 200;
                addLog(`🎲 ${player.name} raised bid by 200 (doesn't pay)!`);
            }
            break;
        case "Auction Goes Sideways":
            if (gameState.currentAuction) {
                gameState.propertyDeck.unshift(gameState.currentAuction);
                gameState.currentAuction = null;
                gameState.currentBid = 50;
                gameState.highestBidder = null;
                addLog(`💥 ${player.name} cancelled the auction!`);
            }
            break;
        case "Sudden Disinterest":
            if (gameState.currentAuction) {
                gameState.currentBid = 50;
                gameState.highestBidder = null;
                addLog(`🔄 ${player.name} reset all bids to 50!`);
            }
            break;
        case "Fast-Track Approval":
            const completableTasks = player.tasks.filter(task => 
                player.properties.some(prop => prop.name === task.propertyName)
            );
            if (completableTasks.length > 0) {
                const task = completableTasks[0];
                player.completedTasks.push(task);
                player.tasks = player.tasks.filter(t => t !== task);
                if (gameState.taskDeck.length > 0) {
                    player.tasks.push(gameState.taskDeck.pop());
                }
                addLog(`✅ ${player.name} instantly completed: ${task.description}!`);
                checkTaskCompletion(player.id);
            }
            break;
        case "Double or Nothing":
            if (Math.random() < 0.5) {
                player.money *= 2;
                addLog(`🎲 ${player.name} doubled their money!`);
                addLog(`💰 ${player.name} money: ${oldPlayerMoney} → ${player.money}`);
            } else {
                player.money = Math.floor(player.money / 2);
                addLog(`💸 ${player.name} lost half their money!`);
                addLog(`💰 ${player.name} money: ${oldPlayerMoney} → ${player.money}`);
            }
            break;
        case "We Found a Loophole":
            player.money += 500;
            addLog(`💰 ${player.name} found a loophole! +500 money!`);
            addLog(`💰 ${player.name} money: ${oldPlayerMoney} → ${player.money}`);
            break;
        case "Swap Lists!":
            if (target && target.tasks.length > 0 && player.tasks.length > 0) {
                const playerTask = player.tasks.splice(Math.floor(Math.random() * player.tasks.length), 1)[0];
                const targetTask = target.tasks.splice(Math.floor(Math.random() * target.tasks.length), 1)[0];
                player.tasks.push(targetTask);
                target.tasks.push(playerTask);
                addLog(`🔄 ${player.name} swapped a task with ${target.name}!`);
            }
            break;
        case "Lost the Paperwork":
            if (target && target.completedTasks.length > 0) {
                const task = target.completedTasks.pop();
                target.tasks.push(task);
                addLog(`📄 ${player.name} un-completed ${target.name}'s task!`);
            }
            break;
        case "Asset Freeze":
            // Can target any player (including self) or random if no target
            const freezeTarget = target || gameState.players[Math.floor(Math.random() * gameState.players.length)];
            if (freezeTarget && freezeTarget.properties.length > 0) {
                const frozen = freezeTarget.properties[Math.floor(Math.random() * freezeTarget.properties.length)];
                frozen.frozen = true;
                frozen.frozenUntil = gameState.round + 1;
                addLog(`❄️ ${player.name} froze ${freezeTarget.name}'s ${frozen.name}!`);
            }
            break;
        case "Wrong Pocket":
            // This is defensive, handled when steal happens
            player.protected = true;
            addLog(`🛡️ ${player.name} is protected from steals!`);
            break;
        case "Bid Sniper":
            if (gameState.currentAuction && gameState.currentPhase === 'auction') {
                const currentBid = gameState.currentBid;
                if (player.money >= currentBid) {
                    const oldBidder = gameState.highestBidder;
                    gameState.highestBidder = player.id;
                    addLog(`🎯 ${player.name} sniped the bid at ${currentBid}!`);
                    if (oldBidder) {
                        const oldBidderPlayer = gameState.players.find(p => p.id === oldBidder);
                        if (oldBidderPlayer) {
                            addLog(`💰 ${oldBidderPlayer.name} is no longer the highest bidder!`);
                        }
                    }
                } else {
                    addLog(`❌ ${player.name} can't afford to snipe (needs ${currentBid}, has ${player.money})`);
                }
            } else {
                addLog(`❌ ${player.name} can only use Bid Sniper during an auction!`);
            }
            break;
        case "Security Upgrade":
            player.protected = true;
            addLog(`🛡️ ${player.name} is protected from steals!`);
            break;
        case "Worthless Junk":
            // Can target any player (including self) or random if no target
            const junkTarget = target || gameState.players[Math.floor(Math.random() * gameState.players.length)];
            if (junkTarget && junkTarget.properties.length > 0) {
                const property = junkTarget.properties[Math.floor(Math.random() * junkTarget.properties.length)];
                property.worthless = true;
                addLog(`🗑️ ${player.name} made ${junkTarget.name}'s ${property.name} worthless!`);
            }
            break;
        case "Idiotic Investment":
            player.money -= 200;
            player.pendingInvestment = { amount: 500, rounds: 2 };
            addLog(`💼 ${player.name} invested 200! Will gain 500 in 2 rounds.`);
            addLog(`💰 ${player.name} money: ${oldPlayerMoney} → ${player.money}`);
            break;
        case "Rules Are Suggestions":
            player.ignoreRule = true;
            addLog(`📜 ${player.name} can ignore one rule this round!`);
            break;
        case "This Is Fine":
            // Cancel all chaos cards - reset game state
            addLog(`🔥 ${player.name} cancelled all chaos effects!`);
            break;
        default:
            addLog(`🎴 ${player.name} played: ${card.description}`);
    }
    
    // Update money display immediately with animations
    updateDisplay();
    
    // Trigger money animation for player if they're the one who played
    if (player.id === gameState.playerId) {
        const moneyEl = document.getElementById('player-money');
        const moneyHeaderEl = document.getElementById('player-money-header');
        if (moneyEl && moneyHeaderEl) {
            const newMoney = player.money;
            const oldMoney = parseInt(moneyEl.textContent) || newMoney;
            if (newMoney !== oldMoney) {
                moneyEl.style.color = newMoney > oldMoney ? '#51cf66' : '#ff6b6b';
                moneyHeaderEl.style.color = newMoney > oldMoney ? '#51cf66' : '#ff6b6b';
                setTimeout(() => {
                    moneyEl.style.color = '#FFD700';
                    moneyHeaderEl.style.color = '#FFD700';
                }, 1500);
            }
        }
    }
    
    document.getElementById('card-modal').style.display = 'none';
    document.getElementById('player-select-modal').style.display = 'none';
    updateDisplay();
}

function advanceTurn() {
    // Move to next player
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    gameState.chaosCardPlayedThisTurn = false;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // If all players have had a turn, start next auction
    if (gameState.currentPlayerIndex === 0) {
        setTimeout(() => {
            processIncomePhase();
            setTimeout(() => startAuction(), 2000);
        }, 1500);
    } else {
        // Next player's turn
        if (currentPlayer.id === gameState.playerId) {
            // Human player's turn
            if (currentPlayer.chaosCards.length > 0) {
                document.getElementById('play-chaos-btn').disabled = false;
            }
            addLog(`Your turn! You can play a Chaos card.`);
        } else {
            // AI player's turn - they can play chaos card
            processAITurn(currentPlayer);
        }
        updateDisplay();
    }
}

function processAITurn(aiPlayer) {
    // Check if it's actually AI's turn
    if (gameState.currentPlayerIndex !== gameState.players.indexOf(aiPlayer)) {
        addLog(`⚠️ ${aiPlayer.name} turn mismatch, fixing...`);
        gameState.currentPlayerIndex = gameState.players.indexOf(aiPlayer);
    }
    
    // NPC: Check if already played or no cards
    if (aiPlayer.chaosCardPlayedThisTurn || aiPlayer.chaosCards.length === 0) {
        addLog(`${aiPlayer.name} skips turn (${aiPlayer.chaosCardPlayedThisTurn ? 'already played' : 'no cards'})`);
        setTimeout(() => advanceTurn(), 800);
        return;
    }
    
    // NPC Priority 1: Low money - use money card
    if (aiPlayer.money < 200) {
        const moneyCard = aiPlayer.chaosCards.find(c => 
            c.name === "Accounting Error (In Your Favor)" || 
            c.name === "We Found a Loophole"
        );
        if (moneyCard) {
            const index = aiPlayer.chaosCards.indexOf(moneyCard);
            executeChaosCardForAI(aiPlayer, moneyCard, index, null);
            setTimeout(() => advanceTurn(), 1200);
            return;
        }
    }
    
    // NPC Priority 2: Human player winning - sabotage (80% chance)
    const humanPlayer = gameState.players[gameState.playerId];
    if (humanPlayer && humanPlayer.completedTasks.length > aiPlayer.completedTasks.length) {
        const sabotageCard = aiPlayer.chaosCards.find(c => 
            c.name === "Unexpected Fine" || 
            c.name === "Lost the Paperwork" ||
            c.name === "Petty Crime, Big Smile"
        );
        if (sabotageCard && Math.random() < 0.8) {
            const index = aiPlayer.chaosCards.indexOf(sabotageCard);
            const target = sabotageCard.needsTarget ? gameState.playerId : null;
            executeChaosCardForAI(aiPlayer, sabotageCard, index, target);
            setTimeout(() => advanceTurn(), 1200);
            return;
        }
    }
    
    // NPC Priority 3: 70% chance to play any card (keep game moving)
    if (Math.random() < 0.7 && aiPlayer.chaosCards.length > 0) {
        const randomCard = aiPlayer.chaosCards[Math.floor(Math.random() * aiPlayer.chaosCards.length)];
        const index = aiPlayer.chaosCards.indexOf(randomCard);
        const target = randomCard.needsTarget ? 
            (gameState.players.find(p => p.id !== aiPlayer.id && p.id === gameState.playerId)?.id || 
             gameState.players.find(p => p.id !== aiPlayer.id)?.id) : null;
        executeChaosCardForAI(aiPlayer, randomCard, index, target);
        setTimeout(() => advanceTurn(), 1200);
        return;
    }
    
    // Skip turn
    addLog(`${aiPlayer.name} decides not to play a card.`);
    setTimeout(() => advanceTurn(), 800);
}

function processIncomePhase() {
    gameState.players.forEach(player => {
        // Process pending investments
        if (player.pendingInvestment) {
            player.pendingInvestment.rounds--;
            if (player.pendingInvestment.rounds <= 0) {
                player.money += player.pendingInvestment.amount;
                addLog(`💰 ${player.name} received investment return: ${player.pendingInvestment.amount}!`);
                player.pendingInvestment = null;
            }
        }
        
        // Catch-up money
        if (player.money === 0 && !player.hasReceivedCatchUp) {
            player.money = 100;
            player.hasReceivedCatchUp = true;
            addLog(`${player.name} receives catch-up money: 100`);
        }
        
        // Reset frozen properties
        player.properties.forEach(prop => {
            if (prop.frozen && prop.frozenUntil <= gameState.round) {
                prop.frozen = false;
                prop.frozenUntil = null;
            }
        });
    });
    
    if (gameState.currentPlayerIndex === 0) {
        gameState.players.forEach(player => {
            player.hasReceivedCatchUp = false;
            player.protected = false;
            player.ignoreRule = false;
        });
    }
    
    // Draw chaos cards
    gameState.players.forEach(player => {
        while (player.chaosCards.length < 5 && gameState.chaosDeck.length > 0) {
            player.chaosCards.push(gameState.chaosDeck.pop());
        }
        if (player.chaosCards.length > 5) {
            const discarded = player.chaosCards.splice(5);
            gameState.chaosDeck.push(...discarded);
            shuffleDeck(gameState.chaosDeck);
        }
    });
}

function checkTaskCompletion(playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    const completed = [];
    
    player.tasks.forEach((task, index) => {
        const ownsProperty = player.properties.some(prop => prop.name === task.propertyName && !prop.frozen);
        if (ownsProperty && !player.completedTasks.some(ct => ct.id === task.id)) {
            player.completedTasks.push(task);
            completed.push(task);
            addLog(`✅ ${player.name} completed: ${task.description}!`);
            
            player.tasks.splice(index, 1);
            if (gameState.taskDeck.length > 0) {
                player.tasks.push(gameState.taskDeck.pop());
            }
        }
    });
    
    if (player.completedTasks.length >= 4) {
        endGame();
    }
}

function updateDisplay() {
    document.getElementById('current-phase').textContent = 
        gameState.currentPhase.charAt(0).toUpperCase() + gameState.currentPhase.slice(1);
    document.getElementById('round-number').textContent = gameState.round;
    document.getElementById('player-name-display').textContent = playerName || 'You';
    
    const player = gameState.players[gameState.playerId];
    if (player) {
        document.getElementById('player-money').textContent = player.money;
        document.getElementById('player-money-header').textContent = `💰 ${player.money}`;
        document.getElementById('tasks-completed').textContent = player.completedTasks.length;
        document.getElementById('properties-owned').textContent = player.properties.length;
    }
    
    // Update auction
    const auctionDiv = document.getElementById('auction-property');
    if (gameState.currentAuction) {
        auctionDiv.innerHTML = `
            <div class="property-name">${gameState.currentAuction.name}</div>
            <div class="property-value">Base Value: ${gameState.currentAuction.value}</div>
            <div class="property-effect">${gameState.currentAuction.effect}</div>
        `;
    }
    
    document.getElementById('current-bid').textContent = gameState.currentBid;
    
    const statusDiv = document.getElementById('bidding-status');
    if (gameState.highestBidder !== null) {
        const bidder = gameState.players.find(p => p.id === gameState.highestBidder);
        statusDiv.textContent = `Highest Bidder: ${bidder.name}`;
    } else {
        statusDiv.textContent = "No bids yet";
    }
    
    // Update bidding order
    const orderDiv = document.getElementById('bidding-order');
    if (gameState.biddingOrder.length > 0) {
        orderDiv.innerHTML = `<strong>Bidding Order:</strong> ${gameState.biddingOrder.map((p, idx) => {
            const player = gameState.players.find(pl => pl.id === p.id);
            const isCurrent = idx === gameState.currentBidderIndex;
            return `<span style="${isCurrent ? 'font-weight: bold; color: #00b894;' : ''}">${player.name}</span>`;
        }).join(' → ')}`;
    }
    
    // Update players
    const playersContainer = document.getElementById('players-container');
    playersContainer.innerHTML = '';
    gameState.players.forEach((player, index) => {
        const isActive = index === gameState.currentPlayerIndex;
        playersContainer.innerHTML += `
            <div class="player-card ${isActive ? 'active' : ''}">
                <div class="player-name">${player.name}</div>
                <div class="player-stats">
                    <div>💰 ${player.money}</div>
                    <div>✅ ${player.completedTasks.length}</div>
                    <div>🏠 ${player.properties.length}</div>
                    <div>🃏 ${player.chaosCards.length}</div>
                </div>
            </div>
        `;
    });
    
    // Update cards
    updateCardsDisplay();
    updateActiveEffects();
    
    // Update button states
    updateButtonStates();
}

function updateButtonStates() {
    const player = gameState.players[gameState.playerId];
    if (!player) return;
    
    const bidBtn = document.getElementById('bid-btn');
    const passBtn = document.getElementById('pass-btn');
    const playChaosBtn = document.getElementById('play-chaos-btn');
    const sellPropertyBtn = document.getElementById('sell-property-btn');
    
    // Bid/Pass buttons - only enabled during auction phase on player's turn
    if (gameState.currentPhase === 'auction') {
        const isPlayerTurn = gameState.biddingOrder[gameState.currentBidderIndex]?.id === gameState.playerId;
        const canBid = player.money >= gameState.currentBid + 50;
        
        if (bidBtn) {
            bidBtn.disabled = !isPlayerTurn || !canBid || gameState.gameEnded;
        }
        if (passBtn) {
            passBtn.disabled = !isPlayerTurn || gameState.gameEnded;
        }
    } else {
        if (bidBtn) bidBtn.disabled = true;
        if (passBtn) passBtn.disabled = true;
    }
    
    // Play Chaos Card - only on player's turn in action phase
    if (playChaosBtn) {
        const isPlayerTurn = gameState.currentPlayerIndex === gameState.playerId;
        const inActionPhase = gameState.currentPhase === 'action';
        const hasCards = player.chaosCards.length > 0;
        const notPlayed = !gameState.chaosCardPlayedThisTurn;
        
        playChaosBtn.disabled = !isPlayerTurn || !inActionPhase || !hasCards || !notPlayed || gameState.gameEnded;
    }
    
    // Sell Property - always available if player has properties
    if (sellPropertyBtn) {
        sellPropertyBtn.disabled = player.properties.length === 0 || gameState.gameEnded;
    }
}

function updateCardsDisplay() {
    const player = gameState.players[gameState.playerId];
    if (!player) return;
    
    // Task cards - with completion indicators
    const taskCardsDiv = document.getElementById('task-cards');
    taskCardsDiv.innerHTML = '';
    player.tasks.forEach(task => {
        const isCompleted = player.completedTasks.some(ct => ct.id === task.id);
        const ownsProperty = player.properties.some(prop => prop.name === task.propertyName && !prop.frozen);
        taskCardsDiv.innerHTML += `
            <div class="card task-card ${isCompleted ? 'completed-task' : ''} ${ownsProperty && !isCompleted ? 'ready-to-complete' : ''}" style="font-weight: bold;">
                <div class="card-title" style="font-weight: bold;">${task.description}</div>
                <div class="card-description" style="font-weight: bold;">Property: ${task.propertyName}</div>
                ${isCompleted ? '<div style="color: #51cf66; font-weight: bold; margin-top: 10px; font-size: 1.1em;">✅ COMPLETED!</div>' : ''}
                ${ownsProperty && !isCompleted ? '<div style="color: #FFD700; font-weight: bold; margin-top: 10px; font-size: 1.1em;">⭐ Ready to Complete!</div>' : ''}
            </div>
        `;
    });
    
    // Chaos cards - click directly to play OR use button
    const chaosCardsDiv = document.getElementById('chaos-cards');
    chaosCardsDiv.innerHTML = '';
    const canPlay = gameState.currentPlayerIndex === gameState.playerId && 
                    gameState.currentPhase === 'action' && 
                    !gameState.chaosCardPlayedThisTurn;
    player.chaosCards.forEach((card, index) => {
        chaosCardsDiv.innerHTML += `
            <div class="card chaos-card ${canPlay ? 'playable' : ''}" onclick="selectChaosCard(${index})" style="cursor: ${canPlay ? 'pointer' : 'default'}; font-weight: bold;">
                <div class="card-title" style="font-weight: bold;">${card.name}</div>
                <div class="card-description" style="font-weight: bold;">${card.description}</div>
                ${canPlay ? '<div style="color: #51cf66; font-weight: bold; margin-top: 5px; font-size: 1.1em;">Click to Play</div>' : ''}
            </div>
        `;
    });
    
    // Properties
    const propertyCardsDiv = document.getElementById('property-cards');
    propertyCardsDiv.innerHTML = '';
    player.properties.forEach(property => {
        const isFrozen = property.frozen;
        propertyCardsDiv.innerHTML += `
            <div class="card property-card-owned ${isFrozen ? 'frozen-property' : ''}" style="font-weight: bold;">
                <div class="property-name" style="font-weight: bold;">${property.name}</div>
                <div class="property-value" style="font-weight: bold;">Value: ${property.value}</div>
                <div class="property-effect" style="font-weight: bold;">${property.effect}</div>
                ${isFrozen ? '<div style="color: #74b9ff; font-weight: bold; margin-top: 10px; font-size: 1.1em;">❄️ FROZEN</div>' : ''}
            </div>
        `;
    });
}

function updateActiveEffects() {
    const effectsDiv = document.getElementById('active-effects');
    effectsDiv.innerHTML = '';
    
    const player = gameState.players[gameState.playerId];
    if (player) {
        player.properties.forEach(property => {
            const effectBadge = document.createElement('div');
            effectBadge.className = 'effect-badge';
            effectBadge.innerHTML = `<strong>${property.name}:</strong> ${property.effect}`;
            effectsDiv.appendChild(effectBadge);
        });
    }
    
    if (gameState.currentAuction) {
        const effectBadge = document.createElement('div');
        effectBadge.className = 'effect-badge';
        effectBadge.style.background = '#ffeaa7';
        effectBadge.innerHTML = `<strong>🏷️ Auction: ${gameState.currentAuction.name}</strong><br>${gameState.currentAuction.effect}`;
        effectsDiv.appendChild(effectBadge);
    }
    
    if (effectsDiv.children.length === 0) {
        effectsDiv.innerHTML = '<p style="color: #999; font-style: italic;">No active effects</p>';
    }
}

function showEffectNotification(propertyName, effect, additionalMessage = "") {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
        border: 4px solid #f39c12;
        border-radius: 15px;
        padding: 30px;
        z-index: 2000;
        max-width: 500px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        text-align: center;
    `;
    
    notification.innerHTML = `
        <h2 style="color: #2d3436; margin-bottom: 15px;">${propertyName}</h2>
        ${additionalMessage ? `<p style="color: #00b894; font-weight: bold; margin-bottom: 15px;">${additionalMessage}</p>` : ''}
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="color: #2d3436; font-size: 1.1em; font-weight: bold;">⚠️ PROPERTY EFFECT:</p>
            <p style="color: #636e72; font-size: 1em; margin-top: 10px;">${effect}</p>
        </div>
        <button onclick="this.parentElement.remove()" style="
            padding: 12px 30px;
            background: #00b894;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1.1em;
            font-weight: bold;
            cursor: pointer;
            margin-top: 15px;
        ">Got it!</button>
    `;
    
    document.body.appendChild(notification);
}

function addLog(message) {
    const logDiv = document.getElementById('game-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logDiv.appendChild(entry);
    logDiv.scrollTop = logDiv.scrollHeight;
}

function endGame() {
    gameState.gameEnded = true;
    gameState.currentPhase = 'ended';
    
    let maxTasks = 0;
    let winners = [];
    
    gameState.players.forEach(player => {
        if (player.completedTasks.length > maxTasks) {
            maxTasks = player.completedTasks.length;
            winners = [player];
        } else if (player.completedTasks.length === maxTasks) {
            winners.push(player);
        }
    });
    
    // Tie-breaker: most money
    if (winners.length > 1) {
        let maxMoney = 0;
        winners = winners.filter(player => {
            if (player.money > maxMoney) {
                maxMoney = player.money;
                return true;
            } else if (player.money === maxMoney) {
                return true;
            }
            return false;
        });
    }
    
    // Tie-breaker: most properties
    if (winners.length > 1) {
        let maxProps = 0;
        winners = winners.filter(player => {
            if (player.properties.length > maxProps) {
                maxProps = player.properties.length;
                return true;
            } else if (player.properties.length === maxProps) {
                return true;
            }
            return false;
        });
    }
    
    addLog("=== GAME OVER ===");
    if (winners.length === 1) {
        addLog(`🏆 Winner: ${winners[0].name} with ${winners[0].completedTasks.length} completed tasks!`);
    } else {
        addLog(`🏆 Shared Victory! Winners: ${winners.map(w => w.name).join(', ')}`);
    }
    
    updateDisplay();
}

// Sell property function
function sellProperty() {
    const player = gameState.players[gameState.playerId];
    
    if (player.properties.length === 0) {
        addLog("You have no properties to sell!");
        return;
    }
    
    showPropertySelection(true);
}

function showPropertySelection(isSelling = false) {
    const modal = document.getElementById('card-modal');
    const modalBody = document.getElementById('modal-body');
    const player = gameState.players[gameState.playerId];
    
    modalBody.innerHTML = `<h3 style="color: #FFD700; margin-bottom: 20px;">${isSelling ? 'Select Property to Sell' : 'Your Properties'}:</h3><div class="cards-grid">`;
    
    player.properties.forEach((property, index) => {
        const sellValue = Math.floor(property.value / 2);
        modalBody.innerHTML += `
            <div class="card property-card-owned" onclick="sellPropertyAt(${index})" style="cursor: pointer;">
                <div class="property-name">${property.name}</div>
                <div class="property-value">Value: ${property.value}</div>
                ${isSelling ? `<div style="margin-top: 10px; color: #51cf66; font-weight: bold;">Sell for: ${sellValue}</div>` : ''}
                <div class="property-effect">${property.effect}</div>
            </div>
        `;
    });
    
    modalBody.innerHTML += '</div>';
    modal.style.display = 'block';
}

function sellPropertyAt(index) {
    const player = gameState.players[gameState.playerId];
    const property = player.properties[index];
    const sellValue = Math.floor(property.value / 2);
    
    player.money += sellValue;
    player.properties.splice(index, 1);
    
    // Add property to bottom of deck
    gameState.propertyDeck.unshift(property);
    
    addLog(`💰 You sold ${property.name} for ${sellValue}!`);
    
    document.getElementById('card-modal').style.display = 'none';
    updateDisplay();
}

function showLeaderboard() {
    const modal = document.getElementById('leaderboard-modal');
    const content = document.getElementById('leaderboard-content');
    
    if (typeof loadLeaderboard === 'function') {
        loadLeaderboard();
    }
    
    const stored = localStorage.getItem('leaderboard');
    const leaderboard = stored ? JSON.parse(stored) : [];
    
    if (leaderboard.length === 0) {
        content.innerHTML = '<p style="color: #FFD700;">No wins recorded yet. Play games to appear on the leaderboard!</p>';
    } else {
        content.innerHTML = '<div class="leaderboard-list">';
        leaderboard.slice(0, 10).forEach((entry, index) => {
            content.innerHTML += `
                <div class="leaderboard-entry">
                    <span style="font-weight: bold; color: #FFD700;">#${index + 1}</span>
                    <span>${entry.username}</span>
                    <span style="color: #51cf66;">${entry.wins} ${entry.wins === 1 ? 'win' : 'wins'}</span>
                </div>
            `;
        });
        content.innerHTML += '</div>';
    }
    
    modal.style.display = 'block';
}

// Global functions for onclick handlers
window.selectChaosCard = selectChaosCard;
window.submitBid = submitBid;
window.showScreen = showScreen;
window.sellPropertyAt = sellPropertyAt;
window.confirmTaskSelection = confirmTaskSelection;
window.toggleTaskSelection = toggleTaskSelection;
window.setPlayerName = setPlayerName;
window.selectMode = selectMode;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showLeaderboard = showLeaderboard;

// Modal close handlers and button event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal on background click
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Game buttons - wait for game screen to be ready
    setTimeout(() => {
        const bidBtn = document.getElementById('bid-btn');
        const passBtn = document.getElementById('pass-btn');
        const playChaosBtn = document.getElementById('play-chaos-btn');
        const sellPropertyBtn = document.getElementById('sell-property-btn');
        
        if (bidBtn) {
            bidBtn.addEventListener('click', placeBid);
        }
        
        if (passBtn) {
            passBtn.addEventListener('click', passBid);
        }
        
        if (playChaosBtn) {
            playChaosBtn.addEventListener('click', playChaosCard);
        }
        
        if (sellPropertyBtn) {
            sellPropertyBtn.addEventListener('click', sellProperty);
        }
    }, 100);
});
