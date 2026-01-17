// Game Themes System
let currentGameTheme = localStorage.getItem('gameTheme') || 'default';

const GAME_THEMES = {
    default: {
        name: 'Default',
        cost: 0,
        owned: true
    },
    retro: {
        name: 'Retro',
        cost: 500,
        owned: false,
        description: 'Synthwave/vaporwave aesthetic'
    },
    poop: {
        name: 'Poop',
        cost: 1000,
        owned: false,
        description: 'Everything becomes 💩'
    },
    space: {
        name: 'Space',
        cost: 750,
        owned: false,
        description: 'Cosmic nebula theme'
    },
    ishowspeed: {
        name: 'iShowSpeed',
        cost: 1000,
        owned: false,
        description: 'iShowSpeed themed'
    },
    cookie: {
        name: 'Cookie',
        cost: 750,
        owned: false,
        description: 'Cookie themed'
    },
    error: {
        name: 'Error',
        cost: 1500,
        owned: false,
        description: 'ERROR glitch theme'
    }
};

// Load owned themes
function loadGameThemes() {
    const saved = localStorage.getItem('gameThemes');
    if (saved) {
        try {
            const owned = JSON.parse(saved);
            Object.keys(owned).forEach(key => {
                if (GAME_THEMES[key]) {
                    GAME_THEMES[key].owned = true;
                }
            });
        } catch (e) {
            console.error('Error loading game themes:', e);
        }
    }
    const savedTheme = localStorage.getItem('gameTheme');
    if (savedTheme && GAME_THEMES[savedTheme]) {
        currentGameTheme = savedTheme;
    }
}

// Save owned themes
function saveGameThemes() {
    const owned = {};
    Object.keys(GAME_THEMES).forEach(key => {
        if (GAME_THEMES[key].owned) {
            owned[key] = true;
        }
    });
    localStorage.setItem('gameThemes', JSON.stringify(owned));
    localStorage.setItem('gameTheme', currentGameTheme);
}

// Apply theme to all elements
function applyGameTheme(themeName) {
    if (!GAME_THEMES[themeName] || !GAME_THEMES[themeName].owned) {
        return;
    }
    
    currentGameTheme = themeName;
    saveGameThemes();
    
    const theme = GAME_THEMES[themeName];
    const body = document.body;
    
    // Remove previous theme classes
    body.classList.remove('theme-retro', 'theme-poop', 'theme-space', 'theme-ishowspeed', 'theme-cookie', 'theme-error');
    
    // Apply new theme class
    if (themeName !== 'default') {
        body.classList.add(`theme-${themeName}`);
    }
    
    // Apply theme-specific styles
    applyThemeStyles(themeName);
}

// Clear all theme text modifications
function clearThemeTextModifications() {
    // Select elements that might have theme modifications, but EXCLUDE input fields and editable elements
    // This ensures we don't interfere with user input
    const allTextElements = document.querySelectorAll('h1, h2, h3, h4, button, .btn, .card, p, span, div');
    
    allTextElements.forEach(el => {
        // Skip input fields, textareas, and other editable elements
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable || el.contentEditable === 'true') {
            return;
        }
        
        // Skip if element is inside an input/textarea
        if (el.closest('input, textarea, [contenteditable="true"]')) {
            return;
        }
        
        let text = el.textContent || '';
        let originalText = el.dataset.originalText || text;
        
        // Aggressively remove ERROR prefix/suffix (case-insensitive)
        originalText = originalText.replace(/^ERROR:\s*/gi, '').replace(/\s*ERROR$/gi, '').replace(/\s*ERROR\s*/gi, ' ').trim();
        text = text.replace(/^ERROR:\s*/gi, '').replace(/\s*ERROR$/gi, '').replace(/\s*ERROR\s*/gi, ' ').trim();
        
        // Remove poop emojis
        originalText = originalText.replace(/💩/g, '').trim();
        text = text.replace(/💩/g, '').trim();
        
        // Remove cookie emojis
        originalText = originalText.replace(/🍪/g, '').trim();
        text = text.replace(/🍪/g, '').trim();
        
        // Remove iShowSpeed emojis
        originalText = originalText.replace(/⚡/g, '').trim();
        text = text.replace(/⚡/g, '').trim();
        
        // Store cleaned original text and restore it
        el.dataset.originalText = originalText;
        el.textContent = originalText;
        
        // Clear all theme dataset attributes
        delete el.dataset.poopApplied;
        delete el.dataset.cookieApplied;
        delete el.dataset.errorApplied;
        delete el.dataset.speedApplied;
    });
}

