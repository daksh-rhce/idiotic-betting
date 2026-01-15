// Random bot names for casino theme
const BOT_NAMES = [
    "Ace High", "Blackjack", "Lucky Seven", "Royal Flush", "Full House",
    "Poker Face", "Dealer Dave", "Card Shark", "Chip Stack", "Big Bet",
    "Roulette Roy", "Dice Roller", "Slot Master", "Jackpot Jack", "Casino King",
    "Vegas Vic", "High Roller", "Wild Card", "Bluff Master", "Showdown Sam"
];

function getRandomBotName(existingNames = []) {
    const available = BOT_NAMES.filter(name => !existingNames.includes(name));
    if (available.length === 0) {
        return `Bot ${Math.floor(Math.random() * 1000)}`;
    }
    return available[Math.floor(Math.random() * available.length)];
}

