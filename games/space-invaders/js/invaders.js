/**
 * Space Invaders - Arcade Engine
 * Dynamic alien formations, boss battles, particle explosions, and Web Audio SFX
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

    playLaser() {
        if (this.muted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.12);
        } catch (_) {}
    }

    playAlienLaser() {
        if (this.muted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(350, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.15);
        } catch (_) {}
    }

    playExplosion() {
        if (this.muted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.28);
            gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.28);
        } catch (_) {}
    }

    playBossHit() {
        if (this.muted || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch (_) {}
    }

    playVictory() {
        if (this.muted || !this.ctx) return;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            setTimeout(() => {
                try {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.25);
                } catch (_) {}
            }, idx * 90);
        });
    }
}

class SpaceInvadersGame {
    constructor() {
        this.canvas = document.getElementById('invadersCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.sound = new SoundController();

        // HUD elements
        this.hudScore = document.getElementById('hudScore');
        this.hudWave = document.getElementById('hudWave');
        this.hudLives = document.getElementById('hudLives');
        this.btnPause = document.getElementById('btnPause');
        this.btnSound = document.getElementById('btnSoundToggle');
        this.screenMenu = document.getElementById('screenMenu');
        this.screenPause = document.getElementById('screenPause');
        this.screenGameOver = document.getElementById('screenGameOver');
        this.goTitle = document.getElementById('goTitle');
        this.goScore = document.getElementById('goScore');
        this.goBest = document.getElementById('goBest');

        // State
        this.width = 0;
        this.height = 0;
        this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('space_invaders_hs') || '0', 10);
        this.wave = 1;
        this.lives = 3;

        // Player
        this.player = {
            x: 0,
            y: 0,
            width: 52,
            height: 38,
            speed: 460, // px per sec
            invulnerableTime: 0
        };

        // Inputs
        this.keys = { left: false, right: false, fire: false };
        this.lastFireTime = 0;
        this.fireCooldown = 220; // ms

        // Entities
        this.lasers = [];       // Player lasers [{x, y, vx, vy}]
        this.enemyLasers = [];  // Alien lasers [{x, y, vy}]
        this.aliens = [];       // [{x, y, w, h, type, hp, pts, animFrame}]
        this.boss = null;       // Boss entity when active
        this.particles = [];
        this.stars = [];

        // Alien wave movement
        this.alienDir = 1;
        this.alienSpeed = 40;
        this.alienDropDist = 18;
        this.nextAlienFireTime = 0;

        this.lastTime = performance.now();
        this.init();
    }

    init() {
        this.updateSoundButtonUI();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createStars();
        this.bindEvents();
        this.hudBest.textContent = this.highScore;
        requestAnimationFrame((t) => this.loop(t));
    }

    updateSoundButtonUI() {
        if (this.btnSound) {
            this.btnSound.textContent = this.sound.muted ? '🔇' : '🔊';
        }
    }

    createStars() {
        this.stars = [];
        const count = 75;
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.8,
                speed: Math.random() * 25 + 15,
                color: Math.random() > 0.4 ? '#00f2fe' : (Math.random() > 0.5 ? '#ff007f' : '#ffffff'),
                alpha: Math.random() * 0.7 + 0.3
            });
        }
    }

    resize() {
        const container = document.getElementById('spaceContainer');
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = Math.round(this.width * dpr);
        this.canvas.height = Math.round(this.height * dpr);
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Reposition player
        this.player.y = this.height - (window.innerWidth <= 900 ? 140 : 80);
        if (this.player.x === 0) {
            this.player.x = this.width / 2 - this.player.width / 2;
        }
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

        // Keyboard Controls
        window.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();

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

        // Touch Virtual Buttons
        const bindTouch = (id, onStart, onEnd) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.sound.init();
                onStart();
            }, { passive: false });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                onEnd();
            }, { passive: false });
            btn.addEventListener('mousedown', onStart);
            btn.addEventListener('mouseup', onEnd);
        };

        bindTouch('btnLeft', () => { this.keys.left = true; }, () => { this.keys.left = false; });
        bindTouch('btnRight', () => { this.keys.right = true; }, () => { this.keys.right = false; });
        bindTouch('btnFire', () => { this.shoot(); }, () => {});

        // Drag to move on canvas
        let isDragging = false;
        const onDown = (clientX) => {
            if (this.state === 'PLAYING') {
                isDragging = true;
                this.player.x = clientX - this.player.width / 2;
                this.shoot();
            }
        };
        const onMove = (clientX) => {
            if (isDragging && this.state === 'PLAYING') {
                this.player.x = clientX - this.player.width / 2;
            }
        };
        const onUp = () => { isDragging = false; };

        this.canvas.addEventListener('mousedown', (e) => onDown(e.clientX));
        window.addEventListener('mousemove', (e) => onMove(e.clientX));
        window.addEventListener('mouseup', onUp);

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) onDown(e.touches[0].clientX);
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) onMove(e.touches[0].clientX);
        }, { passive: true });
        window.addEventListener('touchend', onUp);
    }

    start() {
        this.score = 0;
        this.wave = 1;
        this.lives = 3;
        this.hudScore.textContent = '0';
        this.hudWave.textContent = '1';
        this.updateLivesHUD();

        this.player.x = this.width / 2 - this.player.width / 2;
        this.lasers = [];
        this.enemyLasers = [];
        this.particles = [];

        this.screenMenu.classList.add('hidden');
        this.screenPause.classList.add('hidden');
        this.screenGameOver.classList.add('hidden');

        this.setupWave(1);
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

    updateLivesHUD() {
        this.hudLives.textContent = '❤️'.repeat(Math.max(0, this.lives));
    }

    setupWave(waveNum) {
        this.wave = waveNum;
        this.hudWave.textContent = this.wave;
        this.lasers = [];
        this.enemyLasers = [];
        this.aliens = [];
        this.boss = null;

        // Wave 3, 6, 9... is BOSS BATTLE
        if (waveNum % 3 === 0) {
            this.spawnBoss();
            return;
        }

        // Standard formation: 4 rows x 8 columns
        const cols = Math.min(8, Math.max(5, Math.floor(this.width / 60)));
        const rows = 4;
        const alienW = 36;
        const alienH = 26;
        const gapX = 18;
        const gapY = 16;
        const totalW = cols * alienW + (cols - 1) * gapX;
        const startX = Math.max(20, (this.width - totalW) / 2);
        const startY = 70;

        this.alienDir = 1;
        this.alienSpeed = 35 + (waveNum - 1) * 12;

        for (let r = 0; r < rows; r++) {
            let type = 'scout';
            let pts = 10;
            let hp = 1;
            let color = '#00ff88';

            if (r === 0) {
                type = 'commander';
                pts = 35;
                color = '#ff007f';
            } else if (r === 1) {
                type = 'drone';
                pts = 20;
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
                    anim: 0
                });
            }
        }
    }

    spawnBoss() {
        this.boss = {
            x: this.width / 2 - 80,
            y: 75,
            w: 160,
            h: 70,
            hp: 30 + (this.wave - 3) * 15,
            maxHp: 30 + (this.wave - 3) * 15,
            dir: 1,
            speed: 60,
            nextAttackTime: performance.now() + 1500
        };
    }

    shoot() {
        const now = performance.now();
        if (now - this.lastFireTime < this.fireCooldown) return;
        this.lastFireTime = now;

        // Dual lasers from left and right wings
        const px = this.player.x;
        const py = this.player.y;
        this.lasers.push({ x: px + 10, y: py, vy: -750, color: '#00f2fe' });
        this.lasers.push({ x: px + this.player.width - 10, y: py, vy: -750, color: '#00f2fe' });
        this.sound.playLaser();
    }

    spawnExplosion(x, y, color, count = 18) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 180 + 40;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                alpha: 1,
                size: Math.random() * 3.5 + 1.5
            });
        }
    }

    update(dt) {
        // Player Movement
        if (this.keys.left) {
            this.player.x -= this.player.speed * dt;
        }
        if (this.keys.right) {
            this.player.x += this.player.speed * dt;
        }
        this.player.x = Math.max(10, Math.min(this.width - this.player.width - 10, this.player.x));

        if (this.player.invulnerableTime > 0) {
            this.player.invulnerableTime -= dt;
        }

        // Update Lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const l = this.lasers[i];
            l.y += l.vy * dt;
            if (l.y < -20) {
                this.lasers.splice(i, 1);
            }
        }

        // Update Enemy Lasers
        for (let i = this.enemyLasers.length - 1; i >= 0; i--) {
            const el = this.enemyLasers[i];
            el.y += el.vy * dt;
            if (el.vx) el.x += el.vx * dt;

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

            if (el.y > this.height + 20) {
                this.enemyLasers.splice(i, 1);
            }
        }

        // Boss Logic
        if (this.boss) {
            this.boss.x += this.boss.dir * this.boss.speed * dt;
            if (this.boss.x < 15) {
                this.boss.x = 15;
                this.boss.dir = 1;
            } else if (this.boss.x + this.boss.w > this.width - 15) {
                this.boss.x = this.width - 15 - this.boss.w;
                this.boss.dir = -1;
            }

            // Boss Attack
            const now = performance.now();
            if (now > this.boss.nextAttackTime) {
                this.boss.nextAttackTime = now + 1200;
                const bx = this.boss.x + this.boss.w / 2;
                const by = this.boss.y + this.boss.h;
                // 3-way spread attack
                this.enemyLasers.push({ x: bx, y: by, vx: 0, vy: 300, color: '#ffea00' });
                this.enemyLasers.push({ x: bx - 20, y: by, vx: -120, vy: 280, color: '#ff007f' });
                this.enemyLasers.push({ x: bx + 20, y: by, vx: 120, vy: 280, color: '#ff007f' });
                this.sound.playAlienLaser();
            }

            // Laser vs Boss
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
                    this.spawnExplosion(l.x, l.y, '#ffea00', 6);

                    if (this.boss.hp <= 0) {
                        this.score += 500;
                        this.hudScore.textContent = this.score;
                        this.spawnExplosion(this.boss.x + this.boss.w / 2, this.boss.y + this.boss.h / 2, '#ff007f', 60);
                        this.sound.playExplosion();
                        this.sound.playVictory();
                        this.boss = null;
                        setTimeout(() => this.setupWave(this.wave + 1), 1200);
                        break;
                    }
                }
            }
            return;
        }

        // Alien Grid Movement
        if (this.aliens.length > 0) {
            let hitEdge = false;
            for (const a of this.aliens) {
                a.x += this.alienDir * this.alienSpeed * dt;
                if (a.x < 15 || a.x + a.w > this.width - 15) {
                    hitEdge = true;
                }
            }

            if (hitEdge) {
                this.alienDir *= -1;
                for (const a of this.aliens) {
                    a.y += this.alienDropDist;
                    // Check if aliens reach player defense line
                    if (a.y + a.h >= this.player.y) {
                        this.gameOver('INVASION REACHED SURFACE');
                        return;
                    }
                }
            }

            // Alien random shooting
            const now = performance.now();
            if (now > this.nextAlienFireTime) {
                this.nextAlienFireTime = now + Math.max(600, 1600 - this.wave * 150);
                const shooter = this.aliens[Math.floor(Math.random() * this.aliens.length)];
                if (shooter) {
                    this.enemyLasers.push({
                        x: shooter.x + shooter.w / 2,
                        y: shooter.y + shooter.h,
                        vx: 0,
                        vy: 240 + this.wave * 20,
                        color: shooter.color
                    });
                    this.sound.playAlienLaser();
                }
            }

            // Laser vs Aliens
            for (let li = this.lasers.length - 1; li >= 0; li--) {
                const l = this.lasers[li];
                for (let ai = this.aliens.length - 1; ai >= 0; ai--) {
                    const a = this.aliens[ai];
                    if (l.x > a.x && l.x < a.x + a.w && l.y > a.y && l.y < a.y + a.h) {
                        this.lasers.splice(li, 1);
                        this.score += a.pts;
                        this.hudScore.textContent = this.score;
                        this.spawnExplosion(a.x + a.w / 2, a.y + a.h / 2, a.color, 16);
                        this.sound.playExplosion();
                        this.aliens.splice(ai, 1);

                        // Speed up remaining aliens
                        this.alienSpeed += 2.5;

                        if (this.aliens.length === 0) {
                            this.sound.playVictory();
                            setTimeout(() => this.setupWave(this.wave + 1), 1000);
                        }
                        break;
                    }
                }
            }
        }
    }

    hitPlayer() {
        if (this.player.invulnerableTime > 0) return;
        this.lives--;
        this.updateLivesHUD();
        this.spawnExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#ff007f', 30);
        this.sound.playExplosion();

        if (this.lives <= 0) {
            this.gameOver('SHIP DESTROYED');
        } else {
            this.player.invulnerableTime = 2.0; // 2 sec invulnerability
        }
    }

    gameOver(reason = 'MISSION FAILED') {
        this.state = 'GAMEOVER';
        this.sound.playExplosion();

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('space_invaders_hs', this.highScore);
            this.hudBest.textContent = this.highScore;
        }

        this.goTitle.textContent = reason;
        this.goScore.textContent = this.score;
        this.goBest.textContent = this.highScore;
        this.screenGameOver.classList.remove('hidden');
    }

    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        if (this.state === 'PLAYING') {
            this.update(dt);
        }

        this.render();
        requestAnimationFrame((t) => this.loop(t));
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Stars Background
        for (const s of this.stars) {
            s.y += s.speed * 0.016;
            if (s.y > this.height) s.y = 0;
            this.ctx.fillStyle = s.color;
            this.ctx.globalAlpha = s.alpha;
            this.ctx.fillRect(s.x, s.y, s.size, s.size);
        }
        this.ctx.globalAlpha = 1;

        // 2. Lasers
        for (const l of this.lasers) {
            this.ctx.save();
            this.ctx.shadowColor = l.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(l.x - 2, l.y, 4, 18);
            this.ctx.fillStyle = l.color;
            this.ctx.fillRect(l.x - 1, l.y + 2, 2, 14);
            this.ctx.restore();
        }

        // 3. Enemy Lasers
        for (const el of this.enemyLasers) {
            this.ctx.save();
            this.ctx.shadowColor = el.color;
            this.ctx.shadowBlur = 8;
            this.ctx.fillStyle = el.color;
            this.ctx.beginPath();
            this.ctx.arc(el.x, el.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // 4. Aliens
        for (const a of this.aliens) {
            this.ctx.save();
            this.ctx.shadowColor = a.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = a.color;

            // Draw iconic space invader alien shapes
            if (a.type === 'commander') {
                // Top commander
                this.ctx.beginPath();
                this.ctx.roundRect(a.x + 4, a.y + 4, a.w - 8, a.h - 8, 4);
                this.ctx.fill();
                this.ctx.fillRect(a.x + 8, a.y, a.w - 16, 4);
                this.ctx.fillRect(a.x + 2, a.y + a.h - 4, 6, 4);
                this.ctx.fillRect(a.x + a.w - 8, a.y + a.h - 4, 6, 4);
                // Eyes
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(a.x + 10, a.y + 10, 4, 4);
                this.ctx.fillRect(a.x + a.w - 14, a.y + 10, 4, 4);
            } else if (a.type === 'drone') {
                // Middle drone
                this.ctx.beginPath();
                this.ctx.moveTo(a.x + a.w / 2, a.y);
                this.ctx.lineTo(a.x + a.w, a.y + a.h * 0.4);
                this.ctx.lineTo(a.x + a.w * 0.8, a.y + a.h);
                this.ctx.lineTo(a.x + a.w * 0.2, a.y + a.h);
                this.ctx.lineTo(a.x, a.y + a.h * 0.4);
                this.ctx.closePath();
                this.ctx.fill();
                // Eyes
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(a.x + a.w * 0.35, a.y + a.h * 0.45, 2.5, 0, Math.PI * 2);
                this.ctx.arc(a.x + a.w * 0.65, a.y + a.h * 0.45, 2.5, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Scout
                this.ctx.beginPath();
                this.ctx.roundRect(a.x + 2, a.y + 4, a.w - 4, a.h - 8, 6);
                this.ctx.fill();
                this.ctx.fillRect(a.x + 6, a.y + a.h - 4, 4, 6);
                this.ctx.fillRect(a.x + a.w - 10, a.y + a.h - 4, 4, 6);
                // Eyes
                this.ctx.fillStyle = '#070919';
                this.ctx.beginPath();
                this.ctx.arc(a.x + a.w * 0.35, a.y + a.h * 0.45, 3, 0, Math.PI * 2);
                this.ctx.arc(a.x + a.w * 0.65, a.y + a.h * 0.45, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        // 5. Boss
        if (this.boss) {
            this.ctx.save();
            this.ctx.shadowColor = '#ff007f';
            this.ctx.shadowBlur = 20;

            // Mothership Hull
            this.ctx.fillStyle = '#1e1b4b';
            this.ctx.strokeStyle = '#ff007f';
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.roundRect(this.boss.x, this.boss.y, this.boss.w, this.boss.h, 16);
            this.ctx.fill();
            this.ctx.stroke();

            // Cockpit & Cannons
            this.ctx.fillStyle = '#ffea00';
            this.ctx.beginPath();
            this.ctx.arc(this.boss.x + this.boss.w / 2, this.boss.y + 35, 18, 0, Math.PI * 2);
            this.ctx.fill();

            // Health Bar
            const hpPct = Math.max(0, this.boss.hp / this.boss.maxHp);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.fillRect(this.boss.x, this.boss.y - 14, this.boss.w, 6);
            this.ctx.fillStyle = hpPct > 0.4 ? '#00ff88' : '#ff007f';
            this.ctx.fillRect(this.boss.x, this.boss.y - 14, this.boss.w * hpPct, 6);

            this.ctx.restore();
        }

        // 6. Player Ship
        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            this.ctx.save();
            const px = this.player.x;
            const py = this.player.y;
            const pw = this.player.width;
            const ph = this.player.height;

            // Invulnerability blink
            if (this.player.invulnerableTime > 0 && Math.floor(Date.now() / 100) % 2 === 0) {
                this.ctx.globalAlpha = 0.4;
            }

            this.ctx.shadowColor = '#00f2fe';
            this.ctx.shadowBlur = 14;

            // Wings
            this.ctx.fillStyle = '#00f2fe';
            this.ctx.beginPath();
            this.ctx.moveTo(px + pw / 2, py);
            this.ctx.lineTo(px + pw, py + ph);
            this.ctx.lineTo(px + pw * 0.8, py + ph - 6);
            this.ctx.lineTo(px + pw * 0.2, py + ph - 6);
            this.ctx.lineTo(px, py + ph);
            this.ctx.closePath();
            this.ctx.fill();

            // Cockpit
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.moveTo(px + pw / 2, py + 6);
            this.ctx.lineTo(px + pw / 2 + 6, py + 24);
            this.ctx.lineTo(px + pw / 2 - 6, py + 24);
            this.ctx.closePath();
            this.ctx.fill();

            // Thruster Flames
            const flame = 8 + Math.random() * 8;
            this.ctx.fillStyle = '#ffea00';
            this.ctx.beginPath();
            this.ctx.moveTo(px + pw / 2 - 8, py + ph - 4);
            this.ctx.lineTo(px + pw / 2, py + ph + flame);
            this.ctx.lineTo(px + pw / 2 + 8, py + ph - 4);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        }

        // 7. Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * 0.016;
            p.y += p.vy * 0.016;
            p.alpha -= 0.025;

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
    window.game = new SpaceInvadersGame();
});
