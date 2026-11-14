/**
 * Neon Snake - Arcade Engine
 * Pure Canvas 2D + Web Audio API
 */

class SoundController {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('arcade_sound_muted') === 'true';
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.muted = !this.muted;
        localStorage.setItem('arcade_sound_muted', this.muted);
        return !this.muted;
    }

    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.2) {
        if (this.muted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (_) {}
    }

    playEat() {
        if (this.muted || !this.ctx) return;
        this.playTone(523.25, 'sine', 0.08, 0.25); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.25), 50); // E5
    }

    playBonus() {
        if (this.muted || !this.ctx) return;
        this.playTone(587.33, 'triangle', 0.08, 0.3);
        setTimeout(() => this.playTone(783.99, 'triangle', 0.08, 0.3), 60);
        setTimeout(() => this.playTone(1046.50, 'triangle', 0.15, 0.3), 120);
    }

    playCrash() {
        if (this.muted || !this.ctx) return;
        this.playTone(120, 'sawtooth', 0.35, 0.4);
    }

    playTurn() {
        if (this.muted || !this.ctx) return;
        this.playTone(800, 'sine', 0.02, 0.05);
    }
}

class NeonSnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.sound = new SoundController();

        // UI elements
        this.hudScore = document.getElementById('hudScore');
        this.hudBest = document.getElementById('hudBest');
        this.btnPause = document.getElementById('btnPause');
        this.btnSound = document.getElementById('btnSoundToggle');
        this.screenMenu = document.getElementById('screenMenu');
        this.screenPause = document.getElementById('screenPause');
        this.screenGameOver = document.getElementById('screenGameOver');
        this.goScore = document.getElementById('goScore');
        this.goBest = document.getElementById('goBest');

        // Game Configuration
        this.gridCount = 22; // 22x22 cells
        this.cellSize = 20;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('neon_snake_hs') || '0', 10);
        this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'

        // Snake state
        this.snake = [];
        this.dir = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };
        this.food = { x: 5, y: 5, type: 'normal' };
        this.bonusFood = null;
        this.bonusTimer = 0;
        this.particles = [];

        // Timing
        this.lastStepTime = 0;
        this.baseInterval = 135; // ms per step
        this.currentInterval = 135;

        this.init();
    }

    init() {
        this.updateSoundButtonUI();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.bindEvents();
        this.hudBest.textContent = this.highScore;
        requestAnimationFrame((t) => this.loop(t));
    }

    updateSoundButtonUI() {
        if (this.btnSound) {
            this.btnSound.textContent = this.sound.muted ? '🔇' : '🔊';
        }
    }

    resize() {
        const container = document.getElementById('gameContainer');
        const padX = 24;
        const padY = window.innerWidth <= 900 ? 190 : 110;
        const availW = Math.min(container.clientWidth - padX, 580);
        const availH = Math.min(container.clientHeight - padY, 580);
        const size = Math.max(Math.min(availW, availH), 280);

        this.cellSize = Math.floor(size / this.gridCount);
        const actualSize = this.cellSize * this.gridCount;

        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = actualSize * dpr;
        this.canvas.height = actualSize * dpr;
        this.canvas.style.width = actualSize + 'px';
        this.canvas.style.height = actualSize + 'px';

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    bindEvents() {
        // Start & Play Again
        document.getElementById('btnStart')?.addEventListener('click', () => {
            this.sound.init();
            this.start();
        });
        document.getElementById('btnPlayAgain')?.addEventListener('click', () => {
            this.sound.init();
            this.start();
        });

        // Pause / Resume / Restart
        this.btnPause?.addEventListener('click', () => this.togglePause());
        document.getElementById('btnResume')?.addEventListener('click', () => this.togglePause());
        document.getElementById('btnRestart')?.addEventListener('click', () => this.start());

        // Sound Toggle
        this.btnSound?.addEventListener('click', () => {
            this.sound.init();
            this.sound.toggle();
            this.updateSoundButtonUI();
        });

        // Keyboard navigation
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                if (this.state === 'PLAYING' || this.state === 'PAUSED') {
                    this.togglePause();
                }
                return;
            }

            if (this.state !== 'PLAYING') return;

            this.sound.init();
            const k = e.key.toLowerCase();
            if ((k === 'arrowup' || k === 'w') && this.dir.y === 0) {
                this.nextDir = { x: 0, y: -1 };
                this.sound.playTurn();
            } else if ((k === 'arrowdown' || k === 's') && this.dir.y === 0) {
                this.nextDir = { x: 0, y: 1 };
                this.sound.playTurn();
            } else if ((k === 'arrowleft' || k === 'a') && this.dir.x === 0) {
                this.nextDir = { x: -1, y: 0 };
                this.sound.playTurn();
            } else if ((k === 'arrowright' || k === 'd') && this.dir.x === 0) {
                this.nextDir = { x: 1, y: 0 };
                this.sound.playTurn();
            }
        });

        // Virtual D-pad
        const bindDpad = (id, nx, ny) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const handlePress = (e) => {
                e.preventDefault();
                this.sound.init();
                if (this.state === 'MENU' || this.state === 'GAMEOVER') {
                    this.start();
                    return;
                }
                if (this.state === 'PLAYING') {
                    if (nx !== 0 && this.dir.x === 0) this.nextDir = { x: nx, y: 0 };
                    if (ny !== 0 && this.dir.y === 0) this.nextDir = { x: 0, y: ny };
                    this.sound.playTurn();
                }
            };
            btn.addEventListener('touchstart', handlePress, { passive: false });
            btn.addEventListener('mousedown', handlePress);
        };

        bindDpad('dpadUp', 0, -1);
        bindDpad('dpadDown', 0, 1);
        bindDpad('dpadLeft', -1, 0);
        bindDpad('dpadRight', 1, 0);

        // Touch Swipe on Canvas
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        this.canvas.addEventListener('touchend', (e) => {
            if (this.state !== 'PLAYING') return;
            if (e.changedTouches.length === 0) return;

            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            const dist = Math.hypot(dx, dy);

            if (dist > 25) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Horizontal swipe
                    if (dx > 0 && this.dir.x === 0) this.nextDir = { x: 1, y: 0 };
                    else if (dx < 0 && this.dir.x === 0) this.nextDir = { x: -1, y: 0 };
                } else {
                    // Vertical swipe
                    if (dy > 0 && this.dir.y === 0) this.nextDir = { x: 0, y: 1 };
                    else if (dy < 0 && this.dir.y === 0) this.nextDir = { x: 0, y: -1 };
                }
                this.sound.playTurn();
            }
        }, { passive: true });
    }

    start() {
        this.score = 0;
        this.hudScore.textContent = '0';
        this.currentInterval = this.baseInterval;
        this.dir = { x: 1, y: 0 };
        this.nextDir = { x: 1, y: 0 };

        const mid = Math.floor(this.gridCount / 2);
        this.snake = [
            { x: mid, y: mid },
            { x: mid - 1, y: mid },
            { x: mid - 2, y: mid }
        ];

        this.bonusFood = null;
        this.bonusTimer = 0;
        this.particles = [];
        this.spawnFood();

        this.screenMenu.classList.add('hidden');
        this.screenPause.classList.add('hidden');
        this.screenGameOver.classList.add('hidden');
        this.state = 'PLAYING';
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            this.screenPause.classList.remove('hidden');
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.screenPause.classList.add('hidden');
        }
    }

    spawnFood() {
        const emptyCells = [];
        for (let x = 1; x < this.gridCount - 1; x++) {
            for (let y = 1; y < this.gridCount - 1; y++) {
                const inSnake = this.snake.some(s => s.x === x && s.y === y);
                const inBonus = this.bonusFood && this.bonusFood.x === x && this.bonusFood.y === y;
                if (!inSnake && !inBonus) {
                    emptyCells.push({ x, y });
                }
            }
        }
        if (emptyCells.length > 0) {
            const rand = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.food = { x: rand.x, y: rand.y, type: 'normal' };
        }
    }

    spawnBonusFood() {
        const emptyCells = [];
        for (let x = 2; x < this.gridCount - 2; x++) {
            for (let y = 2; y < this.gridCount - 2; y++) {
                const inSnake = this.snake.some(s => s.x === x && s.y === y);
                const inFood = this.food.x === x && this.food.y === y;
                if (!inSnake && !inFood) {
                    emptyCells.push({ x, y });
                }
            }
        }
        if (emptyCells.length > 0) {
            const rand = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.bonusFood = { x: rand.x, y: rand.y, expires: Date.now() + 8000 };
        }
    }

    spawnParticles(x, y, color, count = 12) {
        const cx = (x + 0.5) * this.cellSize;
        const cy = (y + 0.5) * this.cellSize;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            this.particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                size: 2 + Math.random() * 3,
                color: color
            });
        }
    }

    step() {
        this.dir = { ...this.nextDir };
        const head = this.snake[0];
        const newHead = { x: head.x + this.dir.x, y: head.y + this.dir.y };

        // 1. Wall Collision (Game Over when hitting walls)
        if (newHead.x < 0 || newHead.x >= this.gridCount || newHead.y < 0 || newHead.y >= this.gridCount) {
            this.gameOver();
            return;
        }

        // 2. Self Collision
        if (this.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(newHead);

        // 3. Normal Food Collision
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            this.hudScore.textContent = this.score;
            this.sound.playEat();
            this.spawnParticles(this.food.x, this.food.y, '#00ff88', 14);

            // Speed scaling
            this.currentInterval = Math.max(65, this.baseInterval - Math.floor(this.score / 20) * 3);

            this.spawnFood();

            // Spawn bonus food every 40 points if not active
            if (this.score % 40 === 0 && !this.bonusFood) {
                this.spawnBonusFood();
            }
        } else if (this.bonusFood && newHead.x === this.bonusFood.x && newHead.y === this.bonusFood.y) {
            // 4. Bonus Food Collision
            this.score += 30;
            this.hudScore.textContent = this.score;
            this.sound.playBonus();
            this.spawnParticles(this.bonusFood.x, this.bonusFood.y, '#ffea00', 22);
            this.bonusFood = null;
        } else {
            // Keep length by popping tail
            this.snake.pop();
        }

        // Bonus food timer
        if (this.bonusFood && Date.now() > this.bonusFood.expires) {
            this.bonusFood = null;
        }
    }

    gameOver() {
        this.state = 'GAMEOVER';
        this.sound.playCrash();

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('neon_snake_hs', this.highScore);
            this.hudBest.textContent = this.highScore;
        }

        this.goScore.textContent = this.score;
        this.goBest.textContent = this.highScore;
        this.screenGameOver.classList.remove('hidden');
    }

    loop(timestamp) {
        if (this.state === 'PLAYING') {
            if (timestamp - this.lastStepTime > this.currentInterval) {
                this.step();
                this.lastStepTime = timestamp;
            }
        }

        this.render();
        requestAnimationFrame((t) => this.loop(t));
    }

    render() {
        const w = this.gridCount * this.cellSize;
        const h = this.gridCount * this.cellSize;

        this.ctx.clearRect(0, 0, w, h);

        // Draw Cyber Grid Lines
        this.ctx.strokeStyle = 'rgba(0, 242, 254, 0.06)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.gridCount; i++) {
            const pos = i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, h);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(w, pos);
            this.ctx.stroke();
        }

        // Draw Normal Food (Neon Glowing Orb)
        const fx = (this.food.x + 0.5) * this.cellSize;
        const fy = (this.food.y + 0.5) * this.cellSize;
        const r = this.cellSize * 0.38;

        this.ctx.save();
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 12;
        this.ctx.fillStyle = '#00ff88';
        this.ctx.beginPath();
        this.ctx.arc(fx, fy, r, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(fx, fy, r * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // Draw Bonus Star Food if active
        if (this.bonusFood) {
            const bx = (this.bonusFood.x + 0.5) * this.cellSize;
            const by = (this.bonusFood.y + 0.5) * this.cellSize;
            const br = this.cellSize * 0.44;
            const remaining = Math.max(0, this.bonusFood.expires - Date.now());
            const pulse = 0.8 + 0.3 * Math.sin(Date.now() * 0.01);

            this.ctx.save();
            this.ctx.shadowColor = '#ffea00';
            this.ctx.shadowBlur = 16 * pulse;
            this.ctx.fillStyle = '#ffea00';
            this.ctx.beginPath();
            this.ctx.arc(bx, by, br * pulse, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = `bold ${Math.floor(this.cellSize * 0.6)}px sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('★', bx, by);
            this.ctx.restore();
        }

        // Draw Snake Body
        for (let i = this.snake.length - 1; i >= 0; i--) {
            const seg = this.snake[i];
            const px = seg.x * this.cellSize;
            const py = seg.y * this.cellSize;
            const isHead = i === 0;

            const t = i / Math.max(this.snake.length, 1);
            // Gradient from Cyan (head) to Emerald (tail)
            const rVal = Math.round(0);
            const gVal = Math.round(242 * (1 - t) + 255 * t);
            const bVal = Math.round(254 * (1 - t) + 136 * t);

            this.ctx.save();
            if (isHead) {
                this.ctx.shadowColor = '#00f2fe';
                this.ctx.shadowBlur = 16;
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.roundRect(px + 1, py + 1, this.cellSize - 2, this.cellSize - 2, 6);
                this.ctx.fill();

                this.ctx.fillStyle = '#00f2fe';
                this.ctx.beginPath();
                this.ctx.roundRect(px + 3, py + 3, this.cellSize - 6, this.cellSize - 6, 4);
                this.ctx.fill();

                // Eyes
                this.ctx.fillStyle = '#070a13';
                const eyeR = this.cellSize * 0.12;
                if (this.dir.x === 1) {
                    this.ctx.beginPath();
                    this.ctx.arc(px + this.cellSize * 0.7, py + this.cellSize * 0.3, eyeR, 0, Math.PI * 2);
                    this.ctx.arc(px + this.cellSize * 0.7, py + this.cellSize * 0.7, eyeR, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (this.dir.x === -1) {
                    this.ctx.beginPath();
                    this.ctx.arc(px + this.cellSize * 0.3, py + this.cellSize * 0.3, eyeR, 0, Math.PI * 2);
                    this.ctx.arc(px + this.cellSize * 0.3, py + this.cellSize * 0.7, eyeR, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (this.dir.y === 1) {
                    this.ctx.beginPath();
                    this.ctx.arc(px + this.cellSize * 0.3, py + this.cellSize * 0.7, eyeR, 0, Math.PI * 2);
                    this.ctx.arc(px + this.cellSize * 0.7, py + this.cellSize * 0.7, eyeR, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(px + this.cellSize * 0.3, py + this.cellSize * 0.3, eyeR, 0, Math.PI * 2);
                    this.ctx.arc(px + this.cellSize * 0.7, py + this.cellSize * 0.3, eyeR, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            } else {
                this.ctx.shadowColor = `rgb(${rVal},${gVal},${bVal})`;
                this.ctx.shadowBlur = 8;
                this.ctx.fillStyle = `rgb(${rVal},${gVal},${bVal})`;
                this.ctx.beginPath();
                this.ctx.roundRect(px + 2, py + 2, this.cellSize - 4, this.cellSize - 4, 4);
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        // Draw and update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.94;
            p.vy *= 0.94;
            p.alpha -= 0.035;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new NeonSnakeGame();
});
