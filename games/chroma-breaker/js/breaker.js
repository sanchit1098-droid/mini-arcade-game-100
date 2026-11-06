/**
 * Chroma Breaker - Cyber Brick Arcade Engine
 * Pure Vanilla HTML5 Canvas, Web Audio API, Touch + Mouse + Keyboard controls.
 */

class ChromaBreaker {
    constructor() {
        this.canvas = document.getElementById('breakerCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Audio Context
        this.audioCtx = null;
        this.muted = localStorage.getItem('chroma_breaker_muted') === 'true';

        // State
        this.state = 'READY'; // READY | PLAYING | PAUSED | GAMEOVER | VICTORY
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.highScore = parseInt(localStorage.getItem('chroma_breaker_hs') || '0', 10);
        this.bricksRemaining = 0;

        // Paddle
        this.paddle = {
            width: 100,
            height: 14,
            x: 0,
            y: 0,
            targetX: 0,
            speed: 8,
            color: '#00f2fe'
        };

        // Ball
        this.ball = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            radius: 7,
            baseSpeed: 6.5,
            trail: []
        };

        // Bricks & Particles
        this.bricks = [];
        this.particles = [];
        this.floatingTexts = [];

        // Key states
        this.keys = { left: false, right: false };

        this.initSize();
        this.bindEvents();
        this.buildLevel();
        this.resetPaddleAndBall();
        this.updateHUD();

        requestAnimationFrame((t) => this.loop(t));
    }

    initSize() {
        const resize = () => {
            const container = this.canvas.parentElement;
            const w = container.clientWidth || window.innerWidth;
            const h = container.clientHeight || window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            this.width = w;
            this.height = h;
            this.dpr = dpr;

            this.canvas.width = w * dpr;
            this.canvas.height = h * dpr;
            this.ctx.resetTransform?.();
            this.ctx.scale(dpr, dpr);

            this.paddle.y = h - 45;
            this.paddle.width = Math.max(80, Math.min(130, w * 0.22));
            if (this.state === 'READY') {
                this.resetPaddleAndBall();
            }
        };

        window.addEventListener('resize', resize);
        resize();
    }

