/**
 * Memory Master - Advanced Cyber Arcade Brain Trainer
 * Features:
 * - 4 Selectable Game Modes: Classic, Timed, Hardcore, Reverse
 * - 20 Progressive Levels with dynamic speed ramps & decoy visual pulses
 * - Full Scoring System with Streak Multipliers (x1 to x5) & Speed Bonuses
 * - Separate High Scores per mode saved in localStorage
 * - Web Audio API Synthesizer with 4 harmonic notes, chimes, countdown & error buzz
 * - Circular SVG countdown timer ring for Timed mode
 * - 3-2-1 Animated Ready Countdown before round playback
 * - Comprehensive Desktop (1-4, QWAS, Arrows, P, M) & Mobile Touch Controls with ghost-tap prevention
 */

(function () {
  'use strict';

  // --- Sound Controller (Web Audio API) ---
  class SoundController {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('memory_master_sound_muted') === 'true';
      this.padFreqs = [329.63, 440.00, 554.37, 659.25]; // E4, A4, C#5, E5
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
      localStorage.setItem('memory_master_sound_muted', this.muted ? 'true' : 'false');
      return !this.muted;
    }

    playPadTone(padIndex, duration = 0.22) {
      if (this.muted || !this.ctx) return;
      try {
        const freq = this.padFreqs[padIndex] || 440;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration + 0.02);
      } catch (_) {}
    }

    playCountdownTick() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } catch (_) {}
    }

    playCountdownGo() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(980, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.18);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
      } catch (_) {}
    }

    playRoundSuccess() {
      if (this.muted || !this.ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.2, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.19);
        });
      } catch (_) {}
    }

    playErrorTone() {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(125, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.38);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } catch (_) {}
    }
  }

  // --- Main Memory Master Game Engine ---
  class MemoryMasterGame {
    constructor() {
      this.sound = new SoundController();

      // DOM Pads
      this.pads = [
        document.getElementById('pad0'),
        document.getElementById('pad1'),
        document.getElementById('pad2'),
        document.getElementById('pad3')
      ];

      // Console Elements
      this.consoleWrapper = document.getElementById('consoleWrapper');
      this.centerHub = document.getElementById('centerHub');
      this.hubStatus = document.getElementById('hubStatus');
      this.hubSubStatus = document.getElementById('hubSubStatus');
      this.timerCircleProgress = document.getElementById('timerCircleProgress');
      this.timerBarContainer = document.getElementById('timerBarContainer');
      this.timerBarFill = document.getElementById('timerBarFill');
      this.countdownOverlay = document.getElementById('countdownOverlay');
      this.countdownNumber = document.getElementById('countdownNumber');
      this.comboPopup = document.getElementById('comboPopup');

      // Top Nav & HUD
      this.currentModeTag = document.getElementById('currentModeTag');
      this.hudLevel = document.getElementById('hudLevel');
      this.hudScore = document.getElementById('hudScore');
      this.hudStreak = document.getElementById('hudStreak');
      this.hudBest = document.getElementById('hudBest');
      this.btnSoundToggle = document.getElementById('btnSoundToggle');
      this.btnPause = document.getElementById('btnPause');

      // Screens & Modals
      this.screenMenu = document.getElementById('screenMenu');
      this.screenHelp = document.getElementById('screenHelp');
      this.screenPause = document.getElementById('screenPause');
      this.screenGameOver = document.getElementById('screenGameOver');

      // Mode Selection Cards
      this.modeCards = document.querySelectorAll('.mode-card');
      this.btnLaunchMode = document.getElementById('btnLaunchMode');
      this.btnOpenHelp = document.getElementById('btnOpenHelp');
      this.btnCloseHelp = document.getElementById('btnCloseHelp');

      // Pause Actions
      this.btnResume = document.getElementById('btnResume');
      this.btnRestart = document.getElementById('btnRestart');
      this.btnChangeMode = document.getElementById('btnChangeMode');

      // Game Over Elements
      this.goTitle = document.getElementById('goTitle');
      this.goSubtitle = document.getElementById('goSubtitle');
      this.goFinalScore = document.getElementById('goFinalScore');
      this.goFinalLevel = document.getElementById('goFinalLevel');
      this.goFinalStreak = document.getElementById('goFinalStreak');
      this.goBestRecord = document.getElementById('goBestRecord');
      this.goRecordBanner = document.getElementById('goRecordBanner');
      this.btnPlayAgain = document.getElementById('btnPlayAgain');
      this.btnGoMenu = document.getElementById('btnGoMenu');

      // Best Score Elements on Menu Cards
      this.bestEls = {
        classic: document.getElementById('bestClassic'),
        timed: document.getElementById('bestTimed'),
        hardcore: document.getElementById('bestHardcore'),
        reverse: document.getElementById('bestReverse')
      };

      // Game State
      this.selectedMode = 'classic'; // 'classic', 'timed', 'hardcore', 'reverse'
      this.state = 'MENU'; // 'MENU', 'COUNTDOWN', 'WATCHING', 'PLAYING', 'ROUND_SUCCESS', 'PAUSED', 'GAMEOVER'
      this.level = 1;
      this.maxLevels = 20;
      this.score = 0;
      this.streak = 1;
      this.maxStreakAchieved = 1;

      // Sequence & Timers (prevent memory leaks & duplicate loops on restart)
      this.sequence = [];
      this.playerStep = 0;
      this.playbackIntervalId = null;
      this.countdownIntervalId = null;
      this.turnStartTimeoutId = null;
      this.nextRoundTimeoutId = null;
      this.gameOverTimeoutId = null;
      this.comboTimeoutId = null;
      this.shakeTimeoutId = null;
      this.pulseTimeoutId = null;
      this.flashTimeoutIds = [];

      // Timed Mode Clock
      this.timerDuration = 0;
      this.timerRemaining = 0;
      this.timerIntervalId = null;
      this.timerCircleLength = 339.29; // 2 * PI * 54

      // Input Debounce
      this.lastInputTime = 0;

      this.init();
    }

    init() {
      this.updateSoundButtonUI();
      this.refreshMenuBestScores();
      this.bindEvents();
    }

    updateSoundButtonUI() {
      if (this.btnSoundToggle) {
        this.btnSoundToggle.textContent = this.sound.muted ? '🔇' : '🔊';
      }
    }

    getHighScores() {
      return {
        classic: parseInt(localStorage.getItem('memory_master_hs_classic') || '0', 10),
        timed: parseInt(localStorage.getItem('memory_master_hs_timed') || '0', 10),
        hardcore: parseInt(localStorage.getItem('memory_master_hs_hardcore') || '0', 10),
        reverse: parseInt(localStorage.getItem('memory_master_hs_reverse') || '0', 10)
      };
    }

    saveHighScore(mode, newScore) {
      const key = `memory_master_hs_${mode}`;
      const current = parseInt(localStorage.getItem(key) || '0', 10);
      if (newScore > current) {
        localStorage.setItem(key, newScore.toString());
        return true;
      }
      return false;
    }

    refreshMenuBestScores() {
      const scores = this.getHighScores();
      if (this.bestEls.classic) this.bestEls.classic.textContent = scores.classic;
      if (this.bestEls.timed) this.bestEls.timed.textContent = scores.timed;
      if (this.bestEls.hardcore) this.bestEls.hardcore.textContent = scores.hardcore;
      if (this.bestEls.reverse) this.bestEls.reverse.textContent = scores.reverse;
    }

    bindEvents() {
      // Sound Toggle
      this.btnSoundToggle?.addEventListener('click', () => {
        this.sound.init();
        this.sound.toggle();
        this.updateSoundButtonUI();
      });

      // Pause & Resume
      this.btnPause?.addEventListener('click', () => this.togglePause());
      this.btnResume?.addEventListener('click', () => this.togglePause());
      this.btnRestart?.addEventListener('click', () => this.startNewGame(this.selectedMode));
      this.btnChangeMode?.addEventListener('click', () => this.openMainMenu());

      // Help Modal
      this.btnOpenHelp?.addEventListener('click', () => {
        this.screenHelp?.classList.remove('hidden');
      });
      this.btnCloseHelp?.addEventListener('click', () => {
        this.screenHelp?.classList.add('hidden');
      });

      // Mode Selection Cards
      this.modeCards.forEach(card => {
        card.addEventListener('click', () => {
          this.sound.init();
          this.sound.playCountdownTick();
          this.modeCards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          this.selectedMode = card.getAttribute('data-mode') || 'classic';
        });
      });

      // Launch Mode Button
      this.btnLaunchMode?.addEventListener('click', () => {
        this.sound.init();
        this.startNewGame(this.selectedMode);
      });

      // Game Over Actions
      this.btnPlayAgain?.addEventListener('click', () => {
        this.sound.init();
        this.startNewGame(this.selectedMode);
      });
      this.btnGoMenu?.addEventListener('click', () => {
        this.openMainMenu();
      });

      // Pad Interaction (Mouse & Touch with ghost-tap prevention)
      this.pads.forEach((pad, idx) => {
        const handlePadTrigger = (e) => {
          e.preventDefault();
          const now = performance.now();
          if (now - this.lastInputTime < 110) return; // Debounce double trigger
          this.lastInputTime = now;
          this.handlePlayerInput(idx);
        };

        pad.addEventListener('mousedown', handlePadTrigger);
        pad.addEventListener('touchstart', handlePadTrigger, { passive: false });
      });

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        if (['1', '2', '3', '4', 'q', 'w', 'a', 's', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown', ' '].includes(e.key)) {
          if (this.state === 'PLAYING') e.preventDefault();
        }

        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          if (this.state === 'PLAYING' || this.state === 'WATCHING' || this.state === 'PAUSED') {
            this.togglePause();
          }
          return;
        }

        if (e.key === 'm' || e.key === 'M') {
          this.sound.init();
          this.sound.toggle();
          this.updateSoundButtonUI();
          return;
        }

        if (this.state !== 'PLAYING') return;

        const k = e.key.toLowerCase();
        if (k === '1' || k === 'q' || e.key === 'ArrowUp') {
          this.handlePlayerInput(0);
        } else if (k === '2' || k === 'w' || e.key === 'ArrowRight') {
          this.handlePlayerInput(1);
        } else if (k === '3' || k === 'a' || e.key === 'ArrowLeft') {
          this.handlePlayerInput(2);
        } else if (k === '4' || k === 's' || e.key === 'ArrowDown') {
          this.handlePlayerInput(3);
        }
      });
    }

    clearAllTimers() {
      if (this.countdownIntervalId) {
        clearInterval(this.countdownIntervalId);
        this.countdownIntervalId = null;
      }
      if (this.playbackIntervalId) {
        clearInterval(this.playbackIntervalId);
        this.playbackIntervalId = null;
      }
      if (this.timerIntervalId) {
        clearInterval(this.timerIntervalId);
        this.timerIntervalId = null;
      }
      if (this.turnStartTimeoutId) {
        clearTimeout(this.turnStartTimeoutId);
        this.turnStartTimeoutId = null;
      }
      if (this.nextRoundTimeoutId) {
        clearTimeout(this.nextRoundTimeoutId);
        this.nextRoundTimeoutId = null;
      }
      if (this.gameOverTimeoutId) {
        clearTimeout(this.gameOverTimeoutId);
        this.gameOverTimeoutId = null;
      }
      if (this.comboTimeoutId) {
        clearTimeout(this.comboTimeoutId);
        this.comboTimeoutId = null;
      }
      if (this.shakeTimeoutId) {
        clearTimeout(this.shakeTimeoutId);
        this.shakeTimeoutId = null;
      }
      if (this.pulseTimeoutId) {
        clearTimeout(this.pulseTimeoutId);
        this.pulseTimeoutId = null;
      }
      if (Array.isArray(this.flashTimeoutIds)) {
        this.flashTimeoutIds.forEach(id => clearTimeout(id));
        this.flashTimeoutIds = [];
      }
      if (Array.isArray(this.pads)) {
        this.pads.forEach(p => p.classList.remove('active'));
      }
      this.countdownOverlay?.classList.add('hidden');
      this.consoleWrapper?.classList.remove('glitch-shake');
      this.comboPopup?.classList.add('hidden');
    }

    openMainMenu() {
      this.clearAllTimers();
      this.state = 'MENU';

      this.screenPause?.classList.add('hidden');
      this.screenGameOver?.classList.add('hidden');
      this.screenHelp?.classList.add('hidden');
      this.countdownOverlay?.classList.add('hidden');
      this.timerBarContainer?.classList.add('hidden');

      this.hubStatus.textContent = 'READY';
      this.hubSubStatus.textContent = 'SELECT MODE';
      this.resetTimerCircle();

      this.refreshMenuBestScores();
      this.screenMenu?.classList.remove('hidden');
    }

    togglePause() {
      if (this.state === 'PLAYING' || this.state === 'WATCHING') {
        this.pausedPreviousState = this.state;
        this.state = 'PAUSED';
        this.stopTimer();
        this.screenPause?.classList.remove('hidden');
      } else if (this.state === 'PAUSED') {
        this.state = this.pausedPreviousState || 'PLAYING';
        this.screenPause?.classList.add('hidden');
        if (this.state === 'PLAYING' && this.selectedMode === 'timed') {
          this.resumeTimer();
        }
      }
    }

    // --- Game Initialization ---
    startNewGame(mode = 'classic') {
      this.clearAllTimers();
      this.sound.init();
      this.selectedMode = mode;
      this.level = 1;
      this.score = 0;
      this.streak = 1;
      this.maxStreakAchieved = 1;
      this.sequence = [];
      this.playerStep = 0;

      const scores = this.getHighScores();
      const currentBest = scores[mode] || 0;

      // Update Tag & HUD
      const modeNames = {
        classic: 'CLASSIC MODE',
        timed: 'TIMED MODE ⏱️',
        hardcore: 'HARDCORE MODE 💀',
        reverse: 'REVERSE MODE 🔁'
      };
      if (this.currentModeTag) this.currentModeTag.textContent = modeNames[mode];
      if (this.hudLevel) this.hudLevel.textContent = `1 / ${this.maxLevels}`;
      if (this.hudScore) this.hudScore.textContent = '0';
      if (this.hudStreak) this.hudStreak.textContent = 'x1';
      if (this.hudBest) this.hudBest.textContent = currentBest;

      // Hide Overlays
      this.screenMenu?.classList.add('hidden');
      this.screenPause?.classList.add('hidden');
      this.screenGameOver?.classList.add('hidden');
      this.screenHelp?.classList.add('hidden');

      // Hardcore mode starts with 4 steps; others start with 2 steps
      const initialSteps = mode === 'hardcore' ? 4 : 2;
      for (let i = 0; i < initialSteps; i++) {
        this.sequence.push(Math.floor(Math.random() * 4));
      }

      this.startCountdownThenPlay();
    }

    startCountdownThenPlay() {
      this.state = 'COUNTDOWN';
      this.stopTimer();
      this.resetTimerCircle();

      this.hubStatus.textContent = 'STANDBY';
      this.hubSubStatus.textContent = 'PREPARING';

      if (this.countdownOverlay && this.countdownNumber) {
        this.countdownOverlay.classList.remove('hidden');
        let count = 3;
        this.countdownNumber.textContent = count;
        this.sound.playCountdownTick();

        if (this.countdownIntervalId) clearInterval(this.countdownIntervalId);
        this.countdownIntervalId = setInterval(() => {
          count--;
          if (count > 0) {
            this.countdownNumber.textContent = count;
            this.sound.playCountdownTick();
          } else if (count === 0) {
            this.countdownNumber.textContent = 'GO!';
            this.sound.playCountdownGo();
          } else {
            clearInterval(this.countdownIntervalId);
            this.countdownIntervalId = null;
            this.countdownOverlay.classList.add('hidden');
            this.playSequence();
          }
        }, 650);
      } else {
        this.playSequence();
      }
    }

    // --- Sequence Playback ---
    playSequence() {
      this.state = 'WATCHING';
      this.stopTimer();
      this.resetTimerCircle();

      this.hubStatus.textContent = 'WATCH';
      this.hubStatus.style.color = 'var(--neon-cyan)';
      this.hubSubStatus.textContent = `LEVEL ${this.level} // ${this.sequence.length} STEPS`;

      // Tempo calculation: scales progressively with level and mode
      let flashDuration = 380 - (this.level * 12);
      let stepInterval = flashDuration + 140 - (this.level * 6);

      if (this.selectedMode === 'hardcore') {
        flashDuration = Math.max(160, 260 - this.level * 10);
        stepInterval = flashDuration + 80;
      } else {
        flashDuration = Math.max(180, flashDuration);
        stepInterval = Math.max(260, stepInterval);
      }

      let i = 0;
      if (this.playbackIntervalId) clearInterval(this.playbackIntervalId);
      this.playbackIntervalId = setInterval(() => {
        if (i >= this.sequence.length) {
          clearInterval(this.playbackIntervalId);
          this.playbackIntervalId = null;
          if (this.turnStartTimeoutId) clearTimeout(this.turnStartTimeoutId);
          this.turnStartTimeoutId = setTimeout(() => {
            this.turnStartTimeoutId = null;
            this.startPlayerTurn();
          }, 320);
          return;
        }

        const padIdx = this.sequence[i];
        this.flashPad(padIdx, flashDuration);

        // Decoy visual pulse for Levels 16-20 (purely aesthetic atmosphere challenge)
        if (this.level >= 16 && Math.random() < 0.25) {
          this.centerHub.style.boxShadow = '0 0 45px rgba(255, 0, 127, 0.8)';
          if (this.pulseTimeoutId) clearTimeout(this.pulseTimeoutId);
          this.pulseTimeoutId = setTimeout(() => {
            this.pulseTimeoutId = null;
            this.centerHub.style.boxShadow = '0 0 35px rgba(0, 0, 0, 0.95)';
          }, 120);
        }

        i++;
      }, stepInterval);
    }

    flashPad(padIndex, duration = 240) {
      const pad = this.pads[padIndex];
      if (!pad) return;

      pad.classList.add('active');
      this.sound.playPadTone(padIndex, duration / 1000);

      const tid = setTimeout(() => {
        pad.classList.remove('active');
        this.flashTimeoutIds = this.flashTimeoutIds.filter(id => id !== tid);
      }, duration);
      this.flashTimeoutIds.push(tid);
    }

    // --- Player Turn ---
    startPlayerTurn() {
      this.state = 'PLAYING';
      this.playerStep = 0;

      if (this.selectedMode === 'reverse') {
        this.hubStatus.textContent = 'REVERSE! 🔁';
        this.hubStatus.style.color = 'var(--neon-yellow)';
        this.hubSubStatus.textContent = 'INPUT IN REVERSE ORDER';
      } else {
        this.hubStatus.textContent = 'YOUR TURN';
        this.hubStatus.style.color = 'var(--neon-green)';
        this.hubSubStatus.textContent = 'REPEAT EXACT SEQUENCE';
      }

      // Initialize Timed Mode Response Window
      if (this.selectedMode === 'timed') {
        const baseWindow = Math.max(3.2, 6.5 - this.level * 0.16);
        this.timerDuration = baseWindow + (this.sequence.length * 0.7);
        this.timerRemaining = this.timerDuration;
        this.timerBarContainer?.classList.remove('hidden');
        this.startTimer();
      } else {
        this.timerBarContainer?.classList.add('hidden');
      }
    }

    startTimer() {
      this.stopTimer();
      const intervalMs = 50;

      this.timerIntervalId = setInterval(() => {
        if (this.state !== 'PLAYING') return;

        this.timerRemaining -= intervalMs / 1000;
        const ratio = Math.max(0, this.timerRemaining / this.timerDuration);

        // Update Circular SVG
        const offset = this.timerCircleLength * (1 - ratio);
        if (this.timerCircleProgress) {
          this.timerCircleProgress.style.strokeDashoffset = offset;
          this.timerCircleProgress.style.stroke = ratio < 0.25 ? 'var(--neon-pink)' : 'var(--neon-cyan)';
        }

        // Update Top Bar
        if (this.timerBarFill) {
          this.timerBarFill.style.width = `${ratio * 100}%`;
        }

        // Timeout Failure
        if (this.timerRemaining <= 0) {
          this.stopTimer();
          this.handleTimeout();
        }
      }, intervalMs);
    }

    resumeTimer() {
      if (this.selectedMode === 'timed' && this.timerRemaining > 0) {
        this.startTimer();
      }
    }

    stopTimer() {
      if (this.timerIntervalId) {
        clearInterval(this.timerIntervalId);
        this.timerIntervalId = null;
      }
    }

    resetTimerCircle() {
      if (this.timerCircleProgress) {
        this.timerCircleProgress.style.strokeDashoffset = '0';
        this.timerCircleProgress.style.stroke = 'var(--neon-cyan)';
      }
      if (this.timerBarFill) {
        this.timerBarFill.style.width = '100%';
      }
    }

    // --- Input Validation ---
    handlePlayerInput(padIndex) {
      if (this.state !== 'PLAYING') return;
      this.sound.init();

      this.flashPad(padIndex, 190);

      // Determine expected step
      let expectedIndex = -1;
      if (this.selectedMode === 'reverse') {
        // Reverse order: starts from the end of sequence
        expectedIndex = this.sequence[this.sequence.length - 1 - this.playerStep];
      } else {
        // Normal order
        expectedIndex = this.sequence[this.playerStep];
      }

      if (padIndex === expectedIndex) {
        // Correct tap!
        this.playerStep++;

        // Add base tap points
        let tapPoints = 50 * this.streak;
        if (this.selectedMode === 'hardcore') tapPoints *= 2;
        if (this.selectedMode === 'reverse') tapPoints = Math.round(tapPoints * 1.5);
        this.addScore(tapPoints);

        // Check if entire sequence completed
        if (this.playerStep >= this.sequence.length) {
          this.handleRoundCleared();
        }
      } else {
        // Mismatch failure!
        this.handleFailure('SEQUENCE MISMATCH');
      }
    }

    addScore(points) {
      this.score += points;
      if (this.hudScore) this.hudScore.textContent = this.score;

      // Check current mode high score
      const currentBest = this.getHighScores()[this.selectedMode] || 0;
      if (this.score > currentBest && this.hudBest) {
        this.hudBest.textContent = this.score;
      }
    }

    triggerComboPopup(streakVal) {
      if (!this.comboPopup) return;
      this.comboPopup.textContent = `🔥 STREAK x${streakVal}!`;
      this.comboPopup.classList.remove('hidden');

      if (this.comboTimeoutId) clearTimeout(this.comboTimeoutId);
      this.comboTimeoutId = setTimeout(() => {
        this.comboTimeoutId = null;
        this.comboPopup.classList.add('hidden');
      }, 750);
    }

    handleRoundCleared() {
      this.state = 'ROUND_SUCCESS';
      this.stopTimer();
      this.sound.playRoundSuccess();

      this.hubStatus.textContent = 'PERFECT!';
      this.hubStatus.style.color = 'var(--neon-yellow)';
      this.hubSubStatus.textContent = 'ROUND CLEARED';

      // Speed bonus in Timed mode
      if (this.selectedMode === 'timed') {
        const remainingRatio = Math.max(0, this.timerRemaining / this.timerDuration);
        const speedBonus = Math.round(remainingRatio * 300);
        this.addScore(speedBonus);
      }

      // Round Completion Bonus
      const roundBonus = 150 * this.level;
      this.addScore(roundBonus);

      // Streak Increment
      this.streak = Math.min(5, this.streak + 1);
      if (this.streak > this.maxStreakAchieved) {
        this.maxStreakAchieved = this.streak;
      }
      if (this.hudStreak) this.hudStreak.textContent = `x${this.streak}`;

      if (this.streak >= 2) {
        this.triggerComboPopup(this.streak);
      }

      // Advance Level
      this.level = Math.min(this.maxLevels, this.level + 1);
      if (this.hudLevel) this.hudLevel.textContent = `${this.level} / ${this.maxLevels}`;

      // Append 1 new random step to sequence
      this.sequence.push(Math.floor(Math.random() * 4));

      if (this.nextRoundTimeoutId) clearTimeout(this.nextRoundTimeoutId);
      this.nextRoundTimeoutId = setTimeout(() => {
        this.nextRoundTimeoutId = null;
        this.playSequence();
      }, 950);
    }

    handleTimeout() {
      this.handleFailure('TIME EXPIRED');
    }

    handleFailure(reason = 'SEQUENCE BREACH') {
      this.state = 'GAMEOVER';
      this.stopTimer();
      this.sound.playErrorTone();

      // Glitch shake visual feedback
      this.consoleWrapper?.classList.add('glitch-shake');
      if (this.shakeTimeoutId) clearTimeout(this.shakeTimeoutId);
      this.shakeTimeoutId = setTimeout(() => {
        this.shakeTimeoutId = null;
        this.consoleWrapper?.classList.remove('glitch-shake');
      }, 450);

      this.hubStatus.textContent = 'FAILED';
      this.hubStatus.style.color = 'var(--neon-pink)';
      this.hubSubStatus.textContent = reason;

      const isNewRecord = this.saveHighScore(this.selectedMode, this.score);
      const scores = this.getHighScores();
      const bestScore = scores[this.selectedMode] || this.score;

      if (this.gameOverTimeoutId) clearTimeout(this.gameOverTimeoutId);
      this.gameOverTimeoutId = setTimeout(() => {
        this.gameOverTimeoutId = null;
        if (this.goTitle) this.goTitle.textContent = reason;
        if (this.goSubtitle) {
          this.goSubtitle.textContent = reason === 'TIME EXPIRED'
            ? 'Response window lapsed. Neural sync severed.'
            : 'Sequence mismatch detected. Neural sync severed.';
        }
        if (this.goFinalScore) this.goFinalScore.textContent = this.score;
        if (this.goFinalLevel) this.goFinalLevel.textContent = `${this.level} / ${this.maxLevels}`;
        if (this.goFinalStreak) this.goFinalStreak.textContent = `x${this.maxStreakAchieved}`;
        if (this.goBestRecord) this.goBestRecord.textContent = bestScore;

        if (this.goRecordBanner) {
          if (isNewRecord) {
            this.goRecordBanner.classList.remove('hidden');
          } else {
            this.goRecordBanner.classList.add('hidden');
          }
        }

        this.screenGameOver?.classList.remove('hidden');
      }, 700);
    }
  }

  // Bootstrap safely on DOM ready or immediate if already loaded
  function initGame() {
    window.memoryMaster = new MemoryMasterGame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
  } else {
    initGame();
  }
})();