// Apply theme-specific CSS
function applyThemeStyles(themeName) {
    // Clear all previous theme modifications first
    clearThemeTextModifications();
    
    let styleId = 'game-theme-styles';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
    }
    
    let css = '';
    
    switch(themeName) {
        case 'poop':
            css = `
                body { background: linear-gradient(135deg, #654321 0%, #3E2723 100%) !important; }
                .btn, button { 
                    background: #8B4513 !important; 
                    color: #FFD700 !important; 
                    border-color: #654321 !important;
                }
                .btn:hover { background: #A0522D !important; }
                h1, h2, h3, h4, p, span, div { color: #8B4513 !important; }
                .card, .minigame-card, .property-card, .task-card, .chaos-card { 
                    background: #8B4513 !important; 
                    border-color: #654321 !important;
                }
                .screen { background: linear-gradient(135deg, #654321 0%, #3E2723 100%) !important; }
            `;
            // Apply poop emoji to all text elements
            setTimeout(() => {
                document.querySelectorAll('h1, h2, h3, button, .btn').forEach(el => {
                    if (!el.dataset.poopApplied) {
                        // Store original text if not already stored
                        if (!el.dataset.originalText) {
                            el.dataset.originalText = el.textContent;
                        }
                        el.dataset.poopApplied = 'true';
                        const cleanText = el.dataset.originalText || el.textContent.replace(/💩/g, '').trim();
                        el.textContent = '💩 ' + cleanText + ' 💩';
                    }
                });
            }, 100);
            break;
        case 'space':
            css = `
                body { 
                    background: linear-gradient(135deg, #1a0033 0%, #000033 50%, #330033 100%) !important;
                    background-image: radial-gradient(circle at 20% 50%, rgba(138, 43, 226, 0.3), transparent 50%),
                                    radial-gradient(circle at 80% 80%, rgba(255, 20, 147, 0.3), transparent 50%),
                                    radial-gradient(circle at 40% 20%, rgba(0, 191, 255, 0.3), transparent 50%) !important;
                }
                .btn, button { 
                    background: linear-gradient(135deg, #8B00FF 0%, #FF1493 100%) !important;
                    border: 2px solid #00BFFF !important;
                    box-shadow: 0 0 20px rgba(138, 43, 226, 0.5) !important;
                }
                h1, h2, h3 { 
                    color: #FF1493 !important;
                    text-shadow: 0 0 10px rgba(255, 20, 147, 0.8) !important;
                }
            `;
            break;
        case 'retro':
            css = `
                body { 
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a0033 100%) !important;
                }
                .btn, button { 
                    background: linear-gradient(135deg, #FF00FF 0%, #00FFFF 100%) !important;
                    border: 2px solid #FF00FF !important;
                    box-shadow: 0 0 20px rgba(255, 0, 255, 0.6) !important;
                }
                h1, h2, h3 { 
                    color: #00FFFF !important;
                    text-shadow: 0 0 10px rgba(0, 255, 255, 0.8) !important;
                }
            `;
            break;
        case 'cookie':
            css = `
                body { 
                    background: linear-gradient(135deg, #D2691E 0%, #8B4513 100%) !important;
                    background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139, 69, 19, 0.1) 10px, rgba(139, 69, 19, 0.1) 20px) !important;
                }
                .btn, button { 
                    background: #8B4513 !important; 
                    color: #FFD700 !important; 
                    border-color: #654321 !important;
                }
                h1, h2, h3, h4, p, span, div { color: #8B4513 !important; }
                .card, .minigame-card, .property-card, .task-card, .chaos-card { 
                    background: #DEB887 !important; 
                    border-color: #8B4513 !important;
                }
                .screen { background: linear-gradient(135deg, #D2691E 0%, #8B4513 100%) !important; }
            `;
            // Apply cookie emoji
            setTimeout(() => {
                document.querySelectorAll('h1, h2, h3, button, .btn').forEach(el => {
                    if (!el.dataset.cookieApplied) {
                        // Store original text if not already stored
                        if (!el.dataset.originalText) {
                            el.dataset.originalText = el.textContent;
                        }
                        el.dataset.cookieApplied = 'true';
                        const cleanText = el.dataset.originalText || el.textContent.replace(/🍪/g, '').trim();
                        el.textContent = '🍪 ' + cleanText + ' 🍪';
                    }
                });
            }, 100);
            break;
        case 'error':
            css = `
                body { 
                    background: #000 !important;
                    background-image: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px) !important;
                }
                .btn, button, h1, h2, h3, h4, p, span, div, * {
                    color: #00FF00 !important;
                    text-shadow: 2px 0 0 #FF0000, -2px 0 0 #00FFFF !important;
                    font-family: 'Courier New', monospace !important;
                }
                .btn, button {
                    background: #000 !important;
                    border: 2px solid #00FF00 !important;
                    box-shadow: 2px 0 0 #FF0000, -2px 0 0 #00FFFF !important;
                }
                .card, .minigame-card, .property-card, .task-card, .chaos-card {
                    background: #000 !important;
                    border: 2px solid #00FF00 !important;
                    box-shadow: 2px 0 0 #FF0000, -2px 0 0 #00FFFF !important;
                }
                .screen { background: #000 !important; }
            `;
            // Apply ERROR text to all elements
            setTimeout(() => {
                // First clear any existing ERROR text
                document.querySelectorAll('h1, h2, h3, button, .btn, .card').forEach(el => {
                    let text = el.textContent || '';
                    // Remove any existing ERROR prefixes/suffixes
                    text = text.replace(/^ERROR:\s*/gi, '').replace(/\s*ERROR$/gi, '').replace(/\s*ERROR\s*/gi, ' ').trim();
                    if (!el.dataset.originalText) {
                        el.dataset.originalText = text;
                    }
                });
                // Then apply ERROR text
                document.querySelectorAll('h1, h2, h3, button, .btn, .card').forEach(el => {
                    if (!el.dataset.errorApplied) {
                        const originalText = el.dataset.originalText || el.textContent.replace(/^ERROR:\s*/gi, '').replace(/\s*ERROR$/gi, '').trim();
                        el.dataset.errorApplied = 'true';
                        el.textContent = 'ERROR: ' + originalText + ' ERROR';
                    }
                });
            }, 200);
            break;
        case 'ishowspeed':
            css = `
                body { background: #000 !important; }
                .btn, button { 
                    background: #FF0000 !important; 
                    color: #FFF !important; 
                    border-color: #CC0000 !important;
                }
                h1, h2, h3, h4, p, span, div { color: #FF0000 !important; }
                .card, .minigame-card, .property-card, .task-card, .chaos-card { 
                    background: #1a0000 !important; 
                    border-color: #FF0000 !important;
                }
                .screen { background: #000 !important; }
            `;
            // Apply iShowSpeed styling
            setTimeout(() => {
                document.querySelectorAll('h1, h2, h3, button, .btn').forEach(el => {
                    if (!el.dataset.speedApplied) {
                        // Store original text if not already stored
                        if (!el.dataset.originalText) {
                            el.dataset.originalText = el.textContent;
                        }
                        el.dataset.speedApplied = 'true';
                        const cleanText = el.dataset.originalText || el.textContent.replace(/⚡/g, '').trim();
                        el.textContent = '⚡ ' + cleanText + ' ⚡';
                    }
                });
            }, 100);
            break;
    }
    
    styleEl.textContent = css;
}

