// Neon Rush - Synthwave Endless Runner
(function() {
  'use strict';

  // --- Audio Synthesis ---
  class SoundController {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playJump(isDouble = false) {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;
        const startFreq = isDouble ? 440 : 260;
        const endFreq = isDouble ? 880 : 540;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.16);
      } catch (e) {}
    }

    playSlide() {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.start(now);
        osc.stop(now + 0.21);
      } catch (e) {}
    }

    playCoin() {
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [987.77, 1318.51].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.15, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.12);

          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.13);
        });
      } catch (e) {}
    }

    playPowerup() {
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.18, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.15);

          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.16);
        });
      } catch (e) {}
    }

    playCrash() {
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

        osc.start(now);
        osc.stop(now + 0.46);
      } catch (e) {}
    }
  }

  const sound = new SoundController();

  // --- Game Canvas & Configuration ---
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const WIDTH = 900;
  const HEIGHT = 480;
  const GROUND_Y = 400;

  // DOM Elements
  const distanceVal = document.getElementById('distanceVal');
  const coinVal = document.getElementById('coinVal');
  const scoreVal = document.getElementById('scoreVal');
  const bestVal = document.getElementById('bestVal');
  const shieldBadge = document.getElementById('shieldBadge');
  const magnetBadge = document.getElementById('magnetBadge');

  const startOverlay = document.getElementById('startOverlay');
  const pauseOverlay = document.getElementById('pauseOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');

  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const pauseRestartBtn = document.getElementById('pauseRestartBtn');
  const retryBtn = document.getElementById('retryBtn');

  const finalDist = document.getElementById('finalDist');
  const finalCoins = document.getElementById('finalCoins');
  const finalScore = document.getElementById('finalScore');
  const newRecordStatus = document.getElementById('newRecordStatus');

  const touchJump = document.getElementById('touchJump');
  const touchSlide = document.getElementById('touchSlide');

  // Game State
  let gameState = 'START'; // START, PLAYING, PAUSED, GAMEOVER
  let distance = 0;
  let coins = 0;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('neon_rush_hs') || '0', 10);
  bestVal.textContent = highScore;

  let speed = 6.5;
  const BASE_SPEED = 6.5;
  const MAX_SPEED = 14;

  let animationFrameId = null;
  let lastTime = 0;

  // Parallax Background Stars & Grid
  const stars = [];
  for (let i = 0; i < 70; i++) {
    stars.push({
      x: Math.random() * WIDTH,
      y: Math.random() * (GROUND_Y - 80),
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.4 + 0.1
    });
  }

  let gridOffset = 0;

  // Player Definition
  const player = {
    x: 130,
    y: GROUND_Y - 54,
    w: 30,
    h: 54,
    standH: 54,
    slideH: 26,
    vy: 0,
    gravity: 0.72,
    jumpForce: -13.5,
    isJumping: false,
    jumpCount: 0,
    maxJumps: 2,
    isSliding: false,
    slideTimer: 0,
    shield: false,
    shieldTimer: 0,
    magnet: false,
    magnetTimer: 0,
    legCycle: 0,
    trail: []
  };

  // World Entities
  let obstacles = [];
  let pickups = [];
  let particles = [];
  let nextObstacleDist = 50;
  let nextPickupDist = 20;

  function resetPlayer() {
    player.y = GROUND_Y - player.standH;
    player.h = player.standH;
    player.vy = 0;
    player.isJumping = false;
    player.jumpCount = 0;
    player.isSliding = false;
    player.slideTimer = 0;
    player.shield = false;
    player.shieldTimer = 0;
    player.magnet = false;
    player.magnetTimer = 0;
    player.trail = [];
  }

  function startRun() {
    sound.init();
    gameState = 'PLAYING';
    distance = 0;
    coins = 0;
    score = 0;
    speed = BASE_SPEED;
    obstacles = [];
    pickups = [];
    particles = [];
    nextObstacleDist = 80;
    nextPickupDist = 30;
    gridOffset = 0;
    resetPlayer();

    startOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    shieldBadge.classList.add('hidden');
    magnetBadge.classList.add('hidden');

    lastTime = performance.now();
    cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function pauseGame() {
    if (gameState !== 'PLAYING') return;
    gameState = 'PAUSED';
    pauseOverlay.classList.remove('hidden');
  }

  function resumeGame() {
    if (gameState !== 'PAUSED') return;
    gameState = 'PLAYING';
    pauseOverlay.classList.add('hidden');
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function triggerGameOver() {
    gameState = 'GAMEOVER';
    sound.playCrash();

    // Calculate final score
    score = Math.floor(distance) + coins * 50;
    const isNewHigh = score > highScore;
    if (isNewHigh) {
      highScore = score;
      localStorage.setItem('neon_rush_hs', highScore.toString());
      bestVal.textContent = highScore;
    }

    finalDist.textContent = Math.floor(distance) + ' m';
    finalCoins.textContent = coins;
    finalScore.textContent = score;
    newRecordStatus.textContent = isNewHigh ? '🔥 YES!' : 'NO';
    newRecordStatus.style.color = isNewHigh ? '#39ff14' : '#8c90ad';

    gameOverOverlay.classList.remove('hidden');
  }

  // --- Player Actions ---
  function jump() {
    if (gameState !== 'PLAYING') return;
    if (player.jumpCount < player.maxJumps) {
      if (player.isSliding) {
        player.isSliding = false;
        player.h = player.standH;
      }
      player.vy = player.jumpForce;
      player.isJumping = true;
      player.jumpCount++;
      sound.playJump(player.jumpCount === 2);

      // Jump dust particles
      createBurst(player.x + player.w / 2, player.y + player.h, '#00f3ff', 8);
    }
  }

  function slide() {
    if (gameState !== 'PLAYING') return;
    if (!player.isSliding && !player.isJumping) {
      player.isSliding = true;
      player.h = player.slideH;
      player.y = GROUND_Y - player.slideH;
      player.slideTimer = 40; // frames
      sound.playSlide();

      // Slide spark particles
      createBurst(player.x, GROUND_Y, '#ff007f', 6);
    }
  }

  function endSlide() {
    if (player.isSliding) {
      player.isSliding = false;
      player.h = player.standH;
      player.y = GROUND_Y - player.standH;
    }
  }

  // --- Spawning Logic ---
  function spawnObstacle() {
    // 3 Types: 
    // 1. Spikes / Hurdles (Ground obstacle - Jump)
    // 2. High Laser Gate (Aerial laser - Slide)
    // 3. Tall Barrier (High jump / Double jump required)
    const rand = Math.random();
    if (rand < 0.45) {
      // Ground Spikes
      obstacles.push({
        type: 'spike',
        x: WIDTH + 30,
        y: GROUND_Y - 32,
        w: 36,
        h: 32,
        color: '#ff007f'
      });
    } else if (rand < 0.78) {
      // High Laser Gate (Slide under: bottom clears ground by 34px)
      obstacles.push({
        type: 'laser',
        x: WIDTH + 30,
        y: GROUND_Y - 95,
        w: 42,
        h: 58,
        color: '#00f3ff'
      });
    } else {
      // Cyber Drone / Floating mine (mid-height)
      obstacles.push({
        type: 'drone',
        x: WIDTH + 30,
        y: GROUND_Y - 60,
        w: 32,
        h: 32,
        baseY: GROUND_Y - 60,
        bob: 0,
        color: '#ffaa00'
      });
    }
  }

  function spawnPickups() {
    const rand = Math.random();
    const spawnY = Math.random() > 0.4 ? GROUND_Y - 35 : GROUND_Y - 90;

    if (rand < 0.8) {
      // Coin arc or line
      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) {
        pickups.push({
          type: 'coin',
          x: WIDTH + 30 + i * 35,
          y: spawnY,
          w: 18,
          h: 18,
          collected: false
        });
      }
    } else if (rand < 0.9) {
      // Shield Powerup
      pickups.push({
        type: 'shield',
        x: WIDTH + 30,
        y: GROUND_Y - 50,
        w: 24,
        h: 24,
        collected: false
      });
    } else {
      // Magnet Powerup
      pickups.push({
        type: 'magnet',
        x: WIDTH + 30,
        y: GROUND_Y - 50,
        w: 24,
        h: 24,
        collected: false
      });
    }
  }

  function createBurst(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        decay: Math.random() * 0.04 + 0.02,
        size: Math.random() * 3 + 2,
        color: color
      });
    }
  }

  // --- Collision Helper ---
  function rectIntersect(r1, r2) {
    return !(
      r2.x > r1.x + r1.w ||
      r2.x + r2.w < r1.x ||
      r2.y > r1.y + r1.h ||
      r2.y + r2.h < r1.y
    );
  }

  // --- Update Loop ---
  function update(dt) {
    // Speed progression
    speed = Math.min(MAX_SPEED, BASE_SPEED + (distance / 250));
    distance += (speed * 0.05);

    // Update HUD
    distanceVal.textContent = Math.floor(distance) + ' m';
    coinVal.textContent = coins;
    score = Math.floor(distance) + coins * 50;
    scoreVal.textContent = score;

    // Powerup Timers
    if (player.shield) {
      player.shieldTimer -= dt;
      if (player.shieldTimer <= 0) {
        player.shield = false;
        shieldBadge.classList.add('hidden');
      }
    }
    if (player.magnet) {
      player.magnetTimer -= dt;
      if (player.magnetTimer <= 0) {
        player.magnet = false;
        magnetBadge.classList.add('hidden');
      }
    }

    // Grid scrolling
    gridOffset = (gridOffset + speed) % 40;

    // Starfield scrolling
    stars.forEach(s => {
      s.x -= s.speed * (speed / 3);
      if (s.x < 0) s.x = WIDTH;
    });

    // Player Physics
    if (player.isJumping) {
      player.y += player.vy;
      player.vy += player.gravity;

      if (player.y >= GROUND_Y - player.h) {
        player.y = GROUND_Y - player.h;
        player.vy = 0;
        player.isJumping = false;
        player.jumpCount = 0;
      }
    } else if (player.isSliding) {
      player.slideTimer--;
      if (player.slideTimer <= 0) {
        endSlide();
      }
    }

    // Player running leg animation cycle
    player.legCycle += speed * 0.1;

    // Player Motion Trail
    if (Math.random() < 0.4) {
      player.trail.push({
        x: player.x,
        y: player.y,
        w: player.w,
        h: player.h,
        alpha: 0.5
      });
    }
    player.trail.forEach(t => {
      t.x -= speed * 0.5;
      t.alpha -= 0.04;
    });
    player.trail = player.trail.filter(t => t.alpha > 0);

    // Spawning Spacing
    nextObstacleDist -= speed * 0.1;
    if (nextObstacleDist <= 0) {
      spawnObstacle();
      nextObstacleDist = Math.random() * 45 + 55;
    }

    nextPickupDist -= speed * 0.1;
    if (nextPickupDist <= 0) {
      spawnPickups();
      nextPickupDist = Math.random() * 60 + 40;
    }

    // Update Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.x -= speed;

      if (obs.type === 'drone') {
        obs.bob += 0.08;
        obs.y = obs.baseY + Math.sin(obs.bob) * 12;
      }

      // Check collision with player
      const pRect = { x: player.x, y: player.y, w: player.w, h: player.h };
      if (rectIntersect(pRect, obs)) {
        if (player.shield) {
          // Shield absorbs the hit!
          player.shield = false;
          shieldBadge.classList.add('hidden');
          createBurst(obs.x + obs.w / 2, obs.y + obs.h / 2, '#00f3ff', 20);
          sound.playPowerup();
          obstacles.splice(i, 1);
          continue;
        } else {
          // Crash!
          createBurst(player.x + player.w / 2, player.y + player.h / 2, '#ff007f', 30);
          triggerGameOver();
          return;
        }
      }

      if (obs.x + obs.w < -50) {
        obstacles.splice(i, 1);
      }
    }

    // Update Pickups
    for (let i = pickups.length - 1; i >= 0; i--) {
      const item = pickups[i];
      item.x -= speed;

      // Magnet attraction
      if (player.magnet && item.type === 'coin') {
        const dx = (player.x + player.w / 2) - item.x;
        const dy = (player.y + player.h / 2) - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 260) {
          item.x += (dx / dist) * 10;
          item.y += (dy / dist) * 10;
        }
      }

      // Collect pickup
      const pRect = { x: player.x, y: player.y, w: player.w, h: player.h };
      if (rectIntersect(pRect, item)) {
        if (item.type === 'coin') {
          coins++;
          sound.playCoin();
          createBurst(item.x, item.y, '#ffd700', 8);
        } else if (item.type === 'shield') {
          player.shield = true;
          player.shieldTimer = 10000; // 10s
          shieldBadge.classList.remove('hidden');
          sound.playPowerup();
          createBurst(item.x, item.y, '#00f3ff', 16);
        } else if (item.type === 'magnet') {
          player.magnet = true;
          player.magnetTimer = 8000; // 8s
          magnetBadge.classList.remove('hidden');
          sound.playPowerup();
          createBurst(item.x, item.y, '#ffd700', 16);
        }
        pickups.splice(i, 1);
        continue;
      }

      if (item.x + item.w < -50) {
        pickups.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  // --- Render Loop ---
  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // 1. Sky Gradient & Stars
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, '#060312');
    skyGrad.addColorStop(0.6, '#18072b');
    skyGrad.addColorStop(1, '#3b0d45');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, WIDTH, GROUND_Y);

    // Synthwave Sun
    const sunGrad = ctx.createRadialGradient(WIDTH / 2, GROUND_Y - 40, 10, WIDTH / 2, GROUND_Y - 40, 90);
    sunGrad.addColorStop(0, '#fff455');
    sunGrad.addColorStop(0.3, '#ff007f');
    sunGrad.addColorStop(1, 'rgba(255, 0, 127, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(WIDTH / 2, GROUND_Y - 40, 90, Math.PI, 0, false);
    ctx.fill();

    // Distant Synthwave Horizon Mountains
    ctx.fillStyle = '#160829';
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    for (let x = 0; x <= WIDTH; x += 100) {
      const peakY = GROUND_Y - 50 - Math.sin(x * 0.02) * 35;
      ctx.lineTo(x, peakY);
    }
    ctx.lineTo(WIDTH, GROUND_Y);
    ctx.closePath();
    ctx.fill();

    // Stars
    ctx.fillStyle = '#ffffff';
    stars.forEach(s => {
      ctx.globalAlpha = Math.random() * 0.4 + 0.6;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    ctx.globalAlpha = 1;

    // 2. Cyber Highway Floor (Grid)
    const floorGrad = ctx.createLinearGradient(0, GROUND_Y, 0, HEIGHT);
    floorGrad.addColorStop(0, '#220038');
    floorGrad.addColorStop(1, '#090014');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

    // Glowing Neon Floor Border
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(WIDTH, GROUND_Y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Moving Vertical Grid Lines
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.4)';
    ctx.lineWidth = 1.5;
    for (let x = -gridOffset; x < WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x - 50, HEIGHT);
      ctx.stroke();
    }

    // Horizontal Floor Lines
    for (let y = GROUND_Y + 18; y < HEIGHT; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }

    // 3. Draw Player Trails
    player.trail.forEach(t => {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = '#00f3ff';
      ctx.fillRect(t.x, t.y, t.w, t.h);
      ctx.restore();
    });

    // 4. Draw Player
    ctx.save();
    // Shield Aura
    if (player.shield) {
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(player.x + player.w / 2, player.y + player.h / 2, Math.max(player.w, player.h) * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Magnet Glow
    if (player.magnet) {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(player.x + player.w / 2, player.y + player.h / 2, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Runner Body
    ctx.fillStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 10;

    if (player.isSliding) {
      // Sliding posture (low cyber sled)
      ctx.fillRect(player.x - 6, player.y + 4, player.w + 16, player.h - 4);
      // Visor
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(player.x + player.w + 4, player.y + 8, 8, 8);
    } else {
      // Torso & head
      ctx.fillRect(player.x + 6, player.y, player.w - 12, player.h - 18);
      // Cyber Visor
      ctx.fillStyle = '#ff007f';
      ctx.shadowColor = '#ff007f';
      ctx.fillRect(player.x + player.w - 10, player.y + 4, 12, 8);

      // Running Legs Animation
      ctx.fillStyle = '#00f3ff';
      const leg1Offset = Math.sin(player.legCycle) * 12;
      const leg2Offset = -leg1Offset;
      ctx.fillRect(player.x + 6, player.y + player.h - 18, 6, 18 + (player.isJumping ? -4 : leg1Offset * 0.5));
      ctx.fillRect(player.x + player.w - 12, player.y + player.h - 18, 6, 18 + (player.isJumping ? -4 : leg2Offset * 0.5));
    }
    ctx.restore();

    // 5. Draw Obstacles
    obstacles.forEach(obs => {
      ctx.save();
      ctx.shadowColor = obs.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = obs.color;

      if (obs.type === 'spike') {
        // Neon triangular spike barrier
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.h);
        ctx.lineTo(obs.x + obs.w / 2, obs.y);
        ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
        ctx.closePath();
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(obs.x + 8, obs.y + obs.h - 2);
        ctx.lineTo(obs.x + obs.w / 2, obs.y + 8);
        ctx.lineTo(obs.x + obs.w - 8, obs.y + obs.h - 2);
        ctx.closePath();
        ctx.fill();
      } else if (obs.type === 'laser') {
        // High laser gate (Must slide under!)
        ctx.fillStyle = 'rgba(0, 243, 255, 0.85)';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        // Warning emitter brackets
        ctx.fillStyle = '#ff007f';
        ctx.fillRect(obs.x - 4, obs.y - 6, obs.w + 8, 8);
        ctx.fillRect(obs.x - 4, obs.y + obs.h - 2, obs.w + 8, 8);

        // Pulsing warning text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Orbitron';
        ctx.fillText('SLIDE', obs.x + 4, obs.y + obs.h / 2 + 4);
      } else if (obs.type === 'drone') {
        // Cyber floating mine
        ctx.beginPath();
        ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(obs.x + obs.w / 2 - 3, obs.y + obs.h / 2 - 3, 6, 6);
      }
      ctx.restore();
    });

    // 6. Draw Pickups
    pickups.forEach(item => {
      ctx.save();
      if (item.type === 'coin') {
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(item.x + item.w / 2, item.y + item.h / 2, item.w / 2, 0, Math.PI * 2);
        ctx.fill();
        // Inner ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(item.x + item.w / 2, item.y + item.h / 2, item.w / 4, 0, Math.PI * 2);
        ctx.stroke();
      } else if (item.type === 'shield') {
        ctx.fillStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 12;
        ctx.font = '20px sans-serif';
        ctx.fillText('🛡️', item.x, item.y + 20);
      } else if (item.type === 'magnet') {
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 12;
        ctx.font = '20px sans-serif';
        ctx.fillText('🧲', item.x, item.y + 20);
      }
      ctx.restore();
    });

    // 7. Draw Particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    });
  }

  // --- Main Animation Frame ---
  function gameLoop(timestamp) {
    if (gameState === 'PLAYING') {
      const dt = timestamp - lastTime;
      lastTime = timestamp;
      update(dt);
      draw();
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  // --- Input Handlers ---
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'Space', ' '].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
      if (gameState === 'START') {
        startRun();
      } else if (gameState === 'PLAYING') {
        jump();
      }
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      if (gameState === 'PLAYING') {
        slide();
      }
    } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      if (gameState === 'PLAYING') pauseGame();
      else if (gameState === 'PAUSED') resumeGame();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      endSlide();
    }
  });

  // Touch Controls
  if (touchJump) {
    touchJump.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (gameState === 'PLAYING') jump();
    });
    touchJump.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (gameState === 'PLAYING') jump();
    });
  }

  if (touchSlide) {
    touchSlide.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (gameState === 'PLAYING') slide();
    });
    touchSlide.addEventListener('touchend', (e) => {
      e.preventDefault();
      endSlide();
    });
    touchSlide.addEventListener('mousedown', (e) => {
      e.preventDefault();
      if (gameState === 'PLAYING') slide();
    });
    touchSlide.addEventListener('mouseup', (e) => {
      e.preventDefault();
      endSlide();
    });
  }

  // Swipe detection on canvas
  let touchStartY = 0;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', (e) => {
    if (e.changedTouches.length > 0) {
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      if (deltaY < -30) {
        jump();
      } else if (deltaY > 30) {
        slide();
        setTimeout(endSlide, 450);
      }
    }
  }, { passive: true });

  // Buttons
  startBtn.addEventListener('click', startRun);
  pauseBtn.addEventListener('click', () => {
    if (gameState === 'PLAYING') pauseGame();
    else if (gameState === 'PAUSED') resumeGame();
  });
  resumeBtn.addEventListener('click', resumeGame);
  pauseRestartBtn.addEventListener('click', startRun);
  retryBtn.addEventListener('click', startRun);

  // Initial draw of backdrop
  draw();
})();
