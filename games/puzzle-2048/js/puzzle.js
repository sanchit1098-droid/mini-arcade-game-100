// 2048 Neon Puzzle Game Engine
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

    playSlide() {
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.08);

        osc.start(now);
        osc.stop(now + 0.09);
      } catch (e) {}
    }

    playMerge(value) {
      if (!this.ctx) return;
      try {
        const baseFreq = 260 + Math.log2(value) * 60;
        const now = this.ctx.currentTime;

        [baseFreq, baseFreq * 1.25].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.04);
          gain.gain.setValueAtTime(0.12, now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.04 + 0.12);

          osc.start(now + idx * 0.04);
          osc.stop(now + idx * 0.04 + 0.13);
        });
      } catch (e) {}
    }

    playWin() {
      if (!this.ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.18, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.26);
        });
      } catch (e) {}
    }

    playGameOver() {
      if (!this.ctx) return;
      try {
        const notes = [400, 350, 300, 240];
        const now = this.ctx.currentTime;
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.15, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.15);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.16);
        });
      } catch (e) {}
    }
  }

  const sound = new SoundController();

  // --- DOM Elements ---
  const gridBoard = document.getElementById('gridBoard');
  const gridCells = document.querySelectorAll('.grid-cell');
  const tileContainer = document.getElementById('tileContainer');

  const scoreVal = document.getElementById('scoreVal');
  const bestVal = document.getElementById('bestVal');
  const moveVal = document.getElementById('moveVal');

  const startOverlay = document.getElementById('startOverlay');
  const winOverlay = document.getElementById('winOverlay');
  const gameOverOverlay = document.getElementById('gameOverOverlay');

  const startBtn = document.getElementById('startBtn');
  const undoBtn = document.getElementById('undoBtn');
  const restartBtn = document.getElementById('restartBtn');
  const keepPlayingBtn = document.getElementById('keepPlayingBtn');
  const winRestartBtn = document.getElementById('winRestartBtn');
  const retryBtn = document.getElementById('retryBtn');

  const finalScore = document.getElementById('finalScore');
  const finalBest = document.getElementById('finalBest');

  // D-Pad buttons
  const dpadUp = document.getElementById('dpadUp');
  const dpadDown = document.getElementById('dpadDown');
  const dpadLeft = document.getElementById('dpadLeft');
  const dpadRight = document.getElementById('dpadRight');

  // --- Game State ---
  const SIZE = 4;
  let board = [];
  let score = 0;
  let moves = 0;
  let highScore = parseInt(localStorage.getItem('puzzle_2048_hs') || '0', 10);
  bestVal.textContent = highScore;

  let hasWon = false;
  let keepPlaying = false;
  let isGameOver = false;

  // Undo History
  let historyStack = [];

  function initEmptyBoard() {
    const b = [];
    for (let r = 0; r < SIZE; r++) {
      b[r] = [];
      for (let c = 0; c < SIZE; c++) {
        b[r][c] = 0;
      }
    }
    return b;
  }

  function cloneBoard(b) {
    return b.map(row => [...row]);
  }

  function saveHistory() {
    historyStack.push({
      board: cloneBoard(board),
      score: score,
      moves: moves
    });
    // Keep max 10 steps of undo
    if (historyStack.length > 10) {
      historyStack.shift();
    }
  }

  function undo() {
    if (historyStack.length === 0 || isGameOver) return;
    const prev = historyStack.pop();
    board = prev.board;
    score = prev.score;
    moves = prev.moves;

    scoreVal.textContent = score;
    moveVal.textContent = moves;
    renderBoard();
  }

  function getEmptyPositions() {
    const empty = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === 0) {
          empty.push({ r, c });
        }
      }
    }
    return empty;
  }

  function spawnRandomTile() {
    const empty = getEmptyPositions();
    if (empty.length === 0) return null;
    const choice = empty[Math.floor(Math.random() * empty.length)];
    const val = Math.random() < 0.9 ? 2 : 4;
    board[choice.r][choice.c] = val;
    return choice;
  }

  function startNewGame() {
    sound.init();
    board = initEmptyBoard();
    score = 0;
    moves = 0;
    hasWon = false;
    keepPlaying = false;
    isGameOver = false;
    historyStack = [];

    scoreVal.textContent = '0';
    moveVal.textContent = '0';

    spawnRandomTile();
    spawnRandomTile();

    startOverlay.classList.add('hidden');
    winOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');

    renderBoard();
  }

  // --- Rendering Tiles ---
  function renderBoard(mergedCoords = []) {
    tileContainer.innerHTML = '';

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const val = board[r][c];
        if (val !== 0) {
          const cellIndex = r * SIZE + c;
          const targetCell = gridCells[cellIndex];
          if (!targetCell) continue;

          const tileEl = document.createElement('div');
          tileEl.className = `tile tile-${val <= 2048 ? val : 'super'}`;
          tileEl.textContent = val;

          // Check if this tile just merged
          const wasMerged = mergedCoords.some(m => m.r === r && m.c === c);
          if (wasMerged) {
            tileEl.classList.add('merged');
          }

          // Positioning based on gridCell offsets
          tileEl.style.transform = `translate(${targetCell.offsetLeft}px, ${targetCell.offsetTop}px)`;
          tileEl.style.width = `${targetCell.offsetWidth}px`;
          tileEl.style.height = `${targetCell.offsetHeight}px`;

          tileContainer.appendChild(tileEl);
        }
      }
    }
  }

  window.addEventListener('resize', () => {
    renderBoard();
  });

  // --- Move & Merge Logic ---
  // Returns { moved: boolean, scoreAdded: number, merged: [{r,c}] }
  function slideRow(row) {
    const nonZero = row.filter(val => val !== 0);
    const mergedRow = [];
    let scoreAdded = 0;
    const mergeIndices = [];

    for (let i = 0; i < nonZero.length; i++) {
      if (i < nonZero.length - 1 && nonZero[i] === nonZero[i + 1]) {
        const mergedVal = nonZero[i] * 2;
        mergedRow.push(mergedVal);
        scoreAdded += mergedVal;
        mergeIndices.push(mergedRow.length - 1);
        i++; // skip next since it's merged
      } else {
        mergedRow.push(nonZero[i]);
      }
    }

    while (mergedRow.length < SIZE) {
      mergedRow.push(0);
    }

    return { row: mergedRow, scoreAdded, mergeIndices };
  }

  function move(direction) {
    if (isGameOver) return;
    sound.init();

    let moved = false;
    let scoreAdded = 0;
    const mergedList = [];
    const newBoard = initEmptyBoard();

    if (direction === 'LEFT') {
      for (let r = 0; r < SIZE; r++) {
        const { row, scoreAdded: sAdd, mergeIndices } = slideRow(board[r]);
        newBoard[r] = row;
        scoreAdded += sAdd;
        mergeIndices.forEach(c => mergedList.push({ r, c }));
        if (row.some((val, c) => val !== board[r][c])) {
          moved = true;
        }
      }
    } else if (direction === 'RIGHT') {
      for (let r = 0; r < SIZE; r++) {
        const reversed = [...board[r]].reverse();
        const { row, scoreAdded: sAdd, mergeIndices } = slideRow(reversed);
        const finalRow = row.reverse();
        newBoard[r] = finalRow;
        scoreAdded += sAdd;
        mergeIndices.forEach(invC => mergedList.push({ r, c: SIZE - 1 - invC }));
        if (finalRow.some((val, c) => val !== board[r][c])) {
          moved = true;
        }
      }
    } else if (direction === 'UP') {
      for (let c = 0; c < SIZE; c++) {
        const col = [board[0][c], board[1][c], board[2][c], board[3][c]];
        const { row, scoreAdded: sAdd, mergeIndices } = slideRow(col);
        for (let r = 0; r < SIZE; r++) {
          newBoard[r][c] = row[r];
          if (row[r] !== board[r][c]) moved = true;
        }
        scoreAdded += sAdd;
        mergeIndices.forEach(r => mergedList.push({ r, c }));
      }
    } else if (direction === 'DOWN') {
      for (let c = 0; c < SIZE; c++) {
        const col = [board[3][c], board[2][c], board[1][c], board[0][c]];
        const { row, scoreAdded: sAdd, mergeIndices } = slideRow(col);
        for (let r = 0; r < SIZE; r++) {
          newBoard[SIZE - 1 - r][c] = row[r];
          if (row[r] !== board[SIZE - 1 - r][c]) moved = true;
        }
        scoreAdded += sAdd;
        mergeIndices.forEach(invR => mergedList.push({ r: SIZE - 1 - invR, c }));
      }
    }

    if (moved) {
      saveHistory();
      board = newBoard;
      score += scoreAdded;
      moves++;

      scoreVal.textContent = score;
      moveVal.textContent = moves;

      if (score > highScore) {
        highScore = score;
        localStorage.setItem('puzzle_2048_hs', highScore.toString());
        bestVal.textContent = highScore;
      }

      if (scoreAdded > 0) {
        sound.playMerge(scoreAdded);
      } else {
        sound.playSlide();
      }

      // Check 2048 Win condition
      if (!hasWon && !keepPlaying) {
        for (let r = 0; r < SIZE; r++) {
          for (let c = 0; c < SIZE; c++) {
            if (board[r][c] >= 2048) {
              hasWon = true;
              sound.playWin();
              winOverlay.classList.remove('hidden');
              break;
            }
          }
          if (hasWon) break;
        }
      }

      spawnRandomTile();
      renderBoard(mergedList);

      // Check Game Over condition
      if (checkGameOver()) {
        isGameOver = true;
        sound.playGameOver();
        finalScore.textContent = score;
        finalBest.textContent = highScore;
        gameOverOverlay.classList.remove('hidden');
      }
    }
  }

  function checkGameOver() {
    if (getEmptyPositions().length > 0) return false;

    // Check adjacent matches
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const val = board[r][c];
        if (r < SIZE - 1 && board[r + 1][c] === val) return false;
        if (c < SIZE - 1 && board[r][c + 1] === val) return false;
      }
    }
    return true;
  }

  // --- Keyboard Controls ---
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        move('UP');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        move('DOWN');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        move('LEFT');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        move('RIGHT');
        break;
      case 'z':
      case 'Z':
        if (e.ctrlKey || e.metaKey) undo();
        break;
    }
  });

  // --- D-Pad Click Events ---
  if (dpadUp) dpadUp.addEventListener('click', () => move('UP'));
  if (dpadDown) dpadDown.addEventListener('click', () => move('DOWN'));
  if (dpadLeft) dpadLeft.addEventListener('click', () => move('LEFT'));
  if (dpadRight) dpadRight.addEventListener('click', () => move('RIGHT'));

  // --- Touch Swipe Detection ---
  let touchStartX = 0;
  let touchStartY = 0;
  gridBoard.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  gridBoard.addEventListener('touchend', (e) => {
    if (e.changedTouches.length > 0) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (Math.max(absX, absY) > 25) {
        if (absX > absY) {
          if (deltaX > 0) move('RIGHT');
          else move('LEFT');
        } else {
          if (deltaY > 0) move('DOWN');
          else move('UP');
        }
      }
    }
  }, { passive: true });

  // Buttons
  startBtn.addEventListener('click', startNewGame);
  restartBtn.addEventListener('click', startNewGame);
  winRestartBtn.addEventListener('click', startNewGame);
  retryBtn.addEventListener('click', startNewGame);
  undoBtn.addEventListener('click', undo);

  keepPlayingBtn.addEventListener('click', () => {
    keepPlaying = true;
    winOverlay.classList.add('hidden');
  });

  // Initialize
  startNewGame();
})();
