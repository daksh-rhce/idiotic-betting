const express = require('express');
const path = require('path');

const app = express();
const PORT = 5949;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve standalone Flappy Money page
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flappy Money - Standalone</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: Arial, sans-serif;
            color: #FFD700;
        }
        .container {
            text-align: center;
            width: 100%;
            max-width: 1200px;
            padding: 20px;
        }
        h1 {
            color: #FFD700;
            margin-bottom: 20px;
            font-size: 2.5em;
            text-shadow: 0 0 20px rgba(255,215,0,0.5);
            font-weight: bold;
        }
        #flappy-container {
            display: flex;
            justify-content: center;
            margin: 20px 0;
        }
        .info {
            color: #FFD700;
            margin-top: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>💰 Flappy Money - Standalone</h1>
        <div id="flappy-container"></div>
        <div class="info">
            <p>Click to play! Earn money based on your score!</p>
            <p>Score = Money earned (10 per pipe passed)</p>
        </div>
    </div>
    <script>
        // Standalone Flappy Money Game
        let flappyGame = {
            canvas: null,
            ctx: null,
            moneyBag: { x: 100, y: 300, width: 50, height: 50, velocity: 0, gravity: 0.3, horizontalSpeed: 0 },
            pipes: [],
            score: 0,
            gameOver: false,
            gameStarted: false,
            pipeGap: 250,
            pipeSpeed: 3,
            lastPipeTime: 0,
            moneyParticles: [],
            theme: 'og',
            money: 0
        };

        // Theme definitions (same as main game)
        const FLAPPY_THEMES = {
            og: {
                name: 'Original',
                cost: 0,
                owned: true,
                birdColor: '#8B4513',
                birdSymbol: '💰',
                pipeColor: '#FFD700',
                pipePattern: '💰',
                bgGradient: ['#1a5a1a', '#0d4d0d', '#052505'],
                floorColor: '#FFD700'
            },
            scifi: {
                name: 'Sci-Fi',
                cost: 100,
                owned: false,
                birdColor: '#00FFFF',
                birdSymbol: '🤖',
                pipeColor: '#C0C0C0',
                pipePattern: '⚙️',
                bgGradient: ['#0a0a2e', '#16213e', '#1a1a2e'],
                floorColor: '#4a90e2'
            },
            neon: {
                name: 'Neon',
                cost: 150,
                owned: false,
                birdColor: '#FF00FF',
                birdSymbol: '💜',
                pipeColor: '#00FFFF',
                pipePattern: '✨',
                bgGradient: ['#1a0033', '#330066', '#4d0099'],
                floorColor: '#FF00FF'
            },
            cyberpunk: {
                name: 'Cyberpunk',
                cost: 200,
                owned: false,
                birdColor: '#00FF00',
                birdSymbol: '⚡',
                pipeColor: '#FF0080',
                pipePattern: '🔷',
                bgGradient: ['#000000', '#1a0033', '#330033'],
                floorColor: '#00FF00'
            },
            space: {
                name: 'Space',
                cost: 250,
                owned: false,
                birdColor: '#FFD700',
                birdSymbol: '🚀',
                pipeColor: '#FFFFFF',
                pipePattern: '⭐',
                bgGradient: ['#000428', '#004e92', '#009ffd'],
                floorColor: '#FFD700'
            }
        };

        function initFlappyMoney() {
            const container = document.getElementById('flappy-container');
            if (!container) return;
            
            container.innerHTML = '';
            
            const canvas = document.createElement('canvas');
            canvas.id = 'flappy-money-canvas';
            
            const containerWidth = Math.min(window.innerWidth * 0.9, 1200);
            const aspectRatio = 600 / 400;
            canvas.width = containerWidth - 40;
            canvas.height = canvas.width * aspectRatio;
            
            const theme = FLAPPY_THEMES[flappyGame.theme] || FLAPPY_THEMES.og;
            canvas.style.cssText = 'border: 3px solid ' + theme.floorColor + '; ' +
                'border-radius: 10px; ' +
                'background: linear-gradient(180deg, ' + theme.bgGradient[0] + ' 0%, ' + theme.bgGradient[1] + ' 50%, ' + theme.bgGradient[2] + ' 100%); ' +
                'cursor: pointer; ' +
                'box-shadow: 0 0 20px ' + theme.floorColor + '80; ' +
                'display: block; ' +
                'margin: 0 auto; ' +
                'width: 100%; ' +
                'max-width: 100%; ' +
                'height: auto;';
            
            flappyGame.canvas = canvas;
            flappyGame.ctx = canvas.getContext('2d');
            container.appendChild(canvas);
            
            resetFlappyGame();
            
            canvas.addEventListener('click', jumpMoneyBag);
            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                jumpMoneyBag();
            });
            
            gameLoop();
        }

        function resetFlappyGame() {
            flappyGame.moneyBag = { x: 100, y: 300, width: 50, height: 50, velocity: 0, gravity: 0.3, horizontalSpeed: 0 };
            flappyGame.pipes = [];
            flappyGame.score = 0;
            flappyGame.gameOver = false;
            flappyGame.gameStarted = false;
            flappyGame.lastPipeTime = 0;
            flappyGame.moneyParticles = [];
        }

        function jumpMoneyBag() {
            if (!flappyGame.gameStarted) {
                flappyGame.gameStarted = true;
            }
            if (flappyGame.gameOver) {
                resetFlappyGame();
                return;
            }
            flappyGame.moneyBag.velocity = -9;
            flappyGame.moneyBag.horizontalSpeed = 1.5;
        }

        function updateFlappyGame() {
            if (!flappyGame.gameStarted || flappyGame.gameOver) return;
            
            flappyGame.moneyBag.velocity += flappyGame.moneyBag.gravity;
            flappyGame.moneyBag.y += flappyGame.moneyBag.velocity;
            
            if (flappyGame.moneyBag.horizontalSpeed > 0) {
                flappyGame.moneyBag.x += flappyGame.moneyBag.horizontalSpeed;
                flappyGame.moneyBag.horizontalSpeed *= 0.95;
            }
            
            if (flappyGame.moneyBag.x < 50) {
                flappyGame.moneyBag.x = 50;
            }
            if (flappyGame.moneyBag.x > flappyGame.canvas.width - flappyGame.moneyBag.width - 50) {
                flappyGame.moneyBag.x = flappyGame.canvas.width - flappyGame.moneyBag.width - 50;
            }
            
            if (flappyGame.moneyBag.y < 0) {
                flappyGame.moneyBag.y = 0;
                flappyGame.moneyBag.velocity = 0;
            }
            if (flappyGame.moneyBag.y + flappyGame.moneyBag.height > flappyGame.canvas.height - 60) {
                flappyGame.moneyBag.y = flappyGame.canvas.height - 60 - flappyGame.moneyBag.height;
                gameOverFlappy();
            }
            
            const now = Date.now();
            if (now - flappyGame.lastPipeTime > 2800) {
                createPipe();
                flappyGame.lastPipeTime = now;
            }
            
            flappyGame.pipes.forEach((pipe, index) => {
                pipe.x -= flappyGame.pipeSpeed;
                
                if (flappyGame.moneyBag.x < pipe.x + pipe.width &&
                    flappyGame.moneyBag.x + flappyGame.moneyBag.width > pipe.x &&
                    (flappyGame.moneyBag.y < pipe.topHeight ||
                     flappyGame.moneyBag.y + flappyGame.moneyBag.height > pipe.topHeight + flappyGame.pipeGap)) {
                    gameOverFlappy();
                }
                
                if (pipe.x + pipe.width < flappyGame.moneyBag.x && !pipe.passed) {
                    pipe.passed = true;
                    flappyGame.score++;
                    flappyGame.money += 10;
                    createMoneyParticle(pipe.x + pipe.width / 2, pipe.topHeight + flappyGame.pipeGap / 2);
                }
                
                if (pipe.x + pipe.width < 0) {
                    flappyGame.pipes.splice(index, 1);
                }
            });
            
            flappyGame.moneyParticles = flappyGame.moneyParticles.filter(particle => {
                particle.y += particle.velocity;
                particle.life--;
                return particle.life > 0;
            });
        }

        function createPipe() {
            const topHeight = Math.random() * (flappyGame.canvas.height - flappyGame.pipeGap - 120) + 60;
            flappyGame.pipes.push({
                x: flappyGame.canvas.width,
                width: 60,
                topHeight: topHeight,
                passed: false
            });
        }

        function createMoneyParticle(x, y) {
            for (let i = 0; i < 5; i++) {
                flappyGame.moneyParticles.push({
                    x: x,
                    y: y,
                    velocity: (Math.random() - 0.5) * 4,
                    life: 30
                });
            }
        }

        function gameOverFlappy() {
            if (flappyGame.gameOver) return;
            flappyGame.gameOver = true;
            const bonus = flappyGame.score * 10;
            flappyGame.money += bonus;
        }

        function drawFlappyGame() {
            if (!flappyGame.ctx || !flappyGame.canvas) return;
            
            const ctx = flappyGame.ctx;
            const canvas = flappyGame.canvas;
            const theme = FLAPPY_THEMES[flappyGame.theme] || FLAPPY_THEMES.og;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, theme.bgGradient[0]);
            gradient.addColorStop(0.5, theme.bgGradient[1]);
            gradient.addColorStop(1, theme.bgGradient[2]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = theme.pipeColor + '33';
            ctx.font = 'bold 18px Arial';
            for (let i = 0; i < 8; i++) {
                const x = (i * 40) % canvas.width;
                const y = (i * 50 + Date.now() / 50) % (canvas.height - 50);
                ctx.fillText(theme.pipePattern, x, y);
            }
            
            ctx.fillStyle = theme.floorColor;
            ctx.fillRect(0, canvas.height - 60, canvas.width, 60);
            
            ctx.fillStyle = theme.pipeColor;
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            for (let i = 20; i < canvas.width; i += 40) {
                ctx.fillText(theme.pipePattern, i, canvas.height - 30);
            }
            ctx.textAlign = 'left';
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, canvas.height - 60);
            ctx.lineTo(canvas.width, canvas.height - 60);
            ctx.stroke();
            
            flappyGame.pipes.forEach(pipe => {
                drawMoneyPipe(pipe.x, 0, pipe.width, pipe.topHeight, ctx, theme);
                drawMoneyPipe(pipe.x, pipe.topHeight + flappyGame.pipeGap, pipe.width, canvas.height - (pipe.topHeight + flappyGame.pipeGap) - 60, ctx, theme);
            });
            
            drawMoneyBag(flappyGame.moneyBag.x, flappyGame.moneyBag.y, flappyGame.moneyBag.width, flappyGame.moneyBag.height, ctx, theme);
            
            flappyGame.moneyParticles.forEach(particle => {
                ctx.fillStyle = theme.pipeColor;
                ctx.font = 'bold 16px Arial';
                ctx.fillText(theme.pipePattern, particle.x, particle.y);
            });
            
            ctx.fillStyle = theme.floorColor;
            ctx.font = 'bold 24px Arial';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText('Score: ' + flappyGame.score + ' | Money: 💰' + flappyGame.money, 10, 30);
            ctx.fillText('Score: ' + flappyGame.score + ' | Money: 💰' + flappyGame.money, 10, 30);
            
            if (flappyGame.gameOver) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = theme.floorColor;
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
                ctx.fillText('Score: ' + flappyGame.score, canvas.width / 2, canvas.height / 2);
                ctx.fillText('Total Money: 💰' + flappyGame.money, canvas.width / 2, canvas.height / 2 + 20);
                ctx.fillText('Click to Play Again', canvas.width / 2, canvas.height / 2 + 50);
                ctx.textAlign = 'left';
            } else if (!flappyGame.gameStarted) {
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = theme.floorColor;
                ctx.font = 'bold 18px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('💰 Flappy Money 💰', canvas.width / 2, canvas.height / 2 - 20);
                ctx.fillText('Click to Start!', canvas.width / 2, canvas.height / 2 + 10);
                ctx.textAlign = 'left';
            }
        }

        function drawMoneyBag(x, y, width, height, ctx, theme) {
            theme = theme || FLAPPY_THEMES[flappyGame.theme] || FLAPPY_THEMES.og;
            
            if (flappyGame.theme === 'og') {
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                ctx.fillStyle = theme.birdColor;
                ctx.beginPath();
                ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.shadowBlur = 15;
                ctx.shadowColor = theme.birdColor;
            }
            
            ctx.fillStyle = theme.birdColor;
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(theme.birdSymbol, x + width / 2, y + height / 2);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            ctx.shadowBlur = 0;
        }

        function drawMoneyPipe(x, y, width, height, ctx, theme) {
            theme = theme || FLAPPY_THEMES[flappyGame.theme] || FLAPPY_THEMES.og;
            
            ctx.fillStyle = theme.pipeColor;
            ctx.fillRect(x, y, width, height);
            
            ctx.fillStyle = theme.bgGradient[1];
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            for (let i = 15; i < height; i += 20) {
                for (let j = width / 2; j < width; j += width / 2) {
                    ctx.fillText(theme.pipePattern, x + j, y + i);
                }
            }
            ctx.textAlign = 'left';
            
            ctx.strokeStyle = theme.bgGradient[1];
            ctx.lineWidth = 1;
            for (let i = 0; i < width; i += 10) {
                ctx.beginPath();
                ctx.moveTo(x + i, y);
                ctx.lineTo(x + i, y + height);
                ctx.stroke();
            }
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
        }

        function gameLoop() {
            updateFlappyGame();
            drawFlappyGame();
            requestAnimationFrame(gameLoop);
        }

        window.addEventListener('load', () => {
            initFlappyMoney();
        });

        window.addEventListener('resize', () => {
            if (flappyGame.canvas) {
                const containerWidth = Math.min(window.innerWidth * 0.9, 1200);
                const aspectRatio = 600 / 400;
                flappyGame.canvas.width = containerWidth - 40;
                flappyGame.canvas.height = flappyGame.canvas.width * aspectRatio;
            }
        });
    </script>
</body>
</html>
    `);
});

app.listen(PORT, () => {
    console.log(`💰 Flappy Money Standalone running on http://localhost:${PORT}`);
});

