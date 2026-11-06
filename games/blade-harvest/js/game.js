/**
 * Main Game Controller
 * Manages game state, physics loop, spawning waves, scoring, combos, and UI updates.
 */

class FruitGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.soundCtrl = window.soundController;
        this.particles = new ParticleSystem();
        this.blade = new Blade(this.canvas, this.soundCtrl);

        // Game Configuration & State
        this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'
        this.mode = 'arcade'; // 'arcade' (60s) or 'classic' (3 lives)

        // Arcade timer
        this.arcadeTimeMax = 60;
        this.arcadeTimeLeft = 60;

        // Classic lives
        this.maxLives = 3;
        this.lives = 3;

        // Scoring & Stats
        this.score = 0;
        this.highScores = {
            arcade: parseInt(localStorage.getItem('fruit_slice_hs_arcade') || '0', 10),
            classic: parseInt(localStorage.getItem('fruit_slice_hs_classic') || '0', 10)
        };
        this.fruitsSlicedCount = 0;
        this.maxComboThisRun = 0;
        this.bombsHitCount = 0;

        // Wave & Spawning
        this.items = []; // Active fruits and bombs
        this.nextSpawnTime = 0;
        this.waveTimer = 0;
        this.difficultyLevel = 1;

        // Combo tracker
        this.recentSlices = []; // Timestamps of recent fruit slices in current swipe
        this.comboResetTimeout = null;

        // HUD cache to prevent DOM thrashing
        this._lastRenderedHUD = { score: -1, timer: -1, lives: -1 };

        // Timers & FPS
        this.lastTime = performance.now();
        this.isRunning = true;

        this.initCanvasSize();
        this.bindUI();
        this.checkFirstVisitTutorial();

        // Auto-pause when user switches tabs or window loses visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.state === 'PLAYING') {
                this.pauseGame();
            }
        });

        // Start render/update loop
        requestAnimationFrame((t) => this.loop(t));
    }

    initCanvasSize() {
        const resize = () => {
            const container = this.canvas.parentElement;
            const width = container.clientWidth || window.innerWidth;
            const height = container.clientHeight || window.innerHeight;

            const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for smooth 60fps
            this.canvas.width = width * dpr;
            this.canvas.height = height * dpr;

            this.width = width;
            this.height = height;
            this.dpr = dpr;

            this.ctx.resetTransform?.();
            this.ctx.scale(dpr, dpr);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('orientationchange', () => setTimeout(resize, 100));
        resize();
    }

    checkFirstVisitTutorial() {
        const seen = localStorage.getItem('fruit_slice_seen_tutorial');
        if (!seen) {
            this.showTutorial(true);
        }
    }

    // ================= UI BINDINGS ================= //

    bindUI() {
        // Mode Selector Buttons in Menu
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.soundCtrl.playClick();
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.mode = btn.dataset.mode;
                this.updateMenuHighScore();
            });
        });

        // Start Button
        const startBtn = document.getElementById('btnStartGame');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.soundCtrl.playClick();
                this.soundCtrl.playStart();
                this.startGame();
            });
        }

        // Pause / Resume Buttons
        const pauseBtn = document.getElementById('btnPause');
        const resumeBtn = document.getElementById('btnResume');
        const restartFromPauseBtn = document.getElementById('btnRestartPause');

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (this.state === 'PLAYING') {
                    this.soundCtrl.playClick();
                    this.pauseGame();
                }
            });
        }
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                this.soundCtrl.playClick();
                this.resumeGame();
            });
        }
        if (restartFromPauseBtn) {
            restartFromPauseBtn.addEventListener('click', () => {
                this.soundCtrl.playClick();
                this.startGame();
            });
        }

        // Game Over Buttons
        const playAgainBtn = document.getElementById('btnPlayAgain');
        const menuBtn = document.getElementById('btnBackToMenu');

        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.soundCtrl.playClick();
                this.startGame();
            });
        }
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.soundCtrl.playClick();
                this.showMenu();
            });
        }

        // Sound Toggle Button
        const soundBtn = document.getElementById('btnSoundToggle');
        if (soundBtn) {
            this.updateSoundButtonUI(soundBtn);
            soundBtn.addEventListener('click', () => {
                const muted = this.soundCtrl.toggleMute();
                this.updateSoundButtonUI(soundBtn);
                if (!muted) {
                    this.soundCtrl.playClick();
                }
            });
        }

        // How to Play Tutorial Modal
        const helpBtn = document.getElementById('btnHelp');
        const closeHelpBtn = document.getElementById('btnCloseHelp');
        const helpModal = document.getElementById('helpModal');

        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.soundCtrl.playClick();
                this.showTutorial(false);
            });
        }
        if (closeHelpBtn) {
            closeHelpBtn.addEventListener('click', () => {
                this.soundCtrl.playClick();
                helpModal.classList.add('hidden');
                localStorage.setItem('fruit_slice_seen_tutorial', 'true');
            });
        }

        // Keyboard Shortcuts: ESC or P for Pause, M for Mute, Space for Start
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
                if (this.state === 'PLAYING') {
                    this.pauseGame();
                } else if (this.state === 'PAUSED') {
                    this.resumeGame();
                }
            } else if (e.key.toLowerCase() === 'm') {
                if (soundBtn) soundBtn.click();
            } else if (e.code === 'Space') {
                if (this.state === 'MENU' || this.state === 'GAMEOVER') {
                    e.preventDefault();
                    this.startGame();
                }
            }
        });

        this.updateMenuHighScore();
    }

    updateSoundButtonUI(btn) {
        const muted = this.soundCtrl.isMuted();
        btn.innerHTML = muted ? '🔇' : '🔊';
        btn.setAttribute('title', muted ? 'Unmute Sound (M)' : 'Mute Sound (M)');
        btn.classList.toggle('muted', muted);
    }

    showTutorial(firstTime = false) {
        const helpModal = document.getElementById('helpModal');
        if (helpModal) {
            helpModal.classList.remove('hidden');
        }
    }

    updateMenuHighScore() {
        const hsEl = document.getElementById('menuHighScoreVal');
        if (hsEl) {
            hsEl.textContent = this.highScores[this.mode];
        }
    }

    // ================= GAME FLOW ================= //

    showMenu() {
        this.state = 'MENU';
        this.items = [];
        this.particles.reset();

        document.getElementById('screenMenu').classList.remove('hidden');
        document.getElementById('screenPause').classList.add('hidden');
        document.getElementById('screenGameOver').classList.add('hidden');
        document.getElementById('gameHUD').classList.add('hidden');

        this.updateMenuHighScore();
    }

    startGame() {
        this.state = 'PLAYING';
        this.score = 0;
        this.fruitsSlicedCount = 0;
        this.maxComboThisRun = 0;
        this.bombsHitCount = 0;
        this.difficultyLevel = 1;

        this.items = [];
        this.particles.reset();
        this.recentSlices = [];
        if (this.comboResetTimeout) {
            clearTimeout(this.comboResetTimeout);
            this.comboResetTimeout = null;
        }

        this._lastRenderedHUD = { score: -1, timer: -1, lives: -1 };

        if (this.mode === 'arcade') {
            this.arcadeTimeLeft = this.arcadeTimeMax;
            this.lastTimerSecond = performance.now();
        } else {
            this.lives = this.maxLives;
        }

        this.nextSpawnTime = performance.now() + 600;
        this.waveTimer = 0;

        // UI updates
        document.getElementById('screenMenu').classList.add('hidden');
        document.getElementById('screenPause').classList.add('hidden');
        document.getElementById('screenGameOver').classList.add('hidden');
        document.getElementById('gameHUD').classList.remove('hidden');

        this.updateHUD();
    }

    pauseGame() {
        if (this.state !== 'PLAYING') return;

        // Evaluate any pending combo before pausing
        if (this.comboResetTimeout) {
            clearTimeout(this.comboResetTimeout);
            this.comboResetTimeout = null;
            this.evaluateCombo();
        }

        this.state = 'PAUSED';
        document.getElementById('screenPause').classList.remove('hidden');
    }

    resumeGame() {
        if (this.state !== 'PAUSED') return;
        this.state = 'PLAYING';
        this.lastTime = performance.now();
        if (this.mode === 'arcade') {
            this.lastTimerSecond = performance.now();
        }
        document.getElementById('screenPause').classList.add('hidden');
    }

    gameOver(reason = 'time_up') {
        this.state = 'GAMEOVER';
        this.soundCtrl.playGameOver();

        const isNewRecord = this.score > this.highScores[this.mode];
        if (isNewRecord) {
            this.highScores[this.mode] = this.score;
            localStorage.setItem(`fruit_slice_hs_${this.mode}`, this.score);
        }

        // Fill stats in Game Over modal
        document.getElementById('goScoreVal').textContent = this.score;
        document.getElementById('goBestVal').textContent = this.highScores[this.mode];
        document.getElementById('goSlicedVal').textContent = this.fruitsSlicedCount;
        document.getElementById('goComboVal').textContent = this.maxComboThisRun;

        const recordBadge = document.getElementById('newRecordBadge');
        if (recordBadge) {
            recordBadge.classList.toggle('hidden', !isNewRecord || this.score === 0);
        }

        const titleEl = document.getElementById('gameOverTitle');
        if (titleEl) {
            if (reason === 'bomb') {
                titleEl.textContent = 'BOOM! GAME OVER';
                titleEl.style.color = '#ff3838';
            } else if (reason === 'lives_out') {
                titleEl.textContent = 'NO LIVES LEFT!';
                titleEl.style.color = '#ff9f1a';
            } else {
                titleEl.textContent = 'TIME UP!';
                titleEl.style.color = '#00f2fe';
            }
        }

        document.getElementById('screenGameOver').classList.remove('hidden');
    }

    updateHUD() {
        if (this.score !== this._lastRenderedHUD.score) {
            const scoreEl = document.getElementById('hudScoreVal');
            if (scoreEl) scoreEl.textContent = this.score;
            this._lastRenderedHUD.score = this.score;
        }

        const timerBox = document.getElementById('hudTimerBox');
        const livesBox = document.getElementById('hudLivesBox');

        if (this.mode === 'arcade') {
            if (timerBox.classList.contains('hidden')) timerBox.classList.remove('hidden');
            if (!livesBox.classList.contains('hidden')) livesBox.classList.add('hidden');

            const s = Math.ceil(this.arcadeTimeLeft);
            if (s !== this._lastRenderedHUD.timer) {
                const timerVal = document.getElementById('hudTimerVal');
                if (timerVal) {
                    timerVal.textContent = `${s}s`;
                    timerVal.style.color = s <= 10 ? '#ff3838' : '#ffffff';
                }
                this._lastRenderedHUD.timer = s;
            }
        } else {
            if (!timerBox.classList.contains('hidden')) timerBox.classList.add('hidden');
            if (livesBox.classList.contains('hidden')) livesBox.classList.remove('hidden');

            if (this.lives !== this._lastRenderedHUD.lives) {
                const heartsContainer = document.getElementById('hudLivesVal');
                if (heartsContainer) {
                    let html = '';
                    for (let i = 0; i < this.maxLives; i++) {
                        if (i < this.lives) {
                            html += '<span class="heart active">❤️</span>';
                        } else {
                            html += '<span class="heart lost">❌</span>';
                        }
                    }
                    heartsContainer.innerHTML = html;
                }
                this._lastRenderedHUD.lives = this.lives;
            }
        }
    }

    // ================= FRUIT SPAWNING ================= //

    spawnWave() {
        const w = this.width;
        const h = this.height;

        // Scale difficulty with score & time
        const elapsedSec = (this.mode === 'arcade')
            ? (this.arcadeTimeMax - this.arcadeTimeLeft)
            : (this.fruitsSlicedCount / 4);

        const difficulty = 1 + Math.min(3, elapsedSec / 20);

        // Determine cluster count (1 to 5 fruits)
        const minCount = Math.min(1 + Math.floor(difficulty * 0.7), 3);
        const maxCount = Math.min(2 + Math.floor(difficulty * 1.1), 5);
        const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));

        // Determine bomb probability
        const bombChance = (this.mode === 'arcade')
            ? Math.min(0.45, 0.15 + difficulty * 0.08)
            : Math.min(0.35, 0.10 + difficulty * 0.06);

        const includeBomb = Math.random() < bombChance;
        const bombIndex = includeBomb ? Math.floor(Math.random() * count) : -1;

        const availableTypes = ['WATERMELON', 'ORANGE', 'STRAWBERRY', 'GREEN_APPLE', 'KIWI', 'PINEAPPLE'];

        // Physics gravity scaled to canvas height
        const gravity = 0.28 * (h / 700);

        for (let i = 0; i < count; i++) {
            // Spawn spread horizontally
            const spawnX = (w * 0.15) + Math.random() * (w * 0.7);
            const spawnY = h + 40 + (i * 20); // Slightly below viewport bottom

            // Arc velocity toward center
            const targetX = (w * 0.3) + Math.random() * (w * 0.4);
            const dx = targetX - spawnX;
            const vx = (dx / 40) + (Math.random() - 0.5) * 2;

            // Launch velocity to reach 60%-80% of canvas height
            const targetPeakH = h * (0.62 + Math.random() * 0.25);
            // v^2 = 2 * g * h_peak
            const baseVy = -Math.sqrt(2 * gravity * targetPeakH);
            const vy = baseVy * (0.95 + Math.random() * 0.1);

            let typeId;
            if (i === bombIndex) {
                typeId = 'BOMB';
            } else {
                typeId = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            }

            const item = new FruitItem(typeId, spawnX, spawnY, vx, vy, gravity);
            this.items.push(item);
        }

        // Schedule next wave
        const nextDelay = Math.max(1100, 2400 - difficulty * 350) + (Math.random() * 400);
        this.nextSpawnTime = performance.now() + nextDelay;
    }

    // ================= SLICE & COMBO LOGIC ================= //

    handleSliceSuccess(fruit, cutInfo) {
        fruit.slice(cutInfo.angle);
        this.fruitsSlicedCount++;

        // Add points
        const basePoints = fruit.type.points || 1;
        this.score += basePoints;

        // Splatter juice
        this.particles.createJuiceSplash(cutInfo.x, cutInfo.y, fruit.type.juiceColor, 24, cutInfo.angle);

        // Sound effect with slight pitch variation
        const pitch = 0.85 + Math.random() * 0.35;
        this.soundCtrl.playSlice(pitch);

        // Floating points text
        this.particles.addFloatingText(`+${basePoints}`, cutInfo.x, cutInfo.y - 10, {
            color: fruit.type.juiceColor,
            size: 22
        });

        // Track combo within 350ms window
        const now = performance.now();
        this.recentSlices.push({ time: now, x: cutInfo.x, y: cutInfo.y });

        // Filter out slices older than 350ms
        this.recentSlices = this.recentSlices.filter(s => now - s.time < 350);

        if (this.comboResetTimeout) {
            clearTimeout(this.comboResetTimeout);
        }

        this.comboResetTimeout = setTimeout(() => {
            this.evaluateCombo();
        }, 120);

        this.updateHUD();
    }

    evaluateCombo() {
        const count = this.recentSlices.length;
        if (count >= 3) {
            let bonus = 0;
            let comboText = '';

            if (count === 3) {
                bonus = 30;
                comboText = 'COMBO x3! +30';
            } else if (count === 4) {
                bonus = 50;
                comboText = 'SUPER x4! +50';
            } else if (count >= 5) {
                bonus = 100;
                comboText = `MEGA x${count}! +${bonus}`;
            }

            this.score += bonus;
            if (count > this.maxComboThisRun) {
                this.maxComboThisRun = count;
            }

            // Audio combo chime
            this.soundCtrl.playCombo(count);

            // Floating combo text
            const lastSlice = this.recentSlices[this.recentSlices.length - 1];
            if (lastSlice) {
                this.particles.addFloatingText(comboText, lastSlice.x, lastSlice.y - 40, {
                    color: '#ffea00',
                    glow: '#ff9100',
                    size: 32,
                    targetScale: 1.3
                });
            }

            this.updateHUD();
        }
        this.recentSlices = [];
    }

    handleBombHit(bomb, cutInfo) {
        bomb.sliced = true;
        this.bombsHitCount++;
        this.soundCtrl.playExplosion();
        this.particles.createExplosion(cutInfo.x, cutInfo.y);

        if (this.mode === 'classic') {
            // Instant Game Over in classic mode!
            this.gameOver('bomb');
        } else {
            // Arcade mode penalty: -100 points, -10 seconds
            this.score = Math.max(0, this.score - 100);
            this.arcadeTimeLeft = Math.max(0, this.arcadeTimeLeft - 10);

            this.particles.addFloatingText('BOMB! -100 & -10s', cutInfo.x, cutInfo.y - 30, {
                color: '#ff1744',
                glow: '#d50000',
                size: 28,
                targetScale: 1.25
            });

            this.updateHUD();

            if (this.arcadeTimeLeft <= 0) {
                this.gameOver('time_up');
            }
        }
    }

    handleMissedFruit(fruit) {
        if (this.mode === 'classic' && !fruit.isBomb && !fruit.sliced && !fruit.missed) {
            fruit.missed = true;
            this.lives--;
            this.soundCtrl.playStrike();

            // Floating strike notification
            this.particles.addFloatingText('STRIKE ❌', fruit.x, this.height - 40, {
                color: '#ff1744',
                size: 26
            });

            this.updateHUD();

            if (this.lives <= 0) {
                this.gameOver('lives_out');
            }
        }
    }

    // ================= MAIN TICK & LOOP ================= //

    loop(currentTime) {
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        const dtFactor = dt * 60; // Normalized to 60fps
        this.lastTime = currentTime;

        if (this.state === 'PLAYING') {
            this.update(currentTime, dtFactor);
        }

        this.render();

        if (this.isRunning) {
            requestAnimationFrame((t) => this.loop(t));
        }
    }

    update(currentTime, dtFactor) {
        // 1. Arcade Timer Update
        if (this.mode === 'arcade') {
            this.arcadeTimeLeft -= (1 / 60) * dtFactor;
            if (this.arcadeTimeLeft <= 0) {
                this.arcadeTimeLeft = 0;
                this.updateHUD();
                this.gameOver('time_up');
                return;
            }
            this.updateHUD();
        }

        // 2. Wave Spawner
        if (currentTime >= this.nextSpawnTime) {
            this.spawnWave();
        }

        // 3. Update Blade
        this.blade.update();

        // 4. Update & Check Collisions for Items
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.update(dtFactor);

            // Slice collision check if not yet sliced
            if (!item.sliced && this.blade.isSwiping) {
                const collision = this.blade.checkCollision(item);
                if (collision) {
                    if (item.isBomb) {
                        this.handleBombHit(item, collision);
                    } else {
                        this.handleSliceSuccess(item, collision);
                    }
                }
            }

            // Check if dropped below bottom of screen
            if (item.y > this.height + 150) {
                if (!item.sliced) {
                    this.handleMissedFruit(item);
                }
                this.items.splice(i, 1);
            }
        }

        // 5. Update Particles
        this.particles.update(dtFactor);
    }

    render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.save();

        // Screen Shake
        const shake = this.particles.getShakeOffset();
        ctx.translate(shake.x, shake.y);

        // Clear Canvas
        ctx.clearRect(-20, -20, w + 40, h + 40);

        // 1. Splatters on background
        this.particles.drawSplashes(ctx);

        // 2. Fruit items & sliced halves
        for (const item of this.items) {
            item.draw(ctx);
        }

        // 3. Blade Ribbon Trail
        this.blade.draw(ctx);

        // 4. Particles (Juice droplets & fire)
        this.particles.drawParticles(ctx);
        this.particles.drawShockwaves(ctx);
        this.particles.drawFloatingTexts(ctx);

        // 5. Explosion Flash
        this.particles.drawFlash(ctx, w, h);

        ctx.restore();
    }
}

// Instantiate game on DOM ready
window.addEventListener('DOMContentLoaded', () => {
    window.game = new FruitGame();
});
