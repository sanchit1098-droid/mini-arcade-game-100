/**
 * Audio Synthesizer using Web Audio API
 * Generates all sound effects procedurally without any external audio files.
 */
class SoundController {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.fuseOsc = null;
        this.fuseGain = null;
        this.activeBombs = 0;

        // Load mute state from localStorage
        const savedMute = localStorage.getItem('fruit_slice_muted');
        if (savedMute !== null) {
            this.muted = savedMute === 'true';
        }
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('fruit_slice_muted', this.muted);
        if (this.muted && this.fuseGain) {
            this.fuseGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
        return this.muted;
    }

    isMuted() {
        return this.muted;
    }

    // Blade swipe swoosh sound
    playSwoosh() {
        if (this.muted || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(2600, now + 0.08);
        filter.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        filter.Q.setValueAtTime(2.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    // Juicy fruit slice chop / squelch
    playSlice(pitchMultiplier = 1) {
        if (this.muted || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;

        // Primary squelch oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const startFreq = (450 + Math.random() * 150) * pitchMultiplier;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 0.25, now + 0.12);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        // Crack / impact pop (filtered noise)
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400 * pitchMultiplier, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.08);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
        noise.start(now);
    }

    // Combo chime arpeggio
    playCombo(count) {
        if (this.muted || !this.ctx) return;
        this.init();

        const baseFreq = 523.25; // C5
        const scale = [1, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5];
        const notesToPlay = Math.min(count, 4);

        for (let i = 0; i < notesToPlay; i++) {
            const now = this.ctx.currentTime + i * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            const freqIdx = Math.min(i + (count >= 4 ? 2 : 0), scale.length - 1);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(baseFreq * scale[freqIdx], now);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.36);
        }
    }

    // Bomb explosion sound
    playExplosion() {
        if (this.muted || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const duration = 0.8;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(40, now + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Low boom sub-bass
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(120, now);
        sub.frequency.exponentialRampToValueAtTime(25, now + 0.5);

        subGain.gain.setValueAtTime(0.5, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        sub.connect(subGain);
        subGain.connect(this.ctx.destination);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        sub.start(now);
        sub.stop(now + 0.51);
        noise.start(now);
    }

    // UI button click / tap
    playClick() {
        if (this.muted || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    // Game over sound
    playGameOver() {
        if (this.muted || !this.ctx) return;
        this.init();

        const notes = [440, 392, 349.2, 293.7]; // A4, G4, F4, D4
        notes.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.16;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.3);
        });
    }

    // Game start fanfare
    playStart() {
        if (this.muted || !this.ctx) return;
        this.init();

        const notes = [330, 440, 554.4, 659.3]; // E4, A4, C#5, E5
        notes.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.09;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.23);
        });
    }

    // Missed fruit strike / loss sound
    playStrike() {
        if (this.muted || !this.ctx) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.21);
    }
}

// Global sound manager instance
window.soundController = new SoundController();
