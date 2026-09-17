export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.soundEnabled = localStorage.getItem('mushak_sound') !== 'false';
    this.musicEnabled = localStorage.getItem('mushak_music') !== 'false';
    
    this.masterGain = null;
    this.sfxGain = null;

    // Background Music HTML5 Audio element (Track: "Retro Game" by The_Mountain)
    this.bgmAudio = null;
    this.bgmPlaying = false;
    this.initBgm();
  }

  initBgm() {
    try {
      this.bgmAudio = new Audio('/audio/retro-game.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.preload = 'auto';
      this.bgmAudio.volume = this.musicEnabled ? 0.38 : 0;
    } catch (e) {
      console.warn('Unable to initialize BGM audio element:', e);
    }
  }

  // Initialize Web Audio Context on first user interaction for Sound SFX
  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.soundEnabled ? 0.8 : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      if (this.musicEnabled && !this.bgmPlaying) {
        this.startMusic();
      }
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.musicEnabled && !this.bgmPlaying) {
      this.startMusic();
    }
  }

  startMusic() {
    if (!this.musicEnabled || !this.bgmAudio) return;
    this.bgmAudio.volume = 0.38;
    const playPromise = this.bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.bgmPlaying = true;
      }).catch(err => {
        // Autoplay policy deferred until user interaction
        this.bgmPlaying = false;
      });
    }
  }

  pauseMusic() {
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.bgmAudio.pause();
    }
    this.bgmPlaying = false;
  }

  resumeMusic() {
    if (!this.musicEnabled || !this.bgmAudio) return;
    this.bgmAudio.volume = 0.38;
    const playPromise = this.bgmAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        this.bgmPlaying = true;
      }).catch(err => {
        console.warn('Resume music error:', err);
      });
    }
  }

  stopMusic() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
    this.bgmPlaying = false;
  }

  toggleSound(enabled) {
    this.soundEnabled = enabled !== undefined ? enabled : !this.soundEnabled;
    localStorage.setItem('mushak_sound', this.soundEnabled);
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.soundEnabled ? 0.8 : 0, this.ctx.currentTime);
    }
    return this.soundEnabled;
  }

  toggleMusic(enabled) {
    this.musicEnabled = enabled !== undefined ? enabled : !this.musicEnabled;
    localStorage.setItem('mushak_music', this.musicEnabled);
    if (this.bgmAudio) {
      if (this.musicEnabled) {
        this.resumeMusic();
      } else {
        this.pauseMusic();
      }
    }
    return this.musicEnabled;
  }

  // --- SOUND EFFECTS ---

  playJump() {
    if (!this.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(680, t + 0.18);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  playSlide() {
    if (!this.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const t = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.25);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.25);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  playCollect(itemType = 'modak') {
    if (!this.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Divine ghanta / temple bell chime chord (D5, A5, D6)
    const freqs = [587.33, 880.00, 1174.66];
    
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.03);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.25);

      gain.gain.setValueAtTime(0.2, t + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + idx * 0.03);
      osc.stop(t + 0.35);
    });
  }

  playPowerup() {
    if (!this.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Ascending celebratory fanfare: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.07);

      gain.gain.setValueAtTime(0.3, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.35);
    });
  }

  playShieldBreak() {
    if (!this.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.3);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  playCollision() {
    if (!this.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.28);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  playClick() {
    if (!this.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  playGameOver() {
    if (!this.soundEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 392, 349.23, 293.66];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.12);

      gain.gain.setValueAtTime(0.3, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.4);
    });
  }
}

export const audioSystem = new AudioSystem();
