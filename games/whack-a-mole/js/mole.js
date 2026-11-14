// Cyber Whack - Whack-a-Mole Arcade Engine
(function() {
  'use strict';

  // --- Sound Controller ---
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

    playWhack() {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.start(now);
        osc.stop(now + 0.13);
      } catch (e) {}
    }

    playGold() {
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [880, 1320, 1760].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.18, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.12);

          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.13);
        });
      } catch (e) {}
    }

    playChrono() {
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        [523.25, 659.25, 1046.5].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.18, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.15);

          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.16);
        });
      } catch (e) {}
    }

    playBomb() {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.start(now);
        osc.stop(now + 0.36);
      } catch (e) {}
    }

    playGameOver() {
      if (!this.ctx) return;
      try {
        const notes = [440, 392, 349, 261];
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.18, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.2);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.21);
        });
      } catch (e) {}
    }
  }

  const sound = new SoundController();

  // --- DOM Elements ---
  const holes = document.querySelectorAll('.hole');
  const timeVal = document.getElementById('timeVal');
  const scoreVal = document.getElementById('scoreVal');
  const comboVal = document.getElementById('comboVal');
  const bestVal = document.getElementById('bestVal');

  const startOverlay = document.getElementById('startOverlay');
  const pauseOverlay = document.getElementById('pauseOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');

  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const pauseRestartBtn = document.getElementById('pauseRestartBtn');
  const retryBtn = document.getElementById('retryBtn');

  const finalHits = document.getElementById('finalHits');
  const finalCombo = document.getElementById('finalCombo');
  const finalScore = document.getElementById('finalScore');
  const newRecordStatus = document.getElementById('newRecordStatus');

  // --- Game State ---
  let gameState = 'START'; // START, PLAYING, PAUSED, GAMEOVER
  let timeLeft = 60;
  let score = 0;
  let combo = 1;
  let maxCombo = 1;
  let botsWhacked = 0;
  let highScore = parseInt(localStorage.getItem('whack_mole_hs') || '0', 10);
  bestVal.textContent = highScore;

  let timerInterval = null;
  let spawnTimeout = null;
  let activeHoles = new Map(); // holeIndex -> { timeout, type }

  // Bot Types Definition
  const BOT_TYPES = [
    { type: 'standard', icon: '🤖', pts: '+10', weight: 60, basePts: 10, stayTime: 1100 },
    { type: 'gold',     icon: '⭐', pts: '+30', weight: 15, basePts: 30, stayTime: 750 },
    { type: 'chrono',   icon: '⌛', pts: '+5s', weight: 10, basePts: 10, stayTime: 850 },
    { type: 'bomb',     icon: '💣', pts: '-20', weight: 15, basePts: -20, stayTime: 1200 }
  ];

  function pickRandomBotType() {
    const totalWeight = BOT_TYPES.reduce((acc, b) => acc + b.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const b of BOT_TYPES) {
      if (rand < b.weight) return b;
      rand -= b.weight;
    }
    return BOT_TYPES[0];
  }

  function getAvailableHoles() {
    const available = [];
    holes.forEach((hole, idx) => {
      if (!activeHoles.has(idx)) {
        available.push(idx);
      }
    });
    return available;
  }

  function popupBot() {
    if (gameState !== 'PLAYING') return;

    const available = getAvailableHoles();
    if (available.length > 0) {
      const holeIdx = available[Math.floor(Math.random() * available.length)];
      const hole = holes[holeIdx];
      const botSlot = hole.querySelector('.bot-slot');
      const botType = pickRandomBotType();

      // Configure Bot Element
      botSlot.className = `bot-slot ${botType.type}`;
      botSlot.innerHTML = `
        <span class="bot-icon">${botType.icon}</span>
        <span class="bot-pts">${botType.pts}</span>
      `;

      hole.classList.add('up');

      // Stay duration scales slightly with time progression
      const stayDuration = Math.max(450, botType.stayTime - (60 - timeLeft) * 6);

      const hideTimeout = setTimeout(() => {
        hole.classList.remove('up');
        activeHoles.delete(holeIdx);
      }, stayDuration);

      activeHoles.set(holeIdx, { timeout: hideTimeout, type: botType.type, botConfig: botType });
    }

    // Schedule next popup (interval speeds up as time counts down)
    const nextDelay = Math.max(380, 850 - (60 - timeLeft) * 7);
    spawnTimeout = setTimeout(popupBot, nextDelay);
  }

  // Whack Handling
  function whackHole(holeIdx) {
    if (gameState !== 'PLAYING') return;
    const active = activeHoles.get(holeIdx);
    if (!active) return;

    const hole = holes[holeIdx];
    const botSlot = hole.querySelector('.bot-slot');
    if (botSlot.classList.contains('whacked')) return; // already hit

    clearTimeout(active.timeout);
    botSlot.classList.add('whacked');

    const botConfig = active.botConfig;

    if (botConfig.type === 'bomb') {
      // Hit a bomb!
      sound.playBomb();
      score = Math.max(0, score + botConfig.basePts);
      combo = 1;
    } else {
      // Hit a bot!
      botsWhacked++;
      if (botConfig.type === 'gold') {
        sound.playGold();
      } else if (botConfig.type === 'chrono') {
        sound.playChrono();
        timeLeft = Math.min(99, timeLeft + 5);
        timeVal.textContent = timeLeft + 's';
      } else {
        sound.playWhack();
      }

      // Add points with combo
      const gained = botConfig.basePts * combo;
      score += gained;
      combo = Math.min(5, combo + 1);
      if (combo > maxCombo) maxCombo = combo;
    }

    // Update HUD
    scoreVal.textContent = score;
    comboVal.textContent = `x${combo}`;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('whack_mole_hs', highScore.toString());
      bestVal.textContent = highScore;
    }

    // Retract bot after hit animation
    setTimeout(() => {
      hole.classList.remove('up');
      botSlot.classList.remove('whacked');
      activeHoles.delete(holeIdx);
    }, 180);
  }

  // Setup click / touch listeners on holes
  holes.forEach((hole, idx) => {
    let lastTap = 0;
    const handleHit = (e) => {
      e.preventDefault();
      const now = performance.now();
      if (now - lastTap < 100) return; // prevent ghost clicks
      lastTap = now;
      whackHole(idx);
    };

    hole.addEventListener('mousedown', handleHit);
    hole.addEventListener('touchstart', handleHit, { passive: false });
  });

  // --- Game Lifecycle ---
  function startGame() {
    sound.init();
    gameState = 'PLAYING';
    timeLeft = 60;
    score = 0;
    combo = 1;
    maxCombo = 1;
    botsWhacked = 0;
    activeHoles.clear();

    // Reset UI
    timeVal.textContent = '60s';
    timeVal.classList.remove('urgent');
    scoreVal.textContent = '0';
    comboVal.textContent = 'x1';

    holes.forEach(h => {
      h.classList.remove('up');
      const b = h.querySelector('.bot-slot');
      if (b) b.classList.remove('whacked');
    });

    startOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    // Timer Interval
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (gameState === 'PLAYING') {
        timeLeft--;
        timeVal.textContent = timeLeft + 's';

        if (timeLeft <= 10) {
          timeVal.classList.add('urgent');
        }

        if (timeLeft <= 0) {
          endGame();
        }
      }
    }, 1000);

    // Start Popups
    clearTimeout(spawnTimeout);
    popupBot();
  }

  function pauseGame() {
    if (gameState !== 'PLAYING') return;
    gameState = 'PAUSED';
    clearTimeout(spawnTimeout);
    pauseOverlay.classList.remove('hidden');
  }

  function resumeGame() {
    if (gameState !== 'PAUSED') return;
    gameState = 'PLAYING';
    pauseOverlay.classList.add('hidden');
    popupBot();
  }

  function endGame() {
    gameState = 'GAMEOVER';
    clearInterval(timerInterval);
    clearTimeout(spawnTimeout);
    sound.playGameOver();

    // Retract all active bots
    holes.forEach(h => h.classList.remove('up'));
    activeHoles.clear();

    const isNewRecord = score > highScore;
    if (isNewRecord) {
      highScore = score;
      localStorage.setItem('whack_mole_hs', highScore.toString());
      bestVal.textContent = highScore;
    }

    finalHits.textContent = botsWhacked;
    finalCombo.textContent = `x${maxCombo}`;
    finalScore.textContent = score;
    newRecordStatus.textContent = isNewRecord ? '🔥 NEW HIGH!' : 'NO';
    newRecordStatus.style.color = isNewRecord ? '#39ff14' : '#8c90ad';

    gameOverOverlay.classList.remove('hidden');
  }

  // Button Listeners
  startBtn.addEventListener('click', startGame);
  pauseBtn.addEventListener('click', () => {
    if (gameState === 'PLAYING') pauseGame();
    else if (gameState === 'PAUSED') resumeGame();
  });
  resumeBtn.addEventListener('click', resumeGame);
  pauseRestartBtn.addEventListener('click', startGame);
  retryBtn.addEventListener('click', startGame);
})();
