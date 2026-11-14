// Memory Master - Sequence Recall Arcade Game
(function() {
  'use strict';

  // --- Sound Controller ---
  class SoundController {
    constructor() {
      this.ctx = null;
      this.padFreqs = [329.63, 440.00, 554.37, 659.25]; // E4, A4, C#5, E5
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

    playPadTone(padIndex, duration = 0.25) {
      if (!this.ctx) return;
      try {
        const freq = this.padFreqs[padIndex] || 440;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.start(now);
        osc.stop(now + duration + 0.02);
      } catch (e) {}
    }

    playRoundSuccess() {
      if (!this.ctx) return;
      try {
        const notes = [440, 554.37, 659.25, 880];
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.16, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.15);

          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.16);
        });
      } catch (e) {}
    }

    playErrorTone() {
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(115, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.4);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        osc.start(now);
        osc.stop(now + 0.42);
      } catch (e) {}
    }
  }

  const sound = new SoundController();

  // --- DOM Elements ---
  const pads = [
    document.getElementById('pad0'),
    document.getElementById('pad1'),
    document.getElementById('pad2'),
    document.getElementById('pad3')
  ];

  const roundVal = document.getElementById('roundVal');
  const seqLengthVal = document.getElementById('seqLengthVal');
  const statusVal = document.getElementById('statusVal');
  const bestVal = document.getElementById('bestVal');

  const startOverlay = document.getElementById('startOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');

  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const retryBtn = document.getElementById('retryBtn');

  const finalRound = document.getElementById('finalRound');
  const finalLength = document.getElementById('finalLength');
  const finalBest = document.getElementById('finalBest');
  const newRecordStatus = document.getElementById('newRecordStatus');

  // --- Game State ---
  let sequence = [];
  let playerStep = 0;
  let round = 1;
  let isPlayingSequence = false;
  let isPlayerTurn = false;
  let highScore = parseInt(localStorage.getItem('memory_master_hs') || '0', 10);
  bestVal.textContent = highScore;

  function flashPad(padIndex, duration = 250) {
    const pad = pads[padIndex];
    if (!pad) return;
    pad.classList.add('active');
    sound.playPadTone(padIndex, duration / 1000);
    setTimeout(() => {
      pad.classList.remove('active');
    }, duration);
  }

  function startNewGame() {
    sound.init();
    sequence = [];
    round = 1;
    playerStep = 0;
    isPlayingSequence = false;
    isPlayerTurn = false;

    roundVal.textContent = '1';
    seqLengthVal.textContent = '1';
    statusVal.textContent = 'READY';

    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    // Add first step and begin
    addNewStep();
    playSequence();
  }

  function addNewStep() {
    const nextPad = Math.floor(Math.random() * 4);
    sequence.push(nextPad);
    seqLengthVal.textContent = sequence.length;
  }

  function playSequence() {
    isPlayingSequence = true;
    isPlayerTurn = false;
    statusVal.textContent = 'WATCH...';
    statusVal.style.color = '#00f3ff';

    // Speed scales slightly with round number
    const stepInterval = Math.max(260, 560 - round * 15);
    const flashDuration = Math.max(180, stepInterval * 0.7);

    let i = 0;
    const intervalId = setInterval(() => {
      if (i >= sequence.length) {
        clearInterval(intervalId);
        isPlayingSequence = false;
        setTimeout(startPlayerTurn, 300);
        return;
      }

      flashPad(sequence[i], flashDuration);
      i++;
    }, stepInterval);
  }

  function startPlayerTurn() {
    playerStep = 0;
    isPlayerTurn = true;
    statusVal.textContent = 'YOUR TURN';
    statusVal.style.color = '#39ff14';
  }

  function handlePadClick(padIndex) {
    if (!isPlayerTurn || isPlayingSequence) return;
    sound.init();

    flashPad(padIndex, 200);

    if (padIndex === sequence[playerStep]) {
      // Correct step
      playerStep++;

      if (playerStep >= sequence.length) {
        // Round cleared!
        isPlayerTurn = false;
        statusVal.textContent = 'PERFECT!';
        statusVal.style.color = '#ffd700';
        sound.playRoundSuccess();

        round++;
        roundVal.textContent = round;

        if (round - 1 > highScore) {
          highScore = round - 1;
          localStorage.setItem('memory_master_hs', highScore.toString());
          bestVal.textContent = highScore;
        }

        setTimeout(() => {
          addNewStep();
          playSequence();
        }, 850);
      }
    } else {
      // Wrong step - Game Over!
      isPlayerTurn = false;
      sound.playErrorTone();
      statusVal.textContent = 'FAILED';
      statusVal.style.color = '#ff3333';

      setTimeout(triggerGameOver, 600);
    }
  }

  function triggerGameOver() {
    const clearedRounds = round - 1;
    const isNewHigh = clearedRounds > highScore;
    if (isNewHigh) {
      highScore = clearedRounds;
      localStorage.setItem('memory_master_hs', highScore.toString());
      bestVal.textContent = highScore;
    }

    finalRound.textContent = clearedRounds;
    finalLength.textContent = sequence.length;
    finalBest.textContent = highScore;
    newRecordStatus.textContent = isNewHigh ? '🔥 YES!' : 'NO';
    newRecordStatus.style.color = isNewHigh ? '#39ff14' : '#8c90ad';

    gameOverOverlay.classList.remove('hidden');
  }

  // --- Input Listeners ---
  pads.forEach((pad, idx) => {
    pad.addEventListener('click', (e) => {
      e.preventDefault();
      handlePadClick(idx);
    });

    pad.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handlePadClick(idx);
    }, { passive: false });
  });

  // Keyboard Shortcuts (1-4, Q, W, A, S, Arrow Keys)
  window.addEventListener('keydown', (e) => {
    if (!isPlayerTurn) return;

    if (e.key === '1' || e.key === 'q' || e.key === 'Q' || e.key === 'ArrowUp') {
      handlePadClick(0);
    } else if (e.key === '2' || e.key === 'w' || e.key === 'W' || e.key === 'ArrowRight') {
      handlePadClick(1);
    } else if (e.key === '3' || e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
      handlePadClick(2);
    } else if (e.key === '4' || e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
      handlePadClick(3);
    }
  });

  // Buttons
  startBtn.addEventListener('click', startNewGame);
  restartBtn.addEventListener('click', startNewGame);
  retryBtn.addEventListener('click', startNewGame);
})();
