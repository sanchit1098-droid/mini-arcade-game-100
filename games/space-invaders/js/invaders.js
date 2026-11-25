/**
 * Space Invaders - Adaptive AI Arcade Engine & 20-Level+ Campaign
 * Features:
 * - 20 progressively challenging campaign levels + Endless Overdrive (21+)
 * - Difficulty Tiers: Beginner (1-3), Easy-Med (4-6), Medium (7-10), Hard (11-15), Expert (16-20), Overdrive (21+)
 * - 5 Intelligent Enemy AI Types:
 *   1. Standard: Formation march & escalating fire rate
 *   2. Hunter: Horizontally tracks player position & fires aimed bolts
 *   3. Evasive: Reacts to player gunfire with unpredictable, fair dodge dashes
 *   4. Bomber: Drops plasma bombs & twin/cluster volleys toward player's zone
 *   5. Elite: Multi-HP heavy units with lateral weave & predictive burst fire
 * - 4 Multi-Phase Boss Battles (Levels 5, 10, 15, 20 + every 5 levels in Endless)
 * - Level Completion reward screen & Endless Mode continuation
 * - Power-ups: Rapid Fire ⚡, Double Lasers ♊, Spread Shot 🔱, Shield 🛡️, Extra Life ❤️
 * - Fixed: wave clear on collision, short landscape viewport scaling, continuous pointer drag firing,
 *   delta-time starfield (paused on PAUSED), pausable level transitions, and roundRect fallback.
 */