// Show game themes shop
function showGameThemes() {
    loadGameThemes();
    loadMinigameCharge();
    
    const overlay = document.createElement('div');
    overlay.id = 'game-themes-shop';
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
        max-width: 900px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    `;
    
    shopContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="color: #FFD700; font-size: 2em; font-weight: bold;">🎨 Game Themes Shop</h2>
            <button onclick="this.closest('#game-themes-shop').remove()" style="
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
            ⚡ Your Minigame Charge: ${minigamesState.minigameCharge}
        </div>
        <div id="theme-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
        </div>
    `;
    
    const themeList = shopContent.querySelector('#theme-list');
    
    Object.keys(GAME_THEMES).forEach(themeKey => {
        const theme = GAME_THEMES[themeKey];
        const themeCard = document.createElement('div');
        themeCard.style.cssText = `
            background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
            border: 3px solid ${theme.owned ? '#00FF00' : '#FFD700'};
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            cursor: ${theme.owned ? 'pointer' : 'default'};
            opacity: ${theme.owned ? '1' : '0.7'};
        `;
        
        const canBuy = minigamesState.minigameCharge >= theme.cost;
        
        themeCard.innerHTML = `
            <h3 style="color: #FFD700; font-weight: bold; margin-bottom: 10px;">${theme.name}</h3>
            <p style="color: #FFD700; font-size: 0.9em; margin-bottom: 15px;">${theme.description || 'Default theme'}</p>
            ${theme.owned ? 
                `<div style="color: #00FF00; font-weight: bold; margin-bottom: 10px;">✓ OWNED</div>
                 <button onclick="selectGameTheme('${themeKey}')" style="
                     background: ${currentGameTheme === themeKey ? '#666' : '#00FF00'};
                     color: #000;
                     border: none;
                     padding: 10px 20px;
                     border-radius: 10px;
                     font-weight: bold;
                     cursor: ${currentGameTheme === themeKey ? 'not-allowed' : 'pointer'};
                     opacity: ${currentGameTheme === themeKey ? '0.5' : '1'};
                 ">${currentGameTheme === themeKey ? 'CURRENT' : 'SELECT'}</button>` :
                `<div style="color: #FFD700; font-weight: bold; margin-bottom: 10px;">
                    Cost: ⚡ ${theme.cost} Minigame Charge
                </div>
                 <button onclick="buyGameTheme('${themeKey}')" style="
                     background: ${canBuy ? '#FFD700' : '#666'};
                     color: #000;
                     border: none;
                     padding: 10px 20px;
                     border-radius: 10px;
                     font-weight: bold;
                     cursor: ${canBuy ? 'pointer' : 'not-allowed'};
                     opacity: ${canBuy ? '1' : '0.5'};
                 ">${canBuy ? 'BUY' : 'NEED ' + theme.cost + ' CHARGE'}</button>
                `
            }
        `;
        
        themeList.appendChild(themeCard);
    });
    
    overlay.appendChild(shopContent);
    document.body.appendChild(overlay);
}

function buyGameTheme(themeKey) {
    const theme = GAME_THEMES[themeKey];
    if (!theme || theme.owned) return;
    
    loadMinigameCharge();
    
    if (minigamesState.minigameCharge < theme.cost) {
        alert(`You need ${theme.cost} minigame charge to buy this theme!`);
        return;
    }
    
    minigamesState.minigameCharge -= theme.cost;
    saveMinigameCharge();
    theme.owned = true;
    saveGameThemes();
    
    if (typeof addLog === 'function') {
        addLog(`🎨 Purchased ${theme.name} theme for ${theme.cost} minigame charge!`);
    }
    
    // Refresh shop
    const shop = document.getElementById('game-themes-shop');
    if (shop) shop.remove();
    showGameThemes();
}

function selectGameTheme(themeKey) {
    if (!GAME_THEMES[themeKey] || !GAME_THEMES[themeKey].owned) return;
    if (currentGameTheme === themeKey) return;
    
    applyGameTheme(themeKey);
    
    if (typeof addLog === 'function') {
        addLog(`🎨 Switched to ${GAME_THEMES[themeKey].name} theme!`);
    }
    
    // Close shop
    const shop = document.getElementById('game-themes-shop');
    if (shop) shop.remove();
}

// Make functions globally available
if (typeof window !== 'undefined') {
    window.showGameThemes = showGameThemes;
    window.buyGameTheme = buyGameTheme;
    window.selectGameTheme = selectGameTheme;
    window.applyGameTheme = applyGameTheme;
    window.loadGameThemes = loadGameThemes;
}

// Load theme on page load
if (typeof window !== 'undefined') {
    function initializeTheme() {
        // Clear any previous theme modifications first
        clearThemeTextModifications();
        loadGameThemes();
        // Apply theme after a brief delay to ensure DOM is ready
        setTimeout(() => {
            applyGameTheme(currentGameTheme);
        }, 100);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTheme);
    } else {
        initializeTheme();
    }
}

