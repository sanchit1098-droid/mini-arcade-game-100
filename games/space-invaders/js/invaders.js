/**
 * Space Invaders - Complete Arcade Engine & 10-Level Campaign
 * Features: 10 escalating levels, 2 multi-phase Boss Battles, Power-up system,
 * screen shake, Web Audio synthesizer, high DPI canvas, and responsive controls.
 */

(function () {
    'use strict';

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
                osc.frequency.setValueAtTime(860, now);
                osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.11);
            } catch (_) {}
        }

        playAlienLaser() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(320, now);
                osc.frequency.exponentialRampToValueAtTime(110, now + 0.13);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.14);
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
                gain.gain.setValueAtTime(0.3, now);
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
                osc.frequency.setValueAtTime(380, now);
                osc.frequency.exponentialRampToValueAtTime(190, now + 0.08);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.09);
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
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
                gain.gain.setValueAtTime(0.28, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.26);
            } catch (_) {}
        }

        playWaveClear() {
            if (this.muted || !this.ctx) return;
            try {
                const notes = [440, 554, 659, 880];
                const now = this.ctx.currentTime;
                notes.forEach((freq, i) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + i * 0.08);
                    gain.gain.setValueAtTime(0.2, now + i * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + i * 0.08);
                    osc.stop(now + i * 0.08 + 0.26);
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
                    osc.frequency.setValueAtTime(freq, now + i * 0.1);
                    gain.gain.setValueAtTime(0.25, now + i * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now + i * 0.1);
                    osc.stop(now + i * 0.1 + 0.42);
                });
            } catch (_) {}
        }

        playGameOver() {
            if (this.muted || !this.ctx) return;
            try {
                const notes = [330, 293, 261, 196];
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

    // --- Main Game Class ---
    class SpaceInvadersGame {
        constructor() {
            this.canvas = document.getElementById('invadersCanvas');
            this.ctx = this.canvas.getContext('2d');
            this.sound = new SoundController();

            // DOM HUD & Overlays
            this.hudScore = document.getElementById('hudScore');
            this.hudWave = document.getElementById('hudWave');
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
            this.screenGameOver = document.getElementById('screenGameOver');
            this.screenVictory = document.getElementById('screenVictory');

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

            // Game State Machine
            this.state = 'MENU'; // 'MENU', 'PLAYING', 'LEVEL_TRANSITION', 'PAUSED', 'GAMEOVER', 'VICTORY'
            this.score = 0;
            this.highScore = parseInt(localStorage.getItem('space_invaders_hs') || '0', 10);
            this.wave = 1;
            this.maxWaves = 10;
            this.lives = 3;
            this.kills = 0;

            // Player Ship
            this.player = {
                x: 0,
                y: 0,
                width: 52,
                height: 38,
                speed: 480, // px per sec
                tilt: 0,
                invulnerableTimer: 0,
                shieldActive: false,
                shieldTimer: 0,
                rapidFireTimer: 0,
                weaponType: 'normal', // 'normal', 'double', 'spread'
                weaponTimer: 0
            };

            // Inputs
            this.keys = { left: false, right: false, fire: false };
            this.isPointerDown = false;
            this.lastFireTime = 0;

            // Entities
            this.lasers = [];
            this.enemyLasers = [];
            this.aliens = [];
            this.boss = null;
            this.powerups = [];
            this.particles = [];
            this.stars = [];

            // Alien grid kinematics
            this.alienDir = 1;
            this.alienSpeed = 35;
            this.alienDropDist = 18;
            this.nextAlienFireTime = 0;

            // Screen Shake
            this.screenShakeTime = 0;
            this.screenShakeIntensity = 0;

            this.lastTime = performance.now();
            this.init();
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

            requestAnimationFrame((t) => this.loop(t));
        }

        updateSoundButtonUI() {
            if (this.btnSound) {
                this.btnSound.textContent = this.sound.muted ? '🔇' : '🔊';
            }
        }

        createStars() {
            this.stars = [];
            const count = 90;
            for (let i = 0; i < count; i++) {
                this.stars.push({
                    x: Math.random() * (this.width || 800),
                    y: Math.random() * (this.height || 600),
                    size: Math.random() * 2.2 + 0.6,
                    speed: Math.random() * 25 + 12,
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

            // Reposition player comfortably above mobile touch controls
            const bottomMargin = this.width <= 900 ? 150 : 85;
            this.player.y = this.height - bottomMargin;

            if (this.player.x <= 0 || this.player.x >= this.width) {
                this.player.x = (this.width - this.player.width) / 2;
            }
        }

        bindEvents() {
            // Start & Redeploy
            const btnStart = document.getElementById('btnStart');
            const btnPlayAgain = document.getElementById('btnPlayAgain');
            const btnVicPlayAgain = document.getElementById('btnVicPlayAgain');

            btnStart?.addEventListener('click', () => {
                this.sound.init();
                this.start();
            });
            btnPlayAgain?.addEventListener('click', () => {
                this.sound.init();
                this.start();
            });
            btnVicPlayAgain?.addEventListener('click', () => {
                this.sound.init();
                this.start();
            });

            // Pause & Resume & Restart
            this.btnPause?.addEventListener('click', () => this.togglePause());
            document.getElementById('btnResume')?.addEventListener('click', () => this.togglePause());
            document.getElementById('btnRestart')?.addEventListener('click', () => this.start());

            // Sound Toggle
            this.btnSound?.addEventListener('click', () => {
                this.sound.init();
                this.sound.toggle();
                this.updateSoundButtonUI();
            });

            // Keyboard
            window.addEventListener('keydown', (e) => {
                if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) {
                    e.preventDefault();
                }

                if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
                        this.togglePause();
                    }
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

            // Mobile Virtual Touch Buttons (supports holding down!)
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
                el.addEventListener('mousedown', startHandler);
                el.addEventListener('mouseup', endHandler);
                el.addEventListener('mouseleave', endHandler);
            };

            bindVirtualBtn('btnLeft', () => { this.keys.left = true; }, () => { this.keys.left = false; });
            bindVirtualBtn('btnRight', () => { this.keys.right = true; }, () => { this.keys.right = false; });
            bindVirtualBtn('btnFire', () => {
                this.keys.fire = true;
                this.shoot();
            }, () => {
                this.keys.fire = false;
            });

            // Canvas Direct Drag & Tap to Steer and Fire
            const handleCanvasPointer = (clientX) => {
                if (this.state === 'PLAYING') {
                    const rect = this.canvas.getBoundingClientRect();
                    const targetX = clientX - rect.left - this.player.width / 2;
                    this.player.x = Math.max(10, Math.min(this.width - this.player.width - 10, targetX));
                    this.shoot();
                }
            };

            this.canvas.addEventListener('mousedown', (e) => {
                this.isPointerDown = true;
                this.sound.init();
                handleCanvasPointer(e.clientX);
            });
            window.addEventListener('mousemove', (e) => {
                if (this.isPointerDown) handleCanvasPointer(e.clientX);
            });
            window.addEventListener('mouseup', () => { this.isPointerDown = false; });

            this.canvas.addEventListener('touchstart', (e) => {
                if (e.touches.length > 0) {
                    this.isPointerDown = true;
                    this.sound.init();
                    handleCanvasPointer(e.touches[0].clientX);
                }
            }, { passive: true });
            window.addEventListener('touchmove', (e) => {
                if (this.isPointerDown && e.touches.length > 0) {
                    handleCanvasPointer(e.touches[0].clientX);
                }
            }, { passive: true });
            window.addEventListener('touchend', () => { this.isPointerDown = false; });
        }

        start() {
            this.sound.init();
            this.score = 0;
            this.wave = 1;
            this.lives = 3;
            this.kills = 0;

            if (this.hudScore) this.hudScore.textContent = '0';
            if (this.hudWave) this.hudWave.textContent = '1 / 10';
            if (this.hudBest) this.hudBest.textContent = this.highScore;
            this.updateLivesHUD();

            this.player.x = (this.width - this.player.width) / 2;
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
            this.screenGameOver?.classList.add('hidden');
            this.screenVictory?.classList.add('hidden');
            this.bossHealthContainer?.classList.add('hidden');

            this.setupWave(1);
        }

        togglePause() {
            if (this.state === 'PLAYING') {
                this.state = 'PAUSED';
                this.screenPause?.classList.remove('hidden');
            } else if (this.state === 'PAUSED') {
                this.state = 'PLAYING';
                this.screenPause?.classList.add('hidden');
                this.lastTime = performance.now();
            }
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

        // --- 10-Level Campaign Configuration ---
        setupWave(waveNum) {
            this.wave = waveNum;
            if (this.hudWave) {
                this.hudWave.textContent = `${this.wave} / ${this.maxWaves}`;
            }

            this.lasers = [];
            this.enemyLasers = [];
            this.aliens = [];
            this.boss = null;
            this.bossHealthContainer?.classList.add('hidden');

            // Level Transition Banner
            this.state = 'LEVEL_TRANSITION';
            if (this.levelBanner && this.bannerTitle && this.bannerSub) {
                if (waveNum === 5) {
                    this.bannerSub.textContent = 'WARNING: CAPITAL DESTROYER CLASS DETECTED';
                    this.bannerTitle.textContent = 'LEVEL 5: ORBITAL DESTROYER';
                    this.bannerSub.style.color = '#ff007f';
                } else if (waveNum === 10) {
                    this.bannerSub.textContent = 'FINAL SECTOR: FLEET FLAGSHIP INVASION';
                    this.bannerTitle.textContent = 'LEVEL 10: MOTHERSHIP OVERLORD';
                    this.bannerSub.style.color = '#ffea00';
                } else {
                    this.bannerSub.textContent = `INCOMING ALIEN SQUADRON // SECTOR ${waveNum}`;
                    this.bannerTitle.textContent = `LEVEL ${waveNum}`;
                    this.bannerSub.style.color = '#00f2fe';
                }

                this.levelBanner.classList.remove('hidden');
                setTimeout(() => {
                    this.levelBanner.classList.add('hidden');
                    if (this.state === 'LEVEL_TRANSITION') {
                        this.state = 'PLAYING';
                    }
                }, 2000);
            } else {
                this.state = 'PLAYING';
            }

            // Check Boss Battles
            if (waveNum === 5) {
                this.spawnBoss('ORBITAL DESTROYER', 75, 1);
                return;
            }
            if (waveNum === 10) {
                this.spawnBoss('MOTHERSHIP OVERLORD', 150, 2);
                return;
            }

            // Standard Alien Grid Formation (Scales with Level 1-4, 6-9)
            const cols = Math.min(9, Math.max(5, Math.floor((this.width - 40) / 54)));
            let rows = 3;
            if (waveNum >= 2) rows = 4;
            if (waveNum >= 6) rows = 5;

            const alienW = 36;
            const alienH = 26;
            const gapX = 16;
            const gapY = 16;
            const totalW = cols * alienW + (cols - 1) * gapX;
            const startX = Math.max(16, (this.width - totalW) / 2);
            const startY = 85;

            this.alienDir = 1;
            // Base speed scales progressively per level
            this.alienSpeed = 30 + waveNum * 7;
            this.alienDropDist = 18;

            for (let r = 0; r < rows; r++) {
                let type = 'scout';
                let pts = 10;
                let hp = 1;
                let color = '#00ff88';

                if (r === 0 && waveNum >= 4) {
                    type = 'commander';
                    pts = 35;
                    hp = waveNum >= 8 ? 2 : 1;
                    color = '#ff007f';
                } else if (r <= 1 && waveNum >= 6) {
                    type = 'dreadnought';
                    pts = 50;
                    hp = 2;
                    color = '#9d00ff';
                } else if (r <= 2 && waveNum >= 2) {
                    type = 'drone';
                    pts = 20;
                    hp = 1;
                    color = '#00f2fe';
                }

                for (let c = 0; c < cols; c++) {
                    this.aliens.push({
                        x: startX + c * (alienW + gapX),
                        y: startY + r * (alienH + gapY),
                        w: alienW,
                        h: alienH,
                        type: type,
                        color: color,
                        pts: pts,
                        hp: hp,
                        maxHp: hp,
                        anim: 0
                    });
                }
            }
        }

        spawnBoss(name, hp, tier = 1) {
            const bossWidth = Math.min(220, this.width * 0.55);
            const bossHeight = tier === 2 ? 95 : 80;

            this.boss = {
                name: name,
                tier: tier, // 1: Mini-Boss, 2: Final Boss
                x: (this.width - bossWidth) / 2,
                y: 85,
                w: bossWidth,
                h: bossHeight,
                hp: hp,
                maxHp: hp,
                dir: 1,
                speed: tier === 2 ? 65 : 55,
                phase: 1,
                nextAttackTime: performance.now() + 1400
            };

            if (this.bossName) this.bossName.textContent = name;
            if (this.bossBarFill) this.bossBarFill.style.width = '100%';
            this.bossHealthContainer?.classList.remove('hidden');
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
                // 3-way fan spread
                this.lasers.push({ x: px + pw / 2, y: py, vx: 0, vy: -780, color: '#ff007f' });
                this.lasers.push({ x: px + 8, y: py + 4, vx: -160, vy: -760, color: '#ffea00' });
                this.lasers.push({ x: px + pw - 8, y: py + 4, vx: 160, vy: -760, color: '#ffea00' });
            } else if (this.player.weaponType === 'double') {
                // Heavy dual parallel lasers
                this.lasers.push({ x: px + 6, y: py, vx: 0, vy: -800, color: '#00f2fe' });
                this.lasers.push({ x: px + pw - 6, y: py, vx: 0, vy: -800, color: '#00f2fe' });
            } else {
                // Classic dual wing lasers
                this.lasers.push({ x: px + 10, y: py, vx: 0, vy: -750, color: '#00f2fe' });
                this.lasers.push({ x: px + pw - 10, y: py, vx: 0, vy: -750, color: '#00f2fe' });
            }

            this.sound.playLaser();
        }

        dropPowerup(x, y) {
            // 14% drop chance
            if (Math.random() > 0.14) return;

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
                x: x,
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
                    decay: Math.random() * 0.03 + 0.02
                });
            }
        }

        hitPlayer() {
            if (this.player.invulnerableTimer > 0) return;

            // Energy Shield absorbs collision
            if (this.player.shieldActive) {
                this.player.shieldActive = false;
                this.player.shieldTimer = 0;
                this.sound.playShieldBreak();
                this.triggerScreenShake(0.2, 6);
                this.spawnExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#00ff88', 25);
                this.updatePowerupHUD();
                this.player.invulnerableTimer = 1.0;
                return;
            }

            // Normal Hit
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

        gameOver(reason = 'MISSION FAILED') {
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
            this.screenGameOver?.classList.remove('hidden');
        }

        triggerVictory() {
            this.state = 'VICTORY';
            this.sound.playVictory();
            this.triggerScreenShake(0.6, 16);

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
            this.screenVictory?.classList.remove('hidden');
        }

        // --- Frame Update ---
        update(dt) {
            // Screen Shake Decay
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

            // Continuous auto-fire while fire button/space is held
            if (this.keys.fire) {
                this.shoot();
            }

            // Player Steering & Banking Tilt
            let moveDir = 0;
            if (this.keys.left) moveDir -= 1;
            if (this.keys.right) moveDir += 1;

            this.player.x += moveDir * this.player.speed * dt;
            this.player.x = Math.max(10, Math.min(this.width - this.player.width - 10, this.player.x));
            this.player.tilt = moveDir * 0.18;

            // Update Player Lasers
            for (let i = this.lasers.length - 1; i >= 0; i--) {
                const l = this.lasers[i];
                l.x += (l.vx || 0) * dt;
                l.y += (l.vy || -750) * dt;
                if (l.y < -30 || l.x < -30 || l.x > this.width + 30) {
                    this.lasers.splice(i, 1);
                }
            }

            // Update Enemy Lasers
            for (let i = this.enemyLasers.length - 1; i >= 0; i--) {
                const el = this.enemyLasers[i];
                el.x += (el.vx || 0) * dt;
                el.y += el.vy * dt;

                // Collision with Player
                if (
                    el.x > this.player.x &&
                    el.x < this.player.x + this.player.width &&
                    el.y > this.player.y &&
                    el.y < this.player.y + this.player.height
                ) {
                    this.enemyLasers.splice(i, 1);
                    this.hitPlayer();
                    continue;
                }

                if (el.y > this.height + 30 || el.x < -30 || el.x > this.width + 30) {
                    this.enemyLasers.splice(i, 1);
                }
            }

            // Update Powerups Falling
            for (let i = this.powerups.length - 1; i >= 0; i--) {
                const p = this.powerups[i];
                p.y += p.vy * dt;
                p.bob += dt * 3;

                // Collision with Player
                if (
                    p.x + p.w > this.player.x &&
                    p.x < this.player.x + this.player.width &&
                    p.y + p.h > this.player.y &&
                    p.y < this.player.y + this.player.height
                ) {
                    this.applyPowerup(p.type);
                    this.spawnExplosion(p.x + p.w / 2, p.y + p.h / 2, p.color, 12);
                    this.powerups.splice(i, 1);
                    continue;
                }

                if (p.y > this.height + 30) {
                    this.powerups.splice(i, 1);
                }
            }

            // Boss Logic & AI
            if (this.boss) {
                this.boss.x += this.boss.dir * this.boss.speed * dt;
                if (this.boss.x < 15) {
                    this.boss.x = 15;
                    this.boss.dir = 1;
                } else if (this.boss.x + this.boss.w > this.width - 15) {
                    this.boss.x = this.width - 15 - this.boss.w;
                    this.boss.dir = -1;
                }

                const hpRatio = this.boss.hp / this.boss.maxHp;
                if (hpRatio < 0.35 && this.boss.phase !== 3) {
                    this.boss.phase = 3;
                    this.boss.speed += 20;
                } else if (hpRatio < 0.65 && this.boss.phase === 1) {
                    this.boss.phase = 2;
                    this.boss.speed += 12;
                }

                // Boss Attack AI Patterns
                const now = performance.now();
                if (now > this.boss.nextAttackTime) {
                    const bx = this.boss.x + this.boss.w / 2;
                    const by = this.boss.y + this.boss.h;

                    if (this.boss.tier === 1) {
                        // Orbital Destroyer (Level 5)
                        this.boss.nextAttackTime = now + (this.boss.phase === 2 ? 950 : 1300);
                        this.enemyLasers.push({ x: bx, y: by, vx: 0, vy: 310, color: '#ffea00' });
                        this.enemyLasers.push({ x: bx - 28, y: by, vx: -120, vy: 290, color: '#ff007f' });
                        this.enemyLasers.push({ x: bx + 28, y: by, vx: 120, vy: 290, color: '#ff007f' });
                        this.sound.playAlienLaser();
                    } else {
                        // Mothership Overlord (Level 10)
                        if (this.boss.phase === 3) {
                            // Phase 3: Enraged 5-way spread + central cannon
                            this.boss.nextAttackTime = now + 750;
                            [-180, -90, 0, 90, 180].forEach(vx => {
                                this.enemyLasers.push({ x: bx, y: by, vx: vx, vy: 320, color: '#ff007f' });
                            });
                        } else if (this.boss.phase === 2) {
                            // Phase 2: Dual alternating wings
                            this.boss.nextAttackTime = now + 900;
                            this.enemyLasers.push({ x: this.boss.x + 20, y: by, vx: -40, vy: 300, color: '#00f2fe' });
                            this.enemyLasers.push({ x: this.boss.x + this.boss.w - 20, y: by, vx: 40, vy: 300, color: '#00f2fe' });
                            this.enemyLasers.push({ x: bx, y: by, vx: 0, vy: 330, color: '#ffea00' });
                        } else {
                            // Phase 1: 3-way spread
                            this.boss.nextAttackTime = now + 1200;
                            this.enemyLasers.push({ x: bx, y: by, vx: 0, vy: 300, color: '#ffea00' });
                            this.enemyLasers.push({ x: bx - 35, y: by, vx: -110, vy: 280, color: '#ff007f' });
                            this.enemyLasers.push({ x: bx + 35, y: by, vx: 110, vy: 280, color: '#ff007f' });
                        }
                        this.sound.playAlienLaser();
                    }
                }

                // Lasers vs Boss Collision
                for (let i = this.lasers.length - 1; i >= 0; i--) {
                    const l = this.lasers[i];
                    if (
                        l.x > this.boss.x &&
                        l.x < this.boss.x + this.boss.w &&
                        l.y > this.boss.y &&
                        l.y < this.boss.y + this.boss.h
                    ) {
                        this.lasers.splice(i, 1);
                        this.boss.hp--;
                        this.sound.playBossHit();
                        this.spawnExplosion(l.x, l.y, '#ffea00', 5);

                        // Update Boss Health Bar
                        const pct = Math.max(0, (this.boss.hp / this.boss.maxHp) * 100);
                        if (this.bossBarFill) {
                            this.bossBarFill.style.width = `${pct}%`;
                        }

                        // Chance to drop power-up when hitting boss
                        if (Math.random() < 0.08) {
                            this.dropPowerup(l.x, this.boss.y + this.boss.h);
                        }

                        // Boss Defeated
                        if (this.boss.hp <= 0) {
                            const isFinal = this.boss.tier === 2;
                            const bonus = isFinal ? 3000 : 1200;
                            this.score += bonus;
                            if (this.hudScore) this.hudScore.textContent = this.score;

                            this.spawnExplosion(this.boss.x + this.boss.w / 2, this.boss.y + this.boss.h / 2, '#ff007f', 75);
                            this.triggerScreenShake(0.5, 15);
                            this.sound.playExplosion();
                            this.boss = null;
                            this.bossHealthContainer?.classList.add('hidden');

                            if (isFinal) {
                                // Campaign Win!
                                setTimeout(() => this.triggerVictory(), 1200);
                            } else {
                                this.sound.playWaveClear();
                                setTimeout(() => this.setupWave(this.wave + 1), 1400);
                            }
                            break;
                        }
                    }
                }
                return;
            }

            // Alien Grid Movement & AI
            if (this.aliens.length > 0) {
                let hitEdge = false;
                for (const a of this.aliens) {
                    a.x += this.alienDir * this.alienSpeed * dt;
                    if (a.x < 12 || a.x + a.w > this.width - 12) {
                        hitEdge = true;
                    }
                }

                if (hitEdge) {
                    this.alienDir *= -1;
                    for (const a of this.aliens) {
                        a.y += this.alienDropDist;
                        // Invasion reaches player defense line
                        if (a.y + a.h >= this.player.y) {
                            this.gameOver('INVASION BREACHED SURFACE');
                            return;
                        }
                    }
                }

                // Alien Firing Logic (Scales with level & remaining numbers)
                const now = performance.now();
                if (now > this.nextAlienFireTime) {
                    const fireInterval = Math.max(380, 1400 - (this.wave * 100) - (40 - this.aliens.length) * 15);
                    this.nextAlienFireTime = now + fireInterval;

                    const shooter = this.aliens[Math.floor(Math.random() * this.aliens.length)];
                    if (shooter) {
                        if (shooter.type === 'commander') {
                            // Commanders shoot double plasma
                            this.enemyLasers.push({ x: shooter.x + 8, y: shooter.y + shooter.h, vx: -20, vy: 260 + this.wave * 15, color: shooter.color });
                            this.enemyLasers.push({ x: shooter.x + shooter.w - 8, y: shooter.y + shooter.h, vx: 20, vy: 260 + this.wave * 15, color: shooter.color });
                        } else {
                            this.enemyLasers.push({
                                x: shooter.x + shooter.w / 2,
                                y: shooter.y + shooter.h,
                                vx: (Math.random() - 0.5) * 40,
                                vy: 250 + this.wave * 15,
                                color: shooter.color
                            });
                        }
                        this.sound.playAlienLaser();
                    }
                }

                // Lasers vs Aliens
                for (let li = this.lasers.length - 1; li >= 0; li--) {
                    const l = this.lasers[li];
                    for (let ai = this.aliens.length - 1; ai >= 0; ai--) {
                        const a = this.aliens[ai];
                        if (l.x > a.x && l.x < a.x + a.w && l.y > a.y && l.y < a.y + a.h) {
                            this.lasers.splice(li, 1);
                            a.hp--;

                            if (a.hp <= 0) {
                                this.score += a.pts;
                                this.kills++;
                                if (this.hudScore) this.hudScore.textContent = this.score;

                                this.spawnExplosion(a.x + a.w / 2, a.y + a.h / 2, a.color, 16);
                                this.sound.playExplosion();
                                this.dropPowerup(a.x + a.w / 2, a.y + a.h / 2);
                                this.aliens.splice(ai, 1);

                                // Dynamic acceleration as numbers decrease
                                this.alienSpeed += 1.8;

                                // Wave Cleared!
                                if (this.aliens.length === 0) {
                                    this.sound.playWaveClear();
                                    setTimeout(() => this.setupWave(this.wave + 1), 1000);
                                }
                            } else {
                                this.sound.playBossHit();
                                this.spawnExplosion(l.x, l.y, a.color, 6);
                            }
                            break;
                        }
                    }
                }
            }

            // Update Particles
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.alpha -= p.decay || 0.025;

                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }

        // --- Render Loop ---
        render() {
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Screen Shake Offset
            if (this.screenShakeTime > 0) {
                const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity;
                const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity;
                this.ctx.translate(shakeX, shakeY);
            }

            // 1. Animated Parallax Starfield
            for (const s of this.stars) {
                s.y += s.speed * 0.016;
                if (s.y > this.height) s.y = 0;
                this.ctx.fillStyle = s.color;
                this.ctx.globalAlpha = s.alpha;
                this.ctx.fillRect(s.x, s.y, s.size, s.size);
            }
            this.ctx.globalAlpha = 1;

            // 2. Power-up Capsules Falling
            for (const p of this.powerups) {
                this.ctx.save();
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 12;

                // Pulsing Capsule Body
                this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.roundRect(p.x, p.y + Math.sin(p.bob) * 3, p.w, p.h, 6);
                this.ctx.fill();
                this.ctx.stroke();

                // Icon
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

            // 4. Enemy Lasers
            for (const el of this.enemyLasers) {
                this.ctx.save();
                this.ctx.shadowColor = el.color;
                this.ctx.shadowBlur = 10;
                this.ctx.fillStyle = el.color;
                this.ctx.beginPath();
                this.ctx.arc(el.x, el.y, 4, 0, Math.PI * 2);
                this.ctx.fill();
                // Core
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(el.x, el.y, 1.8, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }

            // 5. Aliens
            for (const a of this.aliens) {
                this.ctx.save();
                this.ctx.shadowColor = a.color;
                this.ctx.shadowBlur = 10;
                this.ctx.fillStyle = a.color;

                if (a.type === 'dreadnought') {
                    // Armored Purple Dreadnought
                    this.ctx.beginPath();
                    this.ctx.moveTo(a.x + a.w / 2, a.y);
                    this.ctx.lineTo(a.x + a.w, a.y + a.h * 0.4);
                    this.ctx.lineTo(a.x + a.w * 0.85, a.y + a.h);
                    this.ctx.lineTo(a.x + a.w * 0.15, a.y + a.h);
                    this.ctx.lineTo(a.x, a.y + a.h * 0.4);
                    this.ctx.closePath();
                    this.ctx.fill();
                    // Armor Core
                    this.ctx.fillStyle = '#ffea00';
                    this.ctx.fillRect(a.x + a.w / 2 - 3, a.y + 6, 6, 8);
                } else if (a.type === 'commander') {
                    // Pink Commander
                    this.ctx.beginPath();
                    this.ctx.roundRect(a.x + 3, a.y + 3, a.w - 6, a.h - 6, 5);
                    this.ctx.fill();
                    this.ctx.fillRect(a.x + 8, a.y, a.w - 16, 4);
                    this.ctx.fillRect(a.x + 2, a.y + a.h - 4, 6, 4);
                    this.ctx.fillRect(a.x + a.w - 8, a.y + a.h - 4, 6, 4);
                    // Glowing eyes
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(a.x + 9, a.y + 9, 4, 4);
                    this.ctx.fillRect(a.x + a.w - 13, a.y + 9, 4, 4);
                } else if (a.type === 'drone') {
                    // Cyan Drone
                    this.ctx.beginPath();
                    this.ctx.moveTo(a.x + a.w / 2, a.y + 2);
                    this.ctx.lineTo(a.x + a.w - 2, a.y + a.h / 2);
                    this.ctx.lineTo(a.x + a.w * 0.75, a.y + a.h - 2);
                    this.ctx.lineTo(a.x + a.w * 0.25, a.y + a.h - 2);
                    this.ctx.lineTo(a.x + 2, a.y + a.h / 2);
                    this.ctx.closePath();
                    this.ctx.fill();
                    // Drone eye
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.beginPath();
                    this.ctx.arc(a.x + a.w / 2, a.y + a.h / 2, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    // Green Scout
                    this.ctx.beginPath();
                    this.ctx.roundRect(a.x + 2, a.y + 3, a.w - 4, a.h - 6, 6);
                    this.ctx.fill();
                    this.ctx.fillRect(a.x + 5, a.y + a.h - 4, 4, 5);
                    this.ctx.fillRect(a.x + a.w - 9, a.y + a.h - 4, 4, 5);
                    // Eyes
                    this.ctx.fillStyle = '#070919';
                    this.ctx.fillRect(a.x + 8, a.y + 8, 4, 4);
                    this.ctx.fillRect(a.x + a.w - 12, a.y + 8, 4, 4);
                }
                this.ctx.restore();
            }

            // 6. Boss Entity
            if (this.boss) {
                this.ctx.save();
                this.ctx.shadowColor = this.boss.tier === 2 ? '#ffea00' : '#ff007f';
                this.ctx.shadowBlur = 24;

                // Armored Chassis
                this.ctx.fillStyle = '#141838';
                this.ctx.strokeStyle = this.boss.tier === 2 ? '#ffea00' : '#ff007f';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.roundRect(this.boss.x, this.boss.y, this.boss.w, this.boss.h, 16);
                this.ctx.fill();
                this.ctx.stroke();

                // Core Reactor
                const pulse = Math.sin(Date.now() / 150) * 4;
                this.ctx.fillStyle = this.boss.phase === 3 ? '#ff0000' : (this.boss.phase === 2 ? '#ff007f' : '#ffea00');
                this.ctx.beginPath();
                this.ctx.arc(this.boss.x + this.boss.w / 2, this.boss.y + this.boss.h / 2, 16 + pulse, 0, Math.PI * 2);
                this.ctx.fill();

                // Wing Cannons
                this.ctx.fillStyle = '#00f2fe';
                this.ctx.fillRect(this.boss.x + 12, this.boss.y + this.boss.h - 6, 12, 10);
                this.ctx.fillRect(this.boss.x + this.boss.w - 24, this.boss.y + this.boss.h - 6, 12, 10);
                this.ctx.restore();
            }

            // 7. Player Ship
            if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'LEVEL_TRANSITION') {
                this.ctx.save();
                const px = this.player.x;
                const py = this.player.y;
                const pw = this.player.width;
                const ph = this.player.height;

                // Invulnerability blink
                if (this.player.invulnerableTimer > 0 && Math.floor(Date.now() / 90) % 2 === 0) {
                    this.ctx.globalAlpha = 0.35;
                }

                // Tilt translation
                this.ctx.translate(px + pw / 2, py + ph / 2);
                this.ctx.rotate(this.player.tilt);
                this.ctx.translate(-(px + pw / 2), -(py + ph / 2));

                // Energy Shield Aura
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

                // Main Wing Fuselage
                this.ctx.fillStyle = '#00f2fe';
                this.ctx.beginPath();
                this.ctx.moveTo(px + pw / 2, py);
                this.ctx.lineTo(px + pw, py + ph);
                this.ctx.lineTo(px + pw * 0.82, py + ph - 6);
                this.ctx.lineTo(px + pw * 0.18, py + ph - 6);
                this.ctx.lineTo(px, py + ph);
                this.ctx.closePath();
                this.ctx.fill();

                // Sleek Cockpit Canopy
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.moveTo(px + pw / 2, py + 5);
                this.ctx.lineTo(px + pw / 2 + 5, py + 22);
                this.ctx.lineTo(px + pw / 2 - 5, py + 22);
                this.ctx.closePath();
                this.ctx.fill();

                // Animated Plasma Thrusters
                const flameH = 8 + Math.random() * 10;
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
                this.ctx.globalAlpha = p.alpha;
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

        // --- Main Game Loop ---
        loop(timestamp) {
            const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
            this.lastTime = timestamp;

            if (this.state === 'PLAYING') {
                this.update(dt);
            }

            this.render();
            requestAnimationFrame((t) => this.loop(t));
        }
    }

    // Launch game safely on DOM ready or immediate if already loaded
    function bootstrap() {
        window.game = new SpaceInvadersGame();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