    initAudio() {
        if (!this.audioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.audioCtx = new AudioCtx();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.2) {
        if (this.muted || !this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.4), now + duration);

        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + duration);
    }

    playBrickHit(row) {
        const freqs = [330, 392, 440, 523, 587, 659];
        const freq = freqs[row % freqs.length] || 440;
        this.playTone(freq, 'triangle', 0.12, 0.25);
    }

    playPaddleHit() {
        this.playTone(280, 'sine', 0.08, 0.3);
    }

    playLifeLost() {
        this.playTone(140, 'sawtooth', 0.3, 0.3);
    }

    playWin() {
        [523, 659, 784, 1046].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.2, 0.2), i * 120);
        });
    }

    bindEvents() {
        const getCanvasX = (clientX) => {
            const rect = this.canvas.getBoundingClientRect();
            return (clientX - rect.left);
        };

        const handlePointer = (clientX) => {
            this.initAudio();
            const x = getCanvasX(clientX);
            this.paddle.targetX = Math.max(this.paddle.width / 2, Math.min(this.width - this.paddle.width / 2, x));
        };

        // Mouse Controls
        this.canvas.addEventListener('mousemove', (e) => handlePointer(e.clientX));
        this.canvas.addEventListener('mousedown', () => {
            if (this.state === 'READY') this.launchBall();
        });

        // Touch Controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) handlePointer(e.touches[0].clientX);
            if (this.state === 'READY') this.launchBall();
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) handlePointer(e.touches[0].clientX);
        }, { passive: false });

        // Keyboard Controls
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') this.keys.right = true;
            if (e.code === 'Space') {
                if (this.state === 'READY') {
                    e.preventDefault();
                    this.launchBall();
                } else if (this.state === 'GAMEOVER' || this.state === 'VICTORY') {
                    this.restartGame();
                }
            }
            if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
                if (this.state === 'PLAYING') this.pauseGame();
                else if (this.state === 'PAUSED') this.resumeGame();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') this.keys.right = false;
        });

        // UI Buttons
        document.getElementById('btnStartBreaker')?.addEventListener('click', () => {
            this.initAudio();
            this.launchBall();
        });
        document.getElementById('btnPauseBreaker')?.addEventListener('click', () => {
            if (this.state === 'PLAYING') this.pauseGame();
        });
        document.getElementById('btnResumeBreaker')?.addEventListener('click', () => this.resumeGame());
        document.getElementById('btnRestartBreaker')?.addEventListener('click', () => this.restartGame());
        document.getElementById('btnPlayAgainBreaker')?.addEventListener('click', () => this.restartGame());
        document.getElementById('btnSoundToggleBreaker')?.addEventListener('click', () => this.toggleSound());

        // Auto pause on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state === 'PLAYING') this.pauseGame();
        });
    }

    toggleSound() {
        this.muted = !this.muted;
        localStorage.setItem('chroma_breaker_muted', this.muted);
        const btn = document.getElementById('btnSoundToggleBreaker');
        if (btn) btn.textContent = this.muted ? '🔇' : '🔊';
    }

    buildLevel() {
        this.bricks = [];
        const rows = 5;
        const cols = Math.min(8, Math.max(5, Math.floor(this.width / 55)));
        const padding = 8;
        const topOffset = 80;
        const totalW = this.width - 40;
        const brickW = (totalW - (cols - 1) * padding) / cols;
        const brickH = 20;

        const rowColors = ['#ff3838', '#ff9f1a', '#ffea00', '#2ecc71', '#00f2fe'];
        const rowPoints = [50, 40, 30, 20, 10];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.bricks.push({
                    x: 20 + c * (brickW + padding),
                    y: topOffset + r * (brickH + padding),
                    w: brickW,
                    h: brickH,
                    color: rowColors[r % rowColors.length],
                    points: rowPoints[r % rowPoints.length],
                    row: r,
                    active: true
                });
            }
        }
        this.bricksRemaining = this.bricks.length;
    }

    resetPaddleAndBall() {
        this.paddle.x = this.width / 2;
        this.paddle.targetX = this.paddle.x;
        this.ball.x = this.paddle.x;
        this.ball.y = this.paddle.y - this.ball.radius - 2;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.trail = [];
    }

    launchBall() {
        this.initAudio();
        this.state = 'PLAYING';
        document.getElementById('screenMenuBreaker')?.classList.add('hidden');
        document.getElementById('launchHint')?.classList.add('hidden');

        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
        const speed = this.ball.baseSpeed;
        this.ball.vx = Math.cos(angle) * speed;
        this.ball.vy = Math.sin(angle) * speed;
    }

    pauseGame() {
        if (this.state !== 'PLAYING') return;
        this.state = 'PAUSED';
        document.getElementById('screenPauseBreaker')?.classList.remove('hidden');
    }

    resumeGame() {
        if (this.state !== 'PAUSED') return;
        this.state = 'PLAYING';
        document.getElementById('screenPauseBreaker')?.classList.add('hidden');
    }

    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.particles = [];
        this.floatingTexts = [];
        this.buildLevel();
        this.resetPaddleAndBall();
        this.state = 'READY';

        document.getElementById('screenGameOverBreaker')?.classList.add('hidden');
        document.getElementById('screenPauseBreaker')?.classList.add('hidden');
        document.getElementById('screenMenuBreaker')?.classList.remove('hidden');
        document.getElementById('launchHint')?.classList.remove('hidden');
        this.updateHUD();
    }

    gameOver() {
        this.state = 'GAMEOVER';
        this.playLifeLost();

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('chroma_breaker_hs', this.score);
        }

        const scoreEl = document.getElementById('goScoreBreaker');
        if (scoreEl) scoreEl.textContent = this.score;
        const bestEl = document.getElementById('goBestBreaker');
        if (bestEl) bestEl.textContent = this.highScore;

        document.getElementById('screenGameOverBreaker')?.classList.remove('hidden');
    }

    victory() {
        this.state = 'VICTORY';
        this.playWin();
        this.score += 500; // Clear bonus!

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('chroma_breaker_hs', this.score);
        }

        const title = document.getElementById('gameOverTitleBreaker');
        if (title) title.textContent = '🎉 LEVEL CLEARED!';
        const scoreEl = document.getElementById('goScoreBreaker');
        if (scoreEl) scoreEl.textContent = this.score;
        const bestEl = document.getElementById('goBestBreaker');
        if (bestEl) bestEl.textContent = this.highScore;

        document.getElementById('screenGameOverBreaker')?.classList.remove('hidden');
    }

    updateHUD() {
        const scoreEl = document.getElementById('hudScoreBreaker');
        if (scoreEl) scoreEl.textContent = this.score;
        const livesEl = document.getElementById('hudLivesBreaker');
        if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, this.lives));
        const bestEl = document.getElementById('hudBestBreaker');
        if (bestEl) bestEl.textContent = this.highScore;
    }

    addSparks(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4.5;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                alpha: 1,
                decay: 0.03 + Math.random() * 0.02,
                radius: 2 + Math.random() * 3
            });
        }
    }

    addFloatingText(text, x, y, color = '#00f2fe') {
        this.floatingTexts.push({
            text, x, y, color,
            alpha: 1,
            vy: -1.6
        });
    }

    loop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.loop());
    }

    update() {
        // Keyboard paddle movement
        if (this.keys.left) this.paddle.targetX -= this.paddle.speed;
        if (this.keys.right) this.paddle.targetX += this.paddle.speed;
        this.paddle.targetX = Math.max(this.paddle.width / 2, Math.min(this.width - this.paddle.width / 2, this.paddle.targetX));

        // Smooth paddle interpolation
        this.paddle.x += (this.paddle.targetX - this.paddle.x) * 0.35;

        if (this.state === 'READY') {
            this.ball.x = this.paddle.x;
            this.ball.y = this.paddle.y - this.ball.radius - 2;
        } else if (this.state === 'PLAYING') {
            // Ball movement
            this.ball.x += this.ball.vx;
            this.ball.y += this.ball.vy;

            // Trail
            this.ball.trail.push({ x: this.ball.x, y: this.ball.y, alpha: 0.6 });
            if (this.ball.trail.length > 8) this.ball.trail.shift();

            // Wall Collisions
            if (this.ball.x - this.ball.radius <= 0) {
                this.ball.x = this.ball.radius;
                this.ball.vx = Math.abs(this.ball.vx);
                this.playPaddleHit();
            } else if (this.ball.x + this.ball.radius >= this.width) {
                this.ball.x = this.width - this.ball.radius;
                this.ball.vx = -Math.abs(this.ball.vx);
                this.playPaddleHit();
            }

            if (this.ball.y - this.ball.radius <= 0) {
                this.ball.y = this.ball.radius;
                this.ball.vy = Math.abs(this.ball.vy);
                this.playPaddleHit();
            }

            // Paddle Collision
            const pLeft = this.paddle.x - this.paddle.width / 2;
            const pRight = this.paddle.x + this.paddle.width / 2;
            const pTop = this.paddle.y;
            const pBottom = this.paddle.y + this.paddle.height;

            if (this.ball.y + this.ball.radius >= pTop &&
                this.ball.y - this.ball.radius <= pBottom &&
                this.ball.x >= pLeft && this.ball.x <= pRight &&
                this.ball.vy > 0) {

                // English spin angle based on hit position
                const hitPos = (this.ball.x - this.paddle.x) / (this.paddle.width / 2); // -1 to 1
                const maxAngle = Math.PI * 0.38; // Max 68 deg
                const currentSpeed = Math.hypot(this.ball.vx, this.ball.vy);
                const speed = Math.min(11, currentSpeed * 1.02); // Gradual speedup

                this.ball.vx = Math.sin(hitPos * maxAngle) * speed;
                this.ball.vy = -Math.cos(hitPos * maxAngle) * speed;
                this.ball.y = pTop - this.ball.radius;

                this.playPaddleHit();
                this.addSparks(this.ball.x, this.ball.y, '#00f2fe', 8);
            }

            // Brick Collisions
            for (const b of this.bricks) {
                if (!b.active) continue;

                if (this.ball.x + this.ball.radius >= b.x &&
                    this.ball.x - this.ball.radius <= b.x + b.w &&
                    this.ball.y + this.ball.radius >= b.y &&
                    this.ball.y - this.ball.radius <= b.y + b.h) {

                    b.active = false;
                    this.bricksRemaining--;
                    this.score += b.points;

                    // Bounce reflection
                    const overlapLeft = (this.ball.x + this.ball.radius) - b.x;
                    const overlapRight = (b.x + b.w) - (this.ball.x - this.ball.radius);
                    const overlapTop = (this.ball.y + this.ball.radius) - b.y;
                    const overlapBottom = (b.y + b.h) - (this.ball.y - this.ball.radius);

                    const minOverlapX = Math.min(overlapLeft, overlapRight);
                    const minOverlapY = Math.min(overlapTop, overlapBottom);

                    if (minOverlapX < minOverlapY) {
                        this.ball.vx = -this.ball.vx;
                    } else {
                        this.ball.vy = -this.ball.vy;
                    }

                    this.playBrickHit(b.row);
                    this.addSparks(this.ball.x, this.ball.y, b.color, 14);
                    this.addFloatingText(`+${b.points}`, b.x + b.w / 2, b.y, b.color);
                    this.updateHUD();

                    if (this.bricksRemaining <= 0) {
                        this.victory();
                    }
                    break;
                }
            }

            // Ball Lost (Bottom edge)
            if (this.ball.y - this.ball.radius > this.height) {
                this.lives--;
                this.playLifeLost();
                this.updateHUD();

                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    this.state = 'READY';
                    this.resetPaddleAndBall();
                    document.getElementById('launchHint')?.classList.remove('hidden');
                }
            }
        }

        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) this.particles.splice(i, 1);
        }

        // Update Floating Text
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy;
            ft.alpha -= 0.03;
            if (ft.alpha <= 0) this.floatingTexts.splice(i, 1);
        }
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw Bricks
        for (const b of this.bricks) {
            if (!b.active) continue;
            ctx.save();
            ctx.fillStyle = b.color;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(b.x, b.y, b.w, b.h, 4) : ctx.rect(b.x, b.y, b.w, b.h);
            ctx.fill();

            // Inner gloss
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, b.h * 0.35);
            ctx.restore();
        }

        // 2. Draw Ball Trail
        for (let i = 0; i < this.ball.trail.length; i++) {
            const t = this.ball.trail[i];
            ctx.save();
            ctx.beginPath();
            ctx.arc(t.x, t.y, this.ball.radius * (i / this.ball.trail.length), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 242, 254, ${t.alpha * (i / this.ball.trail.length)})`;
            ctx.fill();
            ctx.restore();
        }

        // 3. Draw Ball
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();

        // 4. Draw Paddle
        ctx.save();
        ctx.fillStyle = this.paddle.color;
        ctx.shadowColor = this.paddle.color;
        ctx.shadowBlur = 12;
        const pX = this.paddle.x - this.paddle.width / 2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(pX, this.paddle.y, this.paddle.width, this.paddle.height, 6) : ctx.rect(pX, this.paddle.y, this.paddle.width, this.paddle.height);
        ctx.fill();

        // Paddle Core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pX + this.paddle.width * 0.2, this.paddle.y + 3, this.paddle.width * 0.6, 3);
        ctx.restore();

        // 5. Draw Particles
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 6. Draw Floating Text
        for (const ft of this.floatingTexts) {
            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 16px "Montserrat", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.chromaBreaker = new ChromaBreaker();
});