(function () {
    'use strict';

    // --- Canvas roundRect Compatibility Helper ---
    function drawRoundRect(ctx, x, y, w, h, r) {
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, w, h, r);
            return;
        }
        const radius = Math.min(r, w / 2, h / 2);
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.arcTo(x + w, y, x + w, y + radius, radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
        ctx.lineTo(x + radius, y + h);
        ctx.arcTo(x, y + h, x, y + h - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
    }

    // --- Web Audio Synthesizer ---
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
            localStorage.setItem('arcade_sound_muted', this.muted ? 'true' : 'false');
            return !this.muted;
        }

        playLaser() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(880, now);
                osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.1);
            } catch (_) {}
        }

        playAlienLaser() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(340, now);
                osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
                gain.gain.setValueAtTime(0.11, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.13);
            } catch (_) {}
        }

        playExplosion() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.exponentialRampToValueAtTime(25, now + 0.28);
                gain.gain.setValueAtTime(0.32, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.29);
            } catch (_) {}
        }

        playBossHit() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(420, now);
                osc.frequency.exponentialRampToValueAtTime(190, now + 0.07);
                gain.gain.setValueAtTime(0.22, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.08);
            } catch (_) {}
        }

        playPowerup() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                [440, 554.37, 659.25, 880].forEach((freq, idx) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.04);
                    gain.gain.setValueAtTime(0.18, now + idx * 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.12);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + idx * 0.04);
                    osc.stop(now + idx * 0.04 + 0.13);
                });
            } catch (_) {}
        }

        playShieldBreak() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(520, now);
                osc.frequency.exponentialRampToValueAtTime(70, now + 0.26);
                gain.gain.setValueAtTime(0.28, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.27);
            } catch (_) {}
        }

        playWaveClear() {
            if (this.muted || !this.ctx) return;
            try {
                const notes = [440, 554.37, 659.25, 880];
                const now = this.ctx.currentTime;
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + i * 0.08);
                    gain.gain.setValueAtTime(0.22, now + i * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.24);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + i * 0.08);
                    osc.stop(now + i * 0.08 + 0.25);
                });
            } catch (_) {}
        }

        playVictory() {
            if (this.muted || !this.ctx) return;
            try {
                const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
                const now = this.ctx.currentTime;
                chords.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + i * 0.09);
                    gain.gain.setValueAtTime(0.25, now + i * 0.09);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.45);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + i * 0.09);
                    osc.stop(now + i * 0.09 + 0.46);
                });
            } catch (_) {}
        }

        playGameOver() {
            if (this.muted || !this.ctx) return;
            try {
                const notes = [349, 311, 277, 207];
                const now = this.ctx.currentTime;
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, now + i * 0.12);
                    gain.gain.setValueAtTime(0.22, now + i * 0.12);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.28);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + i * 0.12);
                    osc.stop(now + i * 0.12 + 0.3);
                });
            } catch (_) {}
        }
    }

    // --- Space Invaders Arcade Engine ---
    class SpaceInvadersGame {
        constructor() {
            this.canvas = document.getElementById('invadersCanvas');
            this.ctx = this.canvas.getContext('2d');
            this.sound = new SoundController();

            // HUD & UI Elements
            this.hudScore = document.getElementById('hudScore');
            this.hudWave = document.getElementById('hudWave');
            this.hudDifficulty = document.getElementById('hudDifficulty');
            this.hudBest = document.getElementById('hudBest');
            this.hudLives = document.getElementById('hudLives');
            this.hudPowerups = document.getElementById('hudPowerups');
            this.btnPause = document.getElementById('btnPause');
            this.btnSound = document.getElementById('btnSoundToggle');

            this.bossHealthContainer = document.getElementById('bossHealthContainer');
            this.bossName = document.getElementById('bossName');
            this.bossBarFill = document.getElementById('bossBarFill');

            this.levelBanner = document.getElementById('levelBanner');
            this.bannerTitle = document.getElementById('bannerTitle');
            this.bannerSub = document.getElementById('bannerSub');

            this.screenMenu = document.getElementById('screenMenu');
            this.screenPause = document.getElementById('screenPause');
            this.screenLevelComplete = document.getElementById('screenLevelComplete');
            this.screenGameOver = document.getElementById('screenGameOver');
            this.screenVictory = document.getElementById('screenVictory');

            // Level Complete Modal Elements
            this.lcBadge = document.getElementById('lcBadge');
            this.lcTitle = document.getElementById('lcTitle');
            this.lcSubtitle = document.getElementById('lcSubtitle');
            this.lcBonus = document.getElementById('lcBonus');
            this.lcDifficulty = document.getElementById('lcDifficulty');
            this.lcScore = document.getElementById('lcScore');
            this.lcNextSector = document.getElementById('lcNextSector');

            this.goTitle = document.getElementById('goTitle');
            this.goScore = document.getElementById('goScore');
            this.goWave = document.getElementById('goWave');
            this.goKills = document.getElementById('goKills');
            this.goBest = document.getElementById('goBest');

            this.vicScore = document.getElementById('vicScore');
            this.vicLives = document.getElementById('vicLives');
            this.vicRecordStatus = document.getElementById('vicRecordStatus');

            // Viewport & Scale
            this.width = 0;
            this.height = 0;
            this.dpr = 1;

            // State Machine
            // 'MENU', 'PLAYING', 'LEVEL_TRANSITION', 'LEVEL_COMPLETE', 'PAUSED', 'GAMEOVER', 'VICTORY'
            this.state = 'MENU';
            this.pausedPreviousState = 'PLAYING';
            this.score = 0;
            this.highScore = parseInt(localStorage.getItem('space_invaders_hs') || '0', 10);
            this.wave = 1;
            this.maxWaves = 20;
            this.endlessMode = false;
            this.lives = 3;
            this.kills = 0;
            this.waveCleared = false;

            // Player Ship
            this.player = {
                x: 0,
                y: 0,
                width: 52,
                height: 38,
                speed: 500,
                tilt: 0,
                lastX: 0,
                invulnerableTimer: 0,
                shieldActive: false,
                shieldTimer: 0,
                rapidFireTimer: 0,
                weaponType: 'normal', // 'normal', 'double', 'spread'
                weaponTimer: 0
            };

            // Inputs
            this.keys = { left: false, right: false, fire: false, pointerFire: false };
            this.isPointerDown = false;
            this.pointerTargetX = null;
            this.lastFireTime = 0;

            // Entities
            this.lasers = [];
            this.enemyLasers = [];
            this.aliens = [];
            this.boss = null;
            this.powerups = [];
            this.particles = [];
            this.stars = [];

            // Alien formation kinematics
            this.alienDir = 1;
            this.alienSpeed = 35;
            this.alienDropDist = 16;
            this.nextAlienFireTime = 0;
            this.simTime = 0;

            // Screen Shake
            this.screenShakeTime = 0;
            this.screenShakeIntensity = 0;

            // Banner & Transition Timers (pausable & leak-free)
            this.bannerTimeout = null;
            this.bannerRemainingMs = 0;
            this.bannerStartTime = 0;
            this.outcomeTimeout = null;
            this.outcomeRemainingMs = 0;
            this.outcomeStartTime = 0;
            this.outcomeType = null; // 'level' | 'victory'
            this.pausedAtMs = 0;
            this.bossVictoryTimeout = null;
            this.bossWaveTimeout = null;
            this.waveClearTimeout = null;

            this.lastTime = performance.now();
            this.init();
        }

        getDifficultyInfo(waveNum) {
            if (waveNum <= 3) {
                return { label: 'BEGINNER', colorClass: 'accent-green', hex: '#00ff88', tierIndex: 1 };
            } else if (waveNum <= 6) {
                return { label: 'EASY-MED', colorClass: 'accent-cyan', hex: '#00f2fe', tierIndex: 2 };
            } else if (waveNum <= 10) {
                return { label: 'MEDIUM', colorClass: 'accent-gold', hex: '#ffea00', tierIndex: 3 };
            } else if (waveNum <= 15) {
                return { label: 'HARD', colorClass: 'accent-orange', hex: '#ff8800', tierIndex: 4 };
            } else if (waveNum <= 20) {
                return { label: 'EXPERT', colorClass: 'accent-pink', hex: '#ff007f', tierIndex: 5 };
            }
            return { label: 'OVERDRIVE', colorClass: 'accent-purple', hex: '#c084fc', tierIndex: 6 };
        }

        updateDifficultyHUD() {
            const info = this.getDifficultyInfo(this.wave);
            if (this.hudWave) {
                this.hudWave.textContent = this.wave <= this.maxWaves
                    ? `${this.wave} / ${this.maxWaves}`
                    : `${this.wave} (ENDLESS)`;
            }
            if (this.hudDifficulty) {
                this.hudDifficulty.textContent = info.label;
                this.hudDifficulty.className = info.colorClass;
            }
        }

        init() {
            this.updateSoundButtonUI();
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.createStars();
            this.bindEvents();

            if (this.hudBest) {
                this.hudBest.textContent = this.highScore;
            }
            this.updateDifficultyHUD();

            requestAnimationFrame((t) => this.loop(t));
        }

        updateSoundButtonUI() {
            if (this.btnSound) {
                this.btnSound.textContent = this.sound.muted ? '🔇' : '🔊';
            }
        }

        createStars() {
            this.stars = [];
            const count = 95;
            for (let i = 0; i < count; i++) {
                this.stars.push({
                    x: Math.random() * (this.width || 800),
                    y: Math.random() * (this.height || 600),
                    size: Math.random() * 2.2 + 0.6,
                    speed: Math.random() * 28 + 16,
                    color: Math.random() > 0.4 ? '#00f2fe' : (Math.random() > 0.4 ? '#ff007f' : '#ffffff'),
                    alpha: Math.random() * 0.7 + 0.3
                });
            }
        }

        resize() {
            const container = document.getElementById('spaceContainer') || document.body;
            this.width = container.clientWidth || window.innerWidth;
            this.height = container.clientHeight || window.innerHeight;

            this.dpr = window.devicePixelRatio || 1;
            this.canvas.width = Math.round(this.width * this.dpr);
            this.canvas.height = Math.round(this.height * this.dpr);
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';

            this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

            // Responsive bottom margin: safe for mobile buttons AND short landscape screens
            const isShort = this.height <= 500;
            const isTouchLayout = this.width <= 900;
            const bottomMargin = isShort
                ? Math.max(54, Math.min(82, Math.round(this.height * 0.19)))
                : (isTouchLayout ? 132 : 82);

            this.player.y = Math.max(120, this.height - bottomMargin);

            // Keep player safely within screen bounds
            if (this.player.x <= 0 || this.player.x + this.player.width >= this.width) {
                this.player.x = (this.width - this.player.width) / 2;
            } else {
                this.player.x = Math.max(10, Math.min(this.width - this.player.width - 10, this.player.x));
            }
            this.player.lastX = this.player.x;

            // Keep stars within resized viewport
            for (const s of this.stars) {
                if (s.x > this.width) s.x = Math.random() * this.width;
                if (s.y > this.height) s.y = Math.random() * this.height;
            }

            // Keep existing aliens safely above the player if viewport shrinks vertically
            if (this.aliens && this.aliens.length > 0) {
                let maxAlienBottom = 0;
                for (const a of this.aliens) {
                    if (a.y + a.h > maxAlienBottom) maxAlienBottom = a.y + a.h;
                    if (a.x + a.w > this.width - 12) {
                        a.x = Math.max(12, this.width - 12 - a.w);
                    }
                }
                const safeCeiling = this.player.y - 36;
                if (maxAlienBottom > safeCeiling) {
                    const shiftUp = maxAlienBottom - safeCeiling;
                    for (const a of this.aliens) {
                        a.y = Math.max(46, a.y - shiftUp);
                    }
                }
            }

            // Keep active boss safely framed if viewport resizes
            if (this.boss) {
                this.boss.w = Math.min(230, this.width * 0.56);
                this.boss.h = this.height <= 460 ? 58 : (this.boss.tier >= 3 ? 96 : 82);
                this.boss.baseTargetY = this.height <= 460 ? 54 : 84;
                this.boss.targetY = this.boss.baseTargetY;
                this.boss.x = Math.max(15, Math.min(this.width - 15 - this.boss.w, this.boss.x));
                if (this.boss.y > this.player.y - this.boss.h - 40) {
                    this.boss.y = Math.max(40, this.boss.baseTargetY);
                }
            }
        }

        bindEvents() {
            // Start & Redeploy
            document.getElementById('btnStart')?.addEventListener('click', () => {
                this.sound.init();
                this.start();
            });
            document.getElementById('btnPlayAgain')?.addEventListener('click', () => {
                this.sound.init();
                this.start();
            });
            document.getElementById('btnVicPlayAgain')?.addEventListener('click', () => {
                this.sound.init();
                this.start();
            });
            document.getElementById('btnContinueEndless')?.addEventListener('click', () => {
                this.sound.init();
                this.continueEndless();
            });
            document.getElementById('btnNextWave')?.addEventListener('click', () => {
                this.sound.init();
                this.advanceFromLevelComplete();
            });

            // Pause, Resume, Restart
            this.btnPause?.addEventListener('click', () => this.togglePause());
            document.getElementById('btnResume')?.addEventListener('click', () => this.togglePause());
            document.getElementById('btnRestart')?.addEventListener('click', () => this.start());

            // Sound Toggle
            this.btnSound?.addEventListener('click', () => {
                this.sound.init();
                this.sound.toggle();
                this.updateSoundButtonUI();
            });

            // Keyboard Controls
            window.addEventListener('keydown', (e) => {
                if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) {
                    e.preventDefault();
                }

                if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                    if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'LEVEL_TRANSITION') {
                        this.togglePause();
                    }
                    return;
                }

                if (e.key === 'Enter' && this.state === 'LEVEL_COMPLETE') {
                    e.preventDefault();
                    this.sound.init();
                    this.advanceFromLevelComplete();
                    return;
                }

                if (this.state !== 'PLAYING') return;

                const k = e.key.toLowerCase();
                if (k === 'arrowleft' || k === 'a') this.keys.left = true;
                if (k === 'arrowright' || k === 'd') this.keys.right = true;
                if (k === ' ' || k === 'arrowup' || k === 'w') {
                    this.keys.fire = true;
                    this.shoot();
                }
            });

            window.addEventListener('keyup', (e) => {
                const k = e.key.toLowerCase();
                if (k === 'arrowleft' || k === 'a') this.keys.left = false;
                if (k === 'arrowright' || k === 'd') this.keys.right = false;
                if (k === ' ' || k === 'arrowup' || k === 'w') this.keys.fire = false;
            });

            // Mobile Virtual Buttons
            const bindVirtualBtn = (id, onStart, onEnd) => {
                const el = document.getElementById(id);
                if (!el) return;

                const startHandler = (e) => {
                    e.preventDefault();
                    this.sound.init();
                    onStart();
                };
                const endHandler = (e) => {
                    e.preventDefault();
                    onEnd();
                };

                el.addEventListener('touchstart', startHandler, { passive: false });
                el.addEventListener('touchend', endHandler, { passive: false });
                el.addEventListener('touchcancel', endHandler, { passive: false });
                el.addEventListener('mousedown', startHandler);
                el.addEventListener('mouseup', endHandler);
                el.addEventListener('mouseleave', endHandler);
            };

            bindVirtualBtn('btnLeft', () => { this.keys.left = true; }, () => { this.keys.left = false; });
            bindVirtualBtn('btnRight', () => { this.keys.right = true; }, () => { this.keys.right = false; });
            bindVirtualBtn('btnFire', () => {
                this.keys.fire = true;
                if (this.state === 'PLAYING') this.shoot();
            }, () => {
                this.keys.fire = false;
            });

            // Canvas Direct Drag & Touch Steering with Continuous Fire + Smooth Banking
            const updatePointerTarget = (clientX) => {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.width / (rect.width || this.width);
                const targetX = (clientX - rect.left) * scaleX - this.player.width / 2;
                this.pointerTargetX = Math.max(10, Math.min(this.width - this.player.width - 10, targetX));
            };

            const releasePointer = () => {
                this.isPointerDown = false;
                this.keys.pointerFire = false;
                this.pointerTargetX = null;
            };

            this.canvas.addEventListener('mousedown', (e) => {
                this.isPointerDown = true;
                this.keys.pointerFire = true;
                this.sound.init();
                updatePointerTarget(e.clientX);
                if (this.state === 'PLAYING') {
                    this.player.x = this.pointerTargetX;
                    this.shoot();
                }
            });
            window.addEventListener('mousemove', (e) => {
                if (this.isPointerDown) updatePointerTarget(e.clientX);
            });
            window.addEventListener('mouseup', releasePointer);

            this.canvas.addEventListener('touchstart', (e) => {
                if (e.touches.length > 0) {
                    this.isPointerDown = true;
                    this.keys.pointerFire = true;
                    this.sound.init();
                    updatePointerTarget(e.touches[0].clientX);
                    if (this.state === 'PLAYING') {
                        this.player.x = this.pointerTargetX;
                        this.shoot();
                    }
                }
            }, { passive: true });
            window.addEventListener('touchmove', (e) => {
                if (this.isPointerDown && e.touches.length > 0) {
                    updatePointerTarget(e.touches[0].clientX);
                }
            }, { passive: true });
            window.addEventListener('touchend', releasePointer);
            window.addEventListener('touchcancel', releasePointer);
        }

        clearPendingTimeouts() {
            if (this.bannerTimeout) {
                clearTimeout(this.bannerTimeout);
                this.bannerTimeout = null;
            }
            if (this.outcomeTimeout) {
                clearTimeout(this.outcomeTimeout);
                this.outcomeTimeout = null;
            }
            if (this.bossVictoryTimeout) {
                clearTimeout(this.bossVictoryTimeout);
                this.bossVictoryTimeout = null;
            }
            if (this.bossWaveTimeout) {
                clearTimeout(this.bossWaveTimeout);
                this.bossWaveTimeout = null;
            }
            if (this.waveClearTimeout) {
                clearTimeout(this.waveClearTimeout);
                this.waveClearTimeout = null;
            }
            this.outcomeRemainingMs = 0;
            this.outcomeType = null;
            this.bannerRemainingMs = 0;
            this.levelBanner?.classList.add('hidden');
        }

        start() {
            this.clearPendingTimeouts();
            this.sound.init();
            this.score = 0;
            this.wave = 1;
            this.endlessMode = false;
            this.lives = 3;
            this.kills = 0;
            this.waveCleared = false;
            this.keys = { left: false, right: false, fire: false, pointerFire: false };
            this.isPointerDown = false;
            this.pointerTargetX = null;

            if (this.hudScore) this.hudScore.textContent = '0';
            if (this.hudBest) this.hudBest.textContent = this.highScore;
            this.updateDifficultyHUD();
            this.updateLivesHUD();

            this.player.x = (this.width - this.player.width) / 2;
            this.player.lastX = this.player.x;
            this.player.tilt = 0;
            this.player.invulnerableTimer = 0;
            this.player.shieldActive = false;
            this.player.shieldTimer = 0;
            this.player.rapidFireTimer = 0;
            this.player.weaponType = 'normal';
            this.player.weaponTimer = 0;

            this.lasers = [];
            this.enemyLasers = [];
            this.powerups = [];
            this.particles = [];
            this.boss = null;
            this.updatePowerupHUD();

            this.screenMenu?.classList.add('hidden');
            this.screenPause?.classList.add('hidden');
            this.screenLevelComplete?.classList.add('hidden');
            this.screenGameOver?.classList.add('hidden');
            this.screenVictory?.classList.add('hidden');
            this.bossHealthContainer?.classList.add('hidden');

            this.setupWave(1);
        }

        continueEndless() {
            this.clearPendingTimeouts();
            this.endlessMode = true;
            this.screenVictory?.classList.add('hidden');
            this.setupWave(this.maxWaves + 1);
        }

        advanceFromLevelComplete() {
            if (this.state !== 'LEVEL_COMPLETE') return;
            this.screenLevelComplete?.classList.add('hidden');
            this.setupWave(this.wave + 1);
        }

        togglePause() {
            if (this.state === 'PLAYING' || this.state === 'LEVEL_TRANSITION') {
                this.pausedPreviousState = this.state;
                this.state = 'PAUSED';
                this.pausedAtMs = performance.now();

                if (this.bannerTimeout) {
                    clearTimeout(this.bannerTimeout);
                    this.bannerTimeout = null;
                    const elapsed = performance.now() - this.bannerStartTime;
                    this.bannerRemainingMs = Math.max(80, this.bannerRemainingMs - elapsed);
                }

                if (this.outcomeTimeout) {
                    clearTimeout(this.outcomeTimeout);
                    this.outcomeTimeout = null;
                    const elapsedOutcome = performance.now() - this.outcomeStartTime;
                    this.outcomeRemainingMs = Math.max(80, this.outcomeRemainingMs - elapsedOutcome);
                }

                this.screenPause?.classList.remove('hidden');
            } else if (this.state === 'PAUSED') {
                const now = performance.now();
                if (this.pausedAtMs > 0) {
                    const pauseDuration = Math.max(0, now - this.pausedAtMs);
                    if (this.nextAlienFireTime > 0) this.nextAlienFireTime += pauseDuration;
                    if (this.lastFireTime > 0) this.lastFireTime += pauseDuration;
                    if (this.boss) {
                        this.boss.nextAttackTime += pauseDuration;
                        this.boss.nextEscortTime += pauseDuration;
                    }
                    this.pausedAtMs = 0;
                }

                this.state = this.pausedPreviousState || 'PLAYING';
                this.screenPause?.classList.add('hidden');
                this.lastTime = now;

                if (this.state === 'LEVEL_TRANSITION' && this.bannerRemainingMs > 0) {
                    this.scheduleBannerFinish(this.bannerRemainingMs);
                }
                if (this.outcomeType && this.outcomeRemainingMs > 0) {
                    this.scheduleWaveOutcome(this.outcomeRemainingMs, this.outcomeType);
                }
            }
        }

        scheduleBannerFinish(delayMs) {
            if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
            this.bannerStartTime = performance.now();
            this.bannerRemainingMs = delayMs;
            this.bannerTimeout = setTimeout(() => {
                this.bannerTimeout = null;
                this.bannerRemainingMs = 0;
                this.levelBanner?.classList.add('hidden');
                if (this.state === 'LEVEL_TRANSITION') {
                    this.state = 'PLAYING';
                    this.lastTime = performance.now();
                }
            }, delayMs);
        }

        scheduleWaveOutcome(delayMs, type = 'level') {
            if (this.outcomeTimeout) clearTimeout(this.outcomeTimeout);
            this.outcomeStartTime = performance.now();
            this.outcomeRemainingMs = delayMs;
            this.outcomeType = type;
            this.outcomeTimeout = setTimeout(() => {
                this.outcomeTimeout = null;
                this.outcomeRemainingMs = 0;
                const action = this.outcomeType;
                this.outcomeType = null;
                if (this.state === 'PLAYING' || this.state === 'LEVEL_TRANSITION') {
                    if (action === 'victory') {
                        this.triggerVictory();
                    } else {
                        this.showLevelComplete();
                    }
                }
            }, delayMs);
        }

        updateLivesHUD() {
            if (this.hudLives) {
                this.hudLives.textContent = '❤️'.repeat(Math.max(0, this.lives));
            }
        }

        updatePowerupHUD() {
            if (!this.hudPowerups) return;
            this.hudPowerups.innerHTML = '';

            if (this.player.shieldActive) {
                const b = document.createElement('div');
                b.className = 'powerup-badge badge-shield';
                b.innerHTML = `🛡️ SHIELD (${Math.ceil(this.player.shieldTimer)}s)`;
                this.hudPowerups.appendChild(b);
            }
            if (this.player.rapidFireTimer > 0) {
                const b = document.createElement('div');
                b.className = 'powerup-badge badge-rapid';
                b.innerHTML = `⚡ RAPID (${Math.ceil(this.player.rapidFireTimer)}s)`;
                this.hudPowerups.appendChild(b);
            }
            if (this.player.weaponType === 'double') {
                const b = document.createElement('div');
                b.className = 'powerup-badge badge-double';
                b.innerHTML = `♊ DOUBLE (${Math.ceil(this.player.weaponTimer)}s)`;
                this.hudPowerups.appendChild(b);
            } else if (this.player.weaponType === 'spread') {
                const b = document.createElement('div');
                b.className = 'powerup-badge badge-spread';
                b.innerHTML = `🔱 SPREAD (${Math.ceil(this.player.weaponTimer)}s)`;
                this.hudPowerups.appendChild(b);
            }
        }

        triggerScreenShake(duration = 0.25, intensity = 8) {
            this.screenShakeTime = duration;
            this.screenShakeIntensity = intensity;
        }

        // --- 20-Level+ Campaign & AI Composition ---
        setupWave(waveNum) {
            this.clearPendingTimeouts();
            this.wave = waveNum;
            this.waveCleared = false;
            this.updateDifficultyHUD();

            this.lasers = [];
            this.enemyLasers = [];
            this.aliens = [];
            this.boss = null;
            this.bossHealthContainer?.classList.add('hidden');

            const diffInfo = this.getDifficultyInfo(waveNum);

            // Level Transition Banner
            this.state = 'LEVEL_TRANSITION';
            if (this.levelBanner && this.bannerTitle && this.bannerSub) {
                if (waveNum === 5) {
                    this.bannerSub.textContent = 'WARNING: CAPITAL DESTROYER DETECTED';
                    this.bannerTitle.textContent = 'LEVEL 5: ORBITAL DESTROYER';
                    this.bannerSub.style.color = '#ff007f';
                } else if (waveNum === 10) {
                    this.bannerSub.textContent = 'SECTOR 10 BOSS: FLEET FLAGSHIP INVASION';
                    this.bannerTitle.textContent = 'LEVEL 10: MOTHERSHIP OVERLORD';
                    this.bannerSub.style.color = '#ffea00';
                } else if (waveNum === 15) {
                    this.bannerSub.textContent = 'HARD TIER BOSS: HEAVY ASSAULT CRUISER';
                    this.bannerTitle.textContent = 'LEVEL 15: CHRONO TITAN';
                    this.bannerSub.style.color = '#ff8800';
                } else if (waveNum === 20) {
                    this.bannerSub.textContent = 'FINAL CAMPAIGN BOSS: IMPERIAL DREADNOUGHT';
                    this.bannerTitle.textContent = 'LEVEL 20: GALACTIC EMPEROR';
                    this.bannerSub.style.color = '#ff007f';
                } else if (waveNum > 20 && waveNum % 5 === 0) {
                    this.bannerSub.textContent = `OVERDRIVE BOSS // SECTOR ${waveNum}`;
                    this.bannerTitle.textContent = `LEVEL ${waveNum}: OMEGA LEVIATHAN`;
                    this.bannerSub.style.color = '#c084fc';
                } else {
                    this.bannerSub.textContent = `${diffInfo.label} // SECTOR ${waveNum}`;
                    this.bannerTitle.textContent = `LEVEL ${waveNum}`;
                    this.bannerSub.style.color = diffInfo.hex;
                }

                this.levelBanner.classList.remove('hidden');
                this.scheduleBannerFinish(1800);
            } else {
                this.state = 'PLAYING';
                this.lastTime = performance.now();
            }

            // Boss Battles at Levels 5, 10, 15, 20 (and every 5 levels beyond 20)
            if (waveNum % 5 === 0) {
                if (waveNum === 5) {
                    this.spawnBoss('ORBITAL DESTROYER', 70, 1);
                } else if (waveNum === 10) {
                    this.spawnBoss('MOTHERSHIP OVERLORD', 135, 2);
                } else if (waveNum === 15) {
                    this.spawnBoss('CHRONO TITAN', 190, 3);
                } else if (waveNum === 20) {
                    this.spawnBoss('GALACTIC EMPEROR', 260, 4);
                } else {
                    const endlessTier = 4 + Math.floor((waveNum - 20) / 5);
                    this.spawnBoss(`OMEGA LEVIATHAN MK-${endlessTier}`, 260 + (waveNum - 20) * 18, endlessTier);
                }
                return;
            }

            // Responsive Grid Dimensions (safe for short landscape screens too)
            const availableVertical = Math.max(120, this.player.y - 125);
            const maxRowsFit = Math.max(2, Math.floor(availableVertical / 38));

            let desiredRows = 3;
            if (waveNum >= 3) desiredRows = 4;
            if (waveNum >= 8) desiredRows = 5;
            if (waveNum >= 14) desiredRows = 6;
            const rows = Math.min(desiredRows, maxRowsFit);

            const cols = Math.min(10, Math.max(5, Math.floor((this.width - 40) / 52)));
            const alienW = 34;
            const alienH = this.height <= 460 ? 22 : 26;
            const gapX = Math.max(10, Math.min(16, Math.floor((this.width - cols * alienW - 40) / Math.max(1, cols - 1))));
            const gapY = this.height <= 460 ? 10 : 14;
            const totalW = cols * alienW + (cols - 1) * gapX;
            const startX = Math.max(16, (this.width - totalW) / 2);
            const startY = this.height <= 460 ? 58 : 82;

            this.alienDir = 1;
            // Balanced speed scaling across 20+ levels
            this.alienSpeed = Math.min(145, 32 + waveNum * 4.4);
            this.alienDropDist = this.height <= 460 ? 10 : 15;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const aiProfile = this.pickAlienAIProfile(waveNum, r, rows, c, cols);
                    const bx = startX + c * (alienW + gapX);
                    const by = startY + r * (alienH + gapY);

                    this.aliens.push({
                        x: bx,
                        y: by,
                        baseOffsetX: 0,
                        w: alienW,
                        h: alienH,
                        row: r,
                        col: c,
                        type: aiProfile.type,
                        color: aiProfile.color,
                        pts: aiProfile.pts,
                        hp: aiProfile.hp,
                        maxHp: aiProfile.hp,
                        flashTimer: 0,
                        evadeCooldown: 0,
                        evadeTimer: 0,
                        evadeVx: 0,
                        phaseSeed: (r * 0.7 + c * 1.1)
                    });
                }
            }
        }

        pickAlienAIProfile(waveNum, r, totalRows, c, totalCols) {
            const extraHp = waveNum >= 16 ? 1 : 0;

            // Levels 1-3 (Beginner): Mostly Standard, introducing Evasive on edges in L2-3 and Hunter in L3
            if (waveNum <= 3) {
                if (waveNum >= 3 && r === 0 && (c === 1 || c === totalCols - 2)) {
                    return { type: 'hunter', color: '#ff8800', pts: 30, hp: 1 };
                }
                if (waveNum >= 2 && r === 0 && (c === 0 || c === totalCols - 1)) {
                    return { type: 'evasive', color: '#00f2fe', pts: 25, hp: 1 };
                }
                return { type: 'standard', color: r === 0 ? '#00f2fe' : '#00ff88', pts: r === 0 ? 20 : 10, hp: 1 };
            }

            // Levels 4-6 (Easy to Medium): Introduce Bombers & more Hunters/Evasives
            if (waveNum <= 6) {
                if (r === 0 && c % 3 === 1) return { type: 'bomber', color: '#ffea00', pts: 40, hp: 2 };
                if (r === 0) return { type: 'hunter', color: '#ff8800', pts: 30, hp: 1 };
                if (r === 1 && (c === 0 || c === totalCols - 1 || c % 4 === 2)) {
                    return { type: 'evasive', color: '#00f2fe', pts: 25, hp: 1 };
                }
                return { type: 'standard', color: '#00ff88', pts: 15, hp: 1 };
            }

            // Levels 7-10 (Medium): Introduce Elite units on top row + coordinated mixed squadrons
            if (waveNum <= 10) {
                if (r === 0 && c % 2 === 0) return { type: 'elite', color: '#c084fc', pts: 65, hp: 2 };
                if (r === 0) return { type: 'bomber', color: '#ffea00', pts: 45, hp: 2 };
                if (r === 1 && c % 2 === 1) return { type: 'hunter', color: '#ff8800', pts: 35, hp: 1 + (waveNum >= 9 ? 1 : 0) };
                if (r === 2 && c % 3 === 0) return { type: 'evasive', color: '#00f2fe', pts: 30, hp: 1 };
                return { type: 'standard', color: '#00ff88', pts: 15, hp: 1 };
            }

            // Levels 11-15 (Hard): Dense Elites, tracking Hunters, Bombers & reactive Evasives
            if (waveNum <= 15) {
                if (r === 0) return { type: 'elite', color: '#c084fc', pts: 80, hp: 3 };
                if (r === 1 && c % 2 === 0) return { type: 'bomber', color: '#ffea00', pts: 55, hp: 2 };
                if (r === 1 || (r === 2 && c % 2 === 0)) return { type: 'hunter', color: '#ff8800', pts: 40, hp: 2 };
                if (r === 2 || (r === 3 && c % 3 === 1)) return { type: 'evasive', color: '#00f2fe', pts: 35, hp: 1 };
                return { type: 'standard', color: '#00ff88', pts: 20, hp: 1 };
            }

            // Levels 16-20+ (Expert & Endless Overdrive)
            if (r === 0) return { type: 'elite', color: '#c084fc', pts: 100, hp: 3 + extraHp + Math.floor(Math.max(0, waveNum - 20) / 4) };
            if (r === 1 && c % 2 === 0) return { type: 'elite', color: '#c084fc', pts: 90, hp: 2 + extraHp };
            if (r === 1 || (r === 2 && c % 3 === 0)) return { type: 'bomber', color: '#ffea00', pts: 60, hp: 2 + extraHp };
            if (r === 2 || (r === 3 && c % 2 === 1)) return { type: 'hunter', color: '#ff8800', pts: 50, hp: 2 };
            if (r === totalRows - 1 && c % 2 === 0) return { type: 'evasive', color: '#00f2fe', pts: 40, hp: 1 + (waveNum >= 19 ? 1 : 0) };
            return { type: 'standard', color: '#00ff88', pts: 25, hp: 1 + (waveNum >= 18 ? 1 : 0) };
        }

        spawnBoss(name, hp, tier = 1) {
            const bossWidth = Math.min(230, this.width * 0.56);
            const bossHeight = this.height <= 460 ? 58 : (tier >= 3 ? 96 : 82);
            const targetY = this.height <= 460 ? 54 : 84;

            this.boss = {
                name: name,
                tier: tier, // 1: L5, 2: L10, 3: L15, 4: L20, 5+: Endless
                x: (this.width - bossWidth) / 2,
                y: -bossHeight - 20,
                targetY: targetY,
                baseTargetY: targetY,
                w: bossWidth,
                h: bossHeight,
                hp: hp,
                maxHp: hp,
                dir: 1,
                speed: 54 + tier * 14,
                phase: 1,
                flashTimer: 0,
                patternTime: 0,
                nextAttackTime: performance.now() + 1400,
                nextEscortTime: performance.now() + 5500
            };

            if (this.bossName) this.bossName.textContent = name;
            if (this.bossBarFill) this.bossBarFill.style.width = '100%';
            this.bossHealthContainer?.classList.remove('hidden');
        }

        onPlayerShoot() {
            // Notify evasive aliens within horizontal threat lane to dodge fairly
            const playerCenter = this.player.x + this.player.width / 2;
            for (const a of this.aliens) {
                if (a.type === 'evasive' && a.evadeCooldown <= 0) {
                    const alienCenter = a.x + a.w / 2;
                    if (Math.abs(alienCenter - playerCenter) < 95) {
                        const dodgeSpeed = Math.min(240, 125 + this.wave * 5);
                        // Unpredictable direction biased away from player laser line
                        const awayDir = alienCenter >= playerCenter ? 1 : -1;
                        const dir = Math.random() < 0.78 ? awayDir : -awayDir;
                        a.evadeVx = dir * dodgeSpeed;
                        a.evadeTimer = 0.28;
                        a.evadeCooldown = Math.max(0.95, 1.75 - this.wave * 0.035);
                    }
                }
            }
        }

        shoot() {
            const now = performance.now();
            const cooldown = this.player.rapidFireTimer > 0 ? 110 : 200;
            if (now - this.lastFireTime < cooldown) return;
            this.lastFireTime = now;

            const px = this.player.x;
            const py = this.player.y;
            const pw = this.player.width;

            if (this.player.weaponType === 'spread') {
                this.lasers.push({ x: px + pw / 2, y: py, vx: 0, vy: -780, color: '#ff007f' });
                this.lasers.push({ x: px + 8, y: py + 4, vx: -160, vy: -760, color: '#ffea00' });
                this.lasers.push({ x: px + pw - 8, y: py + 4, vx: 160, vy: -760, color: '#ffea00' });
            } else if (this.player.weaponType === 'double') {
                this.lasers.push({ x: px + 6, y: py, vx: 0, vy: -800, color: '#00f2fe' });
                this.lasers.push({ x: px + pw - 6, y: py, vx: 0, vy: -800, color: '#00f2fe' });
            } else {
                this.lasers.push({ x: px + 10, y: py, vx: 0, vy: -750, color: '#00f2fe' });
                this.lasers.push({ x: px + pw - 10, y: py, vx: 0, vy: -750, color: '#00f2fe' });
            }

            this.onPlayerShoot();
            this.sound.playLaser();
        }

        dropPowerup(x, y) {
            if (Math.random() > 0.16) return;

            const rand = Math.random();
            let type = 'rapid';
            let icon = '⚡';
            let color = '#ffea00';

            if (rand < 0.28) {
                type = 'rapid';
                icon = '⚡';
                color = '#ffea00';
            } else if (rand < 0.54) {
                type = 'double';
                icon = '♊';
                color = '#00f2fe';
            } else if (rand < 0.74) {
                type = 'spread';
                icon = '🔱';
                color = '#ff007f';
            } else if (rand < 0.90) {
                type = 'shield';
                icon = '🛡️';
                color = '#00ff88';
            } else {
                type = 'life';
                icon = '❤️';
                color = '#ff3366';
            }

            this.powerups.push({
                x: Math.max(12, Math.min(this.width - 36, x - 12)),
                y: y,
                w: 24,
                h: 24,
                vy: 95,
                type: type,
                icon: icon,
                color: color,
                bob: 0
            });
        }

        applyPowerup(type) {
            this.sound.playPowerup();
            this.triggerScreenShake(0.12, 4);

            if (type === 'rapid') {
                this.player.rapidFireTimer = 10;
            } else if (type === 'double') {
                this.player.weaponType = 'double';
                this.player.weaponTimer = 12;
            } else if (type === 'spread') {
                this.player.weaponType = 'spread';
                this.player.weaponTimer = 12;
            } else if (type === 'shield') {
                this.player.shieldActive = true;
                this.player.shieldTimer = 10;
            } else if (type === 'life') {
                if (this.lives < 5) {
                    this.lives++;
                    this.updateLivesHUD();
                } else {
                    // Score bonus if already at max lives
                    this.score += 250;
                    if (this.hudScore) this.hudScore.textContent = this.score;
                }
            }

            this.updatePowerupHUD();
        }

        spawnExplosion(x, y, color, count = 20) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 210 + 35;
                this.particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: color,
                    alpha: 1,
                    size: Math.random() * 3.8 + 1.5,
                    decay: Math.random() * 1.6 + 1.1 // alpha decay per second
                });
            }
        }

        hitPlayer() {
            if (this.player.invulnerableTimer > 0) return;

            if (this.player.shieldActive) {
                this.player.shieldActive = false;
                this.player.shieldTimer = 0;
                this.sound.playShieldBreak();
                this.triggerScreenShake(0.2, 7);
                this.spawnExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#00ff88', 25);
                this.updatePowerupHUD();
                this.player.invulnerableTimer = 1.0;
                return;
            }

            this.lives--;
            this.updateLivesHUD();
            this.triggerScreenShake(0.35, 12);
            this.spawnExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ff007f', 35);
            this.sound.playExplosion();

            if (this.lives <= 0) {
                this.gameOver('SHIP DESTROYED // SECTOR LOST');
            } else {
                this.player.invulnerableTimer = 2.2;
            }
        }

        checkWaveCleared() {
            if (this.waveCleared || this.lives <= 0) return;
            if (this.aliens.length === 0 && !this.boss) {
                this.waveCleared = true;
                this.sound.playWaveClear();
                this.scheduleWaveOutcome(700, 'level');
            }
        }

        showLevelComplete() {
            if (this.wave === this.maxWaves && !this.endlessMode) {
                this.triggerVictory();
                return;
            }

            this.clearPendingTimeouts();
            this.state = 'LEVEL_COMPLETE';

            const diffInfo = this.getDifficultyInfo(this.wave);
            const rewardBonus = 150 + this.wave * 75 + (this.wave % 5 === 0 ? 500 : 0);
            this.score += rewardBonus;

            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('space_invaders_hs', this.highScore.toString());
                if (this.hudBest) this.hudBest.textContent = this.highScore;
            }
            if (this.hudScore) this.hudScore.textContent = this.score;

            const nextWave = this.wave + 1;
            const nextIsBoss = nextWave % 5 === 0;

            if (this.lcBadge) {
                this.lcBadge.textContent = this.wave % 5 === 0 ? 'BOSS DEFEATED 🏆' : 'SECTOR CLEARED ✨';
            }
            if (this.lcTitle) this.lcTitle.textContent = `LEVEL ${this.wave} COMPLETE`;
            if (this.lcSubtitle) {
                this.lcSubtitle.textContent = nextIsBoss
                    ? `Warning: Boss encounter detected ahead in Sector ${nextWave}!`
                    : `Enemy squadron neutralized! Ready for Sector ${nextWave}.`;
            }
            if (this.lcBonus) this.lcBonus.textContent = `+${rewardBonus}`;
            if (this.lcDifficulty) {
                this.lcDifficulty.textContent = diffInfo.label;
                this.lcDifficulty.className = `stat-val ${diffInfo.colorClass}`;
            }
            if (this.lcScore) this.lcScore.textContent = this.score;
            if (this.lcNextSector) {
                this.lcNextSector.textContent = nextIsBoss ? `LVL ${nextWave} (BOSS)` : `Level ${nextWave}`;
            }

            this.screenLevelComplete?.classList.remove('hidden');
        }

        gameOver(reason = 'MISSION FAILED') {
            this.clearPendingTimeouts();
            this.state = 'GAMEOVER';
            this.sound.playGameOver();

            const isNewRecord = this.score > this.highScore;
            if (isNewRecord) {
                this.highScore = this.score;
                localStorage.setItem('space_invaders_hs', this.highScore.toString());
                if (this.hudBest) this.hudBest.textContent = this.highScore;
            }

            if (this.goTitle) this.goTitle.textContent = reason;
            if (this.goScore) this.goScore.textContent = this.score;
            if (this.goWave) this.goWave.textContent = `Level ${this.wave}`;
            if (this.goKills) this.goKills.textContent = this.kills;
            if (this.goBest) this.goBest.textContent = this.highScore;

            this.bossHealthContainer?.classList.add('hidden');
            this.screenLevelComplete?.classList.add('hidden');
            this.screenGameOver?.classList.remove('hidden');
        }

        triggerVictory() {
            this.clearPendingTimeouts();
            this.state = 'VICTORY';
            this.sound.playVictory();
            this.triggerScreenShake(0.6, 16);

            const campaignBonus = 2500 + this.lives * 300;
            this.score += campaignBonus;
            if (this.hudScore) this.hudScore.textContent = this.score;

            const isNewRecord = this.score > this.highScore;
            if (isNewRecord) {
                this.highScore = this.score;
                localStorage.setItem('space_invaders_hs', this.highScore.toString());
                if (this.hudBest) this.hudBest.textContent = this.highScore;
            }

            if (this.vicScore) this.vicScore.textContent = this.score;
            if (this.vicLives) this.vicLives.textContent = `${this.lives} Hearts`;
            if (this.vicRecordStatus) {
                this.vicRecordStatus.textContent = isNewRecord ? '🔥 NEW HIGH RECORD!' : 'NO';
                this.vicRecordStatus.style.color = isNewRecord ? '#00ff88' : '#cbd5e1';
            }

            this.bossHealthContainer?.classList.add('hidden');
            this.screenLevelComplete?.classList.add('hidden');
            this.screenVictory?.classList.remove('hidden');
        }

        // --- Starfield Delta Update (frozen when PAUSED) ---
        updateStars(dt) {
            for (const s of this.stars) {
                s.y += s.speed * dt;
                if (s.y > this.height) {
                    s.y = 0;
                    s.x = Math.random() * this.width;
                }
            }
        }

        // --- Alien AI Firing Dispatcher ---
        fireAlienProjectile(shooter) {
            const playerCenter = this.player.x + this.player.width / 2;
            const sx = shooter.x + shooter.w / 2;
            const sy = shooter.y + shooter.h;
            const baseSpeed = Math.min(440, 240 + this.wave * 9.5);

            // Global projectile cap to prevent unavoidable bullet walls
            const maxEnemyBullets = Math.min(15, 4 + Math.floor(this.wave * 0.6));
            if (this.enemyLasers.length >= maxEnemyBullets) return;

            if (shooter.type === 'hunter') {
                // Aimed tracking shot whose accuracy tightens with level
                const dx = playerCenter - sx;
                const dy = Math.max(80, this.player.y - sy);
                const dist = Math.hypot(dx, dy);
                const accuracy = Math.min(0.95, 0.35 + this.wave * 0.03);
                const speed = baseSpeed * 1.12;
                const aimVx = (dx / dist) * speed * accuracy;
                const aimVy = Math.max(180, (dy / dist) * speed);
                this.enemyLasers.push({ x: sx, y: sy, vx: aimVx, vy: aimVy, color: '#ff8800', kind: 'bolt' });
            } else if (shooter.type === 'bomber') {
                // Heavy plasma bomb aimed toward player's zone; Level 7+ drops twin spread bombs
                const drift = Math.max(-90, Math.min(90, (playerCenter - sx) * 0.35));
                if (this.wave >= 7 && this.enemyLasers.length + 2 <= maxEnemyBullets) {
                    this.enemyLasers.push({ x: sx - 8, y: sy, vx: drift - 45, vy: baseSpeed * 0.9, color: '#ffea00', kind: 'bomb' });
                    this.enemyLasers.push({ x: sx + 8, y: sy, vx: drift + 45, vy: baseSpeed * 0.9, color: '#ffea00', kind: 'bomb' });
                } else {
                    this.enemyLasers.push({ x: sx, y: sy, vx: drift, vy: baseSpeed * 0.95, color: '#ffea00', kind: 'bomb' });
                }
            } else if (shooter.type === 'elite') {
                // Predictive twin or 3-way intelligent burst
                const dx = playerCenter - sx;
                const dy = Math.max(90, this.player.y - sy);
                const dist = Math.hypot(dx, dy);
                const aimVx = (dx / dist) * baseSpeed * 0.85;
                if (this.wave >= 12 && this.enemyLasers.length + 3 <= maxEnemyBullets) {
                    [-75, 0, 75].forEach(spread => {
                        this.enemyLasers.push({ x: sx, y: sy, vx: aimVx * 0.6 + spread, vy: baseSpeed * 1.05, color: '#c084fc', kind: 'bolt' });
                    });
                } else {
                    this.enemyLasers.push({ x: shooter.x + 8, y: sy, vx: aimVx - 28, vy: baseSpeed * 1.05, color: '#c084fc', kind: 'bolt' });
                    this.enemyLasers.push({ x: shooter.x + shooter.w - 8, y: sy, vx: aimVx + 28, vy: baseSpeed * 1.05, color: '#c084fc', kind: 'bolt' });
                }
            } else if (shooter.type === 'evasive') {
                // Quick side-angled laser
                this.enemyLasers.push({
                    x: sx,
                    y: sy,
                    vx: (Math.random() < 0.5 ? -1 : 1) * (45 + this.wave * 2),
                    vy: baseSpeed * 1.08,
                    color: '#00f2fe',
                    kind: 'bolt'
                });
            } else {
                // Standard shot
                this.enemyLasers.push({
                    x: sx,
                    y: sy,
                    vx: (Math.random() - 0.5) * 32,
                    vy: baseSpeed,
                    color: shooter.color,
                    kind: 'bolt'
                });
            }
            this.sound.playAlienLaser();
        }

        // --- Frame Update ---
        update(dt) {
            this.simTime += dt;

            if (this.screenShakeTime > 0) {
                this.screenShakeTime -= dt;
            }

            // Power-up Timers
            if (this.player.shieldActive) {
                this.player.shieldTimer -= dt;
                if (this.player.shieldTimer <= 0) {
                    this.player.shieldActive = false;
                    this.updatePowerupHUD();
                }
            }
            if (this.player.rapidFireTimer > 0) {
                this.player.rapidFireTimer -= dt;
                if (this.player.rapidFireTimer <= 0) {
                    this.updatePowerupHUD();
                }
            }
            if (this.player.weaponTimer > 0) {
                this.player.weaponTimer -= dt;
                if (this.player.weaponTimer <= 0) {
                    this.player.weaponType = 'normal';
                    this.updatePowerupHUD();
                }
            }
            if (this.player.invulnerableTimer > 0) {
                this.player.invulnerableTimer -= dt;
            }

            // Continuous auto-fire when Space / mobile button / pointer drag is held
            if (this.keys.fire || this.keys.pointerFire) {
                this.shoot();
            }

            // Player Steering & Smooth Banking/Tilt
            const prevX = this.player.x;
            if (this.isPointerDown && this.pointerTargetX !== null) {
                const diff = this.pointerTargetX - this.player.x;
                const step = diff * Math.min(1, dt * 22);
                this.player.x += step;
                this.player.x = Math.max(10, Math.min(this.width - this.player.width - 10, this.player.x));
                const vx = (this.player.x - prevX) / Math.max(0.001, dt);
                const targetTilt = Math.max(-0.22, Math.min(0.22, vx / 1400));
                this.player.tilt += (targetTilt - this.player.tilt) * Math.min(1, dt * 16);
            } else {
                let moveDir = 0;
                if (this.keys.left) moveDir -= 1;
                if (this.keys.right) moveDir += 1;

                this.player.x += moveDir * this.player.speed * dt;
                this.player.x = Math.max(10, Math.min(this.width - this.player.width - 10, this.player.x));
                const targetTilt = moveDir * 0.18;
                this.player.tilt += (targetTilt - this.player.tilt) * Math.min(1, dt * 16);
            }

            // Update Player Lasers
            for (let i = this.lasers.length - 1; i >= 0; i--) {
                const l = this.lasers[i];
                l.x += (l.vx || 0) * dt;
                l.y += (l.vy || -750) * dt;
                if (l.y < -30 || l.x < -30 || l.x > this.width + 30) {
                    this.lasers.splice(i, 1);
                }
            }

            // Update Enemy Lasers & Bombs
            for (let i = this.enemyLasers.length - 1; i >= 0; i--) {
                const el = this.enemyLasers[i];
                if (el.kind === 'bomb') {
                    el.vy += 45 * dt;
                }
                el.x += (el.vx || 0) * dt;
                el.y += el.vy * dt;

                const hitRadius = el.kind === 'bomb' ? 6 : 4;
                if (
                    el.x + hitRadius >= this.player.x &&
                    el.x - hitRadius <= this.player.x + this.player.width &&
                    el.y + hitRadius >= this.player.y &&
                    el.y - hitRadius <= this.player.y + this.player.height
                ) {
                    this.enemyLasers.splice(i, 1);
                    this.hitPlayer();
                    continue;
                }

                if (el.y > this.height + 30 || el.x < -30 || el.x > this.width + 30) {
                    this.enemyLasers.splice(i, 1);
                }
            }

            // Update Falling Power-up Orbs
            for (let i = this.powerups.length - 1; i >= 0; i--) {
                const p = this.powerups[i];
                p.y += p.vy * dt;
                p.bob += dt * 3;

                if (
                    p.x + p.w >= this.player.x &&
                    p.x <= this.player.x + this.player.width &&
                    p.y + p.h >= this.player.y &&
                    p.y <= this.player.y + this.player.height
                ) {
                    this.applyPowerup(p.type);
                    this.spawnExplosion(p.x + p.w / 2, p.y + p.h / 2, p.color, 14);
                    this.powerups.splice(i, 1);
                    continue;
                }

                if (p.y > this.height + 30) {
                    this.powerups.splice(i, 1);
                }
            }

            // Boss AI & Battle Logic (Levels 5, 10, 15, 20 & Endless 25+)
            if (this.boss) {
                this.updateBoss(dt);
            }

            // Alien Grid + Adaptive Per-Type AI
            if (this.aliens.length > 0) {
                const playerCenter = this.player.x + this.player.width / 2;
                let hitEdge = false;

                for (const a of this.aliens) {
                    // Base horizontal formation march
                    a.x += this.alienDir * this.alienSpeed * dt;

                    // Per-type intelligent kinematics
                    if (a.type === 'hunter') {
                        // Track player's horizontal position smoothly
                        const trackGain = Math.min(95, 28 + this.wave * 3.5);
                        const diff = playerCenter - (a.x + a.w / 2);
                        const nudge = Math.max(-1, Math.min(1, diff / 80)) * trackGain * dt;
                        a.x += nudge;
                    } else if (a.type === 'evasive') {
                        if (a.evadeCooldown > 0) a.evadeCooldown -= dt;
                        if (a.evadeTimer > 0) {
                            a.evadeTimer -= dt;
                            a.x += a.evadeVx * dt;
                        }
                    } else if (a.type === 'elite') {
                        // Fast lateral sine weave
                        const weave = Math.cos(this.simTime * 3.2 + a.phaseSeed) * (34 + this.wave * 1.5) * dt;
                        a.x += weave;
                    }

                    // Keep evasive/hunter/elite units inside safe horizontal margin
                    if (a.x < 12) {
                        a.x = 12;
                        if (this.alienDir < 0) hitEdge = true;
                    } else if (a.x + a.w > this.width - 12) {
                        a.x = this.width - 12 - a.w;
                        if (this.alienDir > 0) hitEdge = true;
                    }

                    if (a.flashTimer > 0) a.flashTimer -= dt;
                }

                if (hitEdge) {
                    this.alienDir *= -1;
                    for (const a of this.aliens) {
                        if (this.alienDir > 0 && a.x < 12) a.x = 12;
                        if (this.alienDir < 0 && a.x + a.w > this.width - 12) a.x = this.width - 12 - a.w;

                        a.y += this.alienDropDist;

                        if (a.y + a.h >= this.player.y) {
                            this.gameOver('INVASION BREACHED SURFACE');
                            return;
                        }
                    }
                }

                // Intelligent Alien Firing Selection
                const now = performance.now();
                if (now > this.nextAlienFireTime) {
                    const fireInterval = Math.max(300, 1380 - this.wave * 42 - Math.max(0, 35 - this.aliens.length) * 10);
                    this.nextAlienFireTime = now + fireInterval;

                    // Prioritize Hunters/Bombers/Elites more as wave increases
                    const priorityPool = this.aliens.filter(a => a.type !== 'standard');
                    const usePriority = priorityPool.length > 0 && Math.random() < Math.min(0.8, 0.35 + this.wave * 0.025);
                    const pool = usePriority ? priorityPool : this.aliens;
                    const shooter = pool[Math.floor(Math.random() * pool.length)];
                    if (shooter) {
                        this.fireAlienProjectile(shooter);
                    }
                }

                // Player Lasers vs Aliens
                for (let li = this.lasers.length - 1; li >= 0; li--) {
                    const l = this.lasers[li];
                    for (let ai = this.aliens.length - 1; ai >= 0; ai--) {
                        const a = this.aliens[ai];
                        if (
                            l.x + 3 >= a.x &&
                            l.x - 3 <= a.x + a.w &&
                            l.y <= a.y + a.h &&
                            l.y + 20 >= a.y
                        ) {
                            this.lasers.splice(li, 1);
                            a.hp--;
                            a.flashTimer = 0.08;

                            if (a.hp <= 0) {
                                this.score += a.pts;
                                this.kills++;
                                if (this.hudScore) this.hudScore.textContent = this.score;

                                this.spawnExplosion(a.x + a.w / 2, a.y + a.h / 2, a.color, 16);
                                this.sound.playExplosion();
                                this.dropPowerup(a.x + a.w / 2, a.y + a.h / 2);
                                this.aliens.splice(ai, 1);

                                this.alienSpeed = Math.min(185, this.alienSpeed + 1.5);
                                this.checkWaveCleared();
                            } else {
                                this.sound.playBossHit();
                                this.spawnExplosion(l.x, l.y, a.color, 6);
                            }
                            break;
                        }
                    }
                }

                // Physical Alien vs Player Collision (also checks wave clear!)
                for (let ai = this.aliens.length - 1; ai >= 0; ai--) {
                    const a = this.aliens[ai];
                    if (
                        a.x < this.player.x + this.player.width &&
                        a.x + a.w > this.player.x &&
                        a.y + a.h > this.player.y &&
                        a.y < this.player.y + this.player.height
                    ) {
                        this.aliens.splice(ai, 1);
                        this.spawnExplosion(a.x + a.w / 2, a.y + a.h / 2, a.color, 24);
                        this.hitPlayer();
                        if (this.lives > 0) {
                            this.checkWaveCleared();
                        }
                        break;
                    }
                }
            }

            // Update Particle Bursts
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.alpha -= (p.decay || 1.5) * dt;

                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }

        updateBoss(dt) {
            const boss = this.boss;
            if (!boss) return;

            boss.patternTime += dt;

            // Entrance glide
            if (boss.y < boss.targetY) {
                boss.y += 140 * dt;
                if (boss.y >= boss.targetY) {
                    boss.y = boss.targetY;
                }
            } else {
                // Tier-specific unique movement patterns
                boss.x += boss.dir * boss.speed * dt;
                if (boss.tier >= 2) {
                    const hoverAmp = boss.tier >= 4 ? 22 : 12;
                    boss.y = boss.baseTargetY + Math.sin(boss.patternTime * (1.8 + boss.tier * 0.2)) * hoverAmp;
                }
                if (boss.x < 15) {
                    boss.x = 15;
                    boss.dir = 1;
                } else if (boss.x + boss.w > this.width - 15) {
                    boss.x = this.width - 15 - boss.w;
                    boss.dir = -1;
                }
            }

            if (boss.flashTimer > 0) boss.flashTimer -= dt;

            const hpRatio = boss.hp / boss.maxHp;
            if (hpRatio < 0.35 && boss.phase !== 3) {
                boss.phase = 3;
                boss.speed += 28;
                this.triggerScreenShake(0.3, 8);
            } else if (hpRatio < 0.65 && boss.phase === 1) {
                boss.phase = 2;
                boss.speed += 16;
                this.triggerScreenShake(0.2, 6);
            }

            // Boss Attack Patterns
            const now = performance.now();
            if (boss.y >= boss.baseTargetY - 2 && now > boss.nextAttackTime) {
                const bx = boss.x + boss.w / 2;
                const by = boss.y + boss.h;
                const playerCenter = this.player.x + this.player.width / 2;
                const aimDx = playerCenter - bx;
                const aimDy = Math.max(100, this.player.y - by);
                const aimDist = Math.hypot(aimDx, aimDy);
                const aimVx = (aimDx / aimDist) * 320;

                if (boss.tier === 1) {
                    boss.nextAttackTime = now + (boss.phase >= 2 ? 950 : 1300);
                    this.enemyLasers.push({ x: bx, y: by, vx: 0, vy: 300, color: '#ffea00', kind: 'bolt' });
                    this.enemyLasers.push({ x: bx - 28, y: by, vx: -115, vy: 285, color: '#ff007f', kind: 'bolt' });
                    this.enemyLasers.push({ x: bx + 28, y: by, vx: 115, vy: 285, color: '#ff007f', kind: 'bolt' });
                } else if (boss.tier === 2) {
                    boss.nextAttackTime = now + (boss.phase === 3 ? 780 : 1050);
                    if (boss.phase === 3) {
                        [-170, -85, 0, 85, 170].forEach(vx => {
                            this.enemyLasers.push({ x: bx, y: by, vx: vx, vy: 310, color: '#ff007f', kind: 'bolt' });
                        });
                    } else {
                        this.enemyLasers.push({ x: boss.x + 20, y: by, vx: -40, vy: 300, color: '#00f2fe', kind: 'bolt' });
                        this.enemyLasers.push({ x: boss.x + boss.w - 20, y: by, vx: 40, vy: 300, color: '#00f2fe', kind: 'bolt' });
                        this.enemyLasers.push({ x: bx, y: by, vx: aimVx * 0.65, vy: 325, color: '#ffea00', kind: 'bomb' });
                    }
                } else if (boss.tier === 3) {
                    // Chrono Titan: sweeping plasma arcs + aimed hunter volley
                    boss.nextAttackTime = now + (boss.phase === 3 ? 700 : 950);
                    const sweep = Math.sin(boss.patternTime * 2.5) * 140;
                    [-130, 0, 130].forEach(offset => {
                        this.enemyLasers.push({ x: bx, y: by, vx: sweep + offset * 0.5, vy: 320, color: '#ff8800', kind: 'bolt' });
                    });
                    if (boss.phase >= 2) {
                        this.enemyLasers.push({ x: bx, y: by, vx: aimVx, vy: 340, color: '#ff007f', kind: 'bomb' });
                    }
                } else {
                    // Level 20 Galactic Emperor & Endless Omega Bosses
                    boss.nextAttackTime = now + (boss.phase === 3 ? 620 : 880);
                    if (boss.phase === 3) {
                        [-200, -100, 0, 100, 200].forEach(vx => {
                            this.enemyLasers.push({ x: bx, y: by, vx: vx, vy: 325, color: '#ff007f', kind: 'bolt' });
                        });
                        this.enemyLasers.push({ x: bx, y: by, vx: aimVx, vy: 350, color: '#ffea00', kind: 'bomb' });
                    } else {
                        this.enemyLasers.push({ x: boss.x + 18, y: by, vx: aimVx - 65, vy: 315, color: '#c084fc', kind: 'bolt' });
                        this.enemyLasers.push({ x: boss.x + boss.w - 18, y: by, vx: aimVx + 65, vy: 315, color: '#c084fc', kind: 'bolt' });
                        this.enemyLasers.push({ x: bx, y: by, vx: aimVx, vy: 335, color: '#ffea00', kind: 'bomb' });
                    }
                }
                this.sound.playAlienLaser();

                // Tier 3+ bosses can summon up to 2 tactical escort drones periodically
                if (boss.tier >= 3 && this.aliens.length < 2 && now > boss.nextEscortTime) {
                    boss.nextEscortTime = now + 7000;
                    const side = Math.random() < 0.5 ? 24 : Math.max(24, this.width - 58);
                    this.aliens.push({
                        x: side,
                        y: boss.baseTargetY + boss.h + 14,
                        w: 32,
                        h: 24,
                        type: Math.random() < 0.5 ? 'hunter' : 'evasive',
                        color: '#00f2fe',
                        pts: 45,
                        hp: 1,
                        maxHp: 1,
                        flashTimer: 0,
                        evadeCooldown: 0,
                        evadeTimer: 0,
                        evadeVx: 0,
                        phaseSeed: Math.random() * 6
                    });
                }
            }

            // Lasers vs Boss Collision
            for (let i = this.lasers.length - 1; i >= 0; i--) {
                const l = this.lasers[i];
                if (
                    l.x + 3 >= boss.x &&
                    l.x - 3 <= boss.x + boss.w &&
                    l.y <= boss.y + boss.h &&
                    l.y + 20 >= boss.y
                ) {
                    this.lasers.splice(i, 1);
                    boss.hp--;
                    boss.flashTimer = 0.08;
                    this.sound.playBossHit();
                    this.spawnExplosion(l.x, boss.y + boss.h - 8, '#ffea00', 5);

                    const pct = Math.max(0, (boss.hp / boss.maxHp) * 100);
                    if (this.bossBarFill) {
                        this.bossBarFill.style.width = `${pct}%`;
                    }

                    if (Math.random() < 0.08) {
                        this.dropPowerup(l.x, boss.y + boss.h);
                    }

                    // Boss Defeated
                    if (boss.hp <= 0) {
                        const isCampaignFinal = this.wave === this.maxWaves && !this.endlessMode;
                        const bonus = 1000 * boss.tier;
                        this.score += bonus;
                        this.kills++;
                        if (this.hudScore) this.hudScore.textContent = this.score;

                        // Multi-burst defeat celebration
                        const cx = boss.x + boss.w / 2;
                        const cy = boss.y + boss.h / 2;
                        this.spawnExplosion(cx, cy, '#ff007f', 65);
                        this.spawnExplosion(cx - 35, cy - 12, '#ffea00', 30);
                        this.spawnExplosion(cx + 35, cy + 12, '#00f2fe', 30);
                        this.triggerScreenShake(0.55, 16);
                        this.sound.playExplosion();

                        // Clear remaining boss escorts on boss defeat
                        this.aliens = [];
                        this.enemyLasers = [];
                        this.boss = null;
                        this.bossHealthContainer?.classList.add('hidden');
                        this.waveCleared = true;

                        if (isCampaignFinal) {
                            this.scheduleWaveOutcome(1150, 'victory');
                        } else {
                            this.sound.playWaveClear();
                            this.scheduleWaveOutcome(1150, 'level');
                        }
                        break;
                    }
                }
            }
        }

        // --- Render Loop ---
        render() {
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.width, this.height);

            if (this.screenShakeTime > 0) {
                const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
                const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
                this.ctx.translate(shakeX, shakeY);
            }

            // 1. Starfield Background
            for (const s of this.stars) {
                this.ctx.fillStyle = s.color;
                this.ctx.globalAlpha = s.alpha;
                this.ctx.fillRect(s.x, s.y, s.size, s.size);
            }
            this.ctx.globalAlpha = 1;

            // 2. Power-up Capsules
            for (const p of this.powerups) {
                this.ctx.save();
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 12;

                this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                drawRoundRect(this.ctx, p.x, p.y + Math.sin(p.bob) * 3, p.w, p.h, 6);
                this.ctx.fill();
                this.ctx.stroke();

                this.ctx.font = '14px Orbitron, sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillText(p.icon, p.x + p.w / 2, p.y + p.h / 2 + Math.sin(p.bob) * 3);
                this.ctx.restore();
            }

            // 3. Player Lasers
            for (const l of this.lasers) {
                this.ctx.save();
                this.ctx.shadowColor = l.color;
                this.ctx.shadowBlur = 12;
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(l.x - 2, l.y, 4, 18);
                this.ctx.fillStyle = l.color;
                this.ctx.fillRect(l.x - 1, l.y + 2, 2, 14);
                this.ctx.restore();
            }

            // 4. Enemy Lasers & Bombs
            for (const el of this.enemyLasers) {
                this.ctx.save();
                this.ctx.shadowColor = el.color;
                this.ctx.shadowBlur = el.kind === 'bomb' ? 14 : 10;
                this.ctx.fillStyle = el.color;
                this.ctx.beginPath();
                const r = el.kind === 'bomb' ? 5.5 : 4;
                this.ctx.arc(el.x, el.y, r, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(el.x, el.y, r * 0.45, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }

            // 5. Aliens (distinct visual silhouettes per AI type)
            for (const a of this.aliens) {
                this.ctx.save();
                const drawColor = a.flashTimer > 0 ? '#ffffff' : a.color;
                this.ctx.shadowColor = drawColor;
                this.ctx.shadowBlur = a.flashTimer > 0 ? 18 : 10;
                this.ctx.fillStyle = drawColor;

                if (a.type === 'elite') {
                    // Purple Elite Dreadnought
                    this.ctx.beginPath();
                    this.ctx.moveTo(a.x + a.w / 2, a.y);
                    this.ctx.lineTo(a.x + a.w, a.y + a.h * 0.4);
                    this.ctx.lineTo(a.x + a.w * 0.85, a.y + a.h);
                    this.ctx.lineTo(a.x + a.w * 0.15, a.y + a.h);
                    this.ctx.lineTo(a.x, a.y + a.h * 0.4);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.fillStyle = '#ffea00';
                    this.ctx.fillRect(a.x + a.w / 2 - 3, a.y + 6, 6, 8);
                } else if (a.type === 'hunter') {
                    // Orange Hunter Interceptor
                    this.ctx.beginPath();
                    this.ctx.moveTo(a.x, a.y + 4);
                    this.ctx.lineTo(a.x + a.w / 2, a.y + a.h);
                    this.ctx.lineTo(a.x + a.w, a.y + 4);
                    this.ctx.lineTo(a.x + a.w * 0.72, a.y);
                    this.ctx.lineTo(a.x + a.w * 0.28, a.y);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(a.x + a.w / 2 - 4, a.y + 6, 8, 4);
                } else if (a.type === 'bomber') {
                    // Gold Heavy Bomber
                    this.ctx.beginPath();
                    drawRoundRect(this.ctx, a.x + 2, a.y + 2, a.w - 4, a.h - 4, 6);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#ff007f';
                    this.ctx.beginPath();
                    this.ctx.arc(a.x + a.w / 2, a.y + a.h / 2 + 2, 5, 0, Math.PI * 2);
                    this.ctx.fill();
                } else if (a.type === 'evasive') {
                    // Cyan Evasive Scout
                    this.ctx.beginPath();
                    this.ctx.moveTo(a.x + a.w / 2, a.y + 2);
                    this.ctx.lineTo(a.x + a.w - 2, a.y + a.h / 2);
                    this.ctx.lineTo(a.x + a.w * 0.75, a.y + a.h - 2);
                    this.ctx.lineTo(a.x + a.w * 0.25, a.y + a.h - 2);
                    this.ctx.lineTo(a.x + 2, a.y + a.h / 2);
                    this.ctx.closePath();
                    this.ctx.fill();
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.arc(a.x + a.w / 2, a.y + a.h / 2, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    // Green Standard Scout
                    this.ctx.beginPath();
                    drawRoundRect(this.ctx, a.x + 2, a.y + 3, a.w - 4, a.h - 6, 6);
                    this.ctx.fill();
                    this.ctx.fillRect(a.x + 5, a.y + a.h - 4, 4, 5);
                    this.ctx.fillRect(a.x + a.w - 9, a.y + a.h - 4, 4, 5);
                    this.ctx.fillStyle = '#070919';
                    this.ctx.fillRect(a.x + 8, a.y + 8, 4, 4);
                    this.ctx.fillRect(a.x + a.w - 12, a.y + 8, 4, 4);
                }

                // Mini HP bar for multi-HP enemies
                if (a.maxHp > 1 && a.hp < a.maxHp) {
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    this.ctx.fillRect(a.x + 2, a.y - 5, a.w - 4, 3);
                    this.ctx.fillStyle = '#ffea00';
                    this.ctx.fillRect(a.x + 2, a.y - 5, ((a.w - 4) * a.hp) / a.maxHp, 3);
                }
                this.ctx.restore();
            }

            // 6. Boss Entity
            if (this.boss) {
                this.ctx.save();
                const bossPalette = ['#ff007f', '#ffea00', '#ff8800', '#c084fc'];
                const baseCol = bossPalette[Math.min(bossPalette.length - 1, this.boss.tier - 1)];
                const bossColor = this.boss.flashTimer > 0 ? '#ffffff' : baseCol;
                this.ctx.shadowColor = bossColor;
                this.ctx.shadowBlur = 24;

                this.ctx.fillStyle = '#141838';
                this.ctx.strokeStyle = bossColor;
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                drawRoundRect(this.ctx, this.boss.x, this.boss.y, this.boss.w, this.boss.h, 16);
                this.ctx.fill();
                this.ctx.stroke();

                // Reactor Core
                const pulse = Math.sin(this.simTime * 6.5) * 4;
                this.ctx.fillStyle = this.boss.phase === 3 ? '#ff0000' : (this.boss.phase === 2 ? '#ff007f' : '#ffea00');
                this.ctx.beginPath();
                this.ctx.arc(this.boss.x + this.boss.w / 2, this.boss.y + this.boss.h / 2, Math.max(8, 15 + pulse), 0, Math.PI * 2);
                this.ctx.fill();

                // Dual Cannons
                this.ctx.fillStyle = '#00f2fe';
                this.ctx.fillRect(this.boss.x + 12, this.boss.y + this.boss.h - 6, 12, 10);
                this.ctx.fillRect(this.boss.x + this.boss.w - 24, this.boss.y + this.boss.h - 6, 12, 10);
                this.ctx.restore();
            }

            // 7. Player Spaceship
            if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'LEVEL_TRANSITION' || this.state === 'LEVEL_COMPLETE') {
                this.ctx.save();
                const px = this.player.x;
                const py = this.player.y;
                const pw = this.player.width;
                const ph = this.player.height;

                if (this.player.invulnerableTimer > 0 && Math.floor(Date.now() / 90) % 2 === 0) {
                    this.ctx.globalAlpha = 0.35;
                }

                this.ctx.translate(px + pw / 2, py + ph / 2);
                this.ctx.rotate(this.player.tilt);
                this.ctx.translate(-(px + pw / 2), -(py + ph / 2));

                if (this.player.shieldActive) {
                    this.ctx.strokeStyle = '#00ff88';
                    this.ctx.lineWidth = 2.5;
                    this.ctx.shadowColor = '#00ff88';
                    this.ctx.shadowBlur = 18;
                    this.ctx.beginPath();
                    this.ctx.arc(px + pw / 2, py + ph / 2, 36, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.shadowBlur = 0;
                }

                this.ctx.shadowColor = '#00f2fe';
                this.ctx.shadowBlur = 14;

                this.ctx.fillStyle = '#00f2fe';
                this.ctx.beginPath();
                this.ctx.moveTo(px + pw / 2, py);
                this.ctx.lineTo(px + pw, py + ph);
                this.ctx.lineTo(px + pw * 0.82, py + ph - 6);
                this.ctx.lineTo(px + pw * 0.18, py + ph - 6);
                this.ctx.lineTo(px, py + ph);
                this.ctx.closePath();
                this.ctx.fill();

                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.moveTo(px + pw / 2, py + 5);
                this.ctx.lineTo(px + pw / 2 + 5, py + 22);
                this.ctx.lineTo(px + pw / 2 - 5, py + 22);
                this.ctx.closePath();
                this.ctx.fill();

                const flameH = this.state === 'PAUSED' ? 10 : (8 + Math.random() * 10);
                this.ctx.fillStyle = '#ffea00';
                this.ctx.beginPath();
                this.ctx.moveTo(px + pw / 2 - 7, py + ph - 4);
                this.ctx.lineTo(px + pw / 2, py + ph + flameH);
                this.ctx.lineTo(px + pw / 2 + 7, py + ph - 4);
                this.ctx.closePath();
                this.ctx.fill();

                this.ctx.restore();
            }

            // 8. Explosion Particles
            for (const p of this.particles) {
                this.ctx.save();
                this.ctx.globalAlpha = Math.max(0, p.alpha);
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 8;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }

            this.ctx.restore();
        }

        // --- Game Loop ---
        loop(timestamp) {
            const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
            this.lastTime = timestamp;

            // Starfield animates cleanly with dt except when PAUSED
            if (this.state !== 'PAUSED') {
                this.updateStars(dt);
            }

            if (this.state === 'PLAYING') {
                this.update(dt);
            }

            this.render();
            requestAnimationFrame((t) => this.loop(t));
        }
    }

    function bootstrap() {
        window.game = new SpaceInvadersGame();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
