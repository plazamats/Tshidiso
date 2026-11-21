// Romantic Web Audio Synthesizer Engine
// Generates a lush, cinematic, gentle acoustic piano & celesta nocturne in Db Major / Ab Major
// Plays seamlessly without requiring any external audio files, with warm chords, reverb-like decay, and interactive stardust chimes.

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying = false;
  private loopTimer: number | null = null;
  private chordIndex = 0;
  private stepIndex = 0;

  // Romantic chord progressions in Db Major (Db - Fm7 - Bbm7 - Gbmaj7 - Ebm7 - Ab7)
  private chords = [
    { root: 138.59, notes: [277.18, 349.23, 415.30, 554.37, 698.46] }, // Dbmaj7
    { root: 174.61, notes: [261.63, 349.23, 415.30, 523.25, 698.46] }, // Fm7
    { root: 116.54, notes: [233.08, 277.18, 349.23, 466.16, 554.37] }, // Bbm7
    { root: 185.00, notes: [277.18, 369.99, 440.00, 554.37, 739.99] }, // Gbmaj7
    { root: 155.56, notes: [311.13, 369.99, 466.16, 622.25, 739.99] }, // Ebm7
    { root: 207.65, notes: [261.63, 311.13, 415.30, 523.25, 622.25] }, // Ab
  ];

  private pentatonicChimes = [
    554.37, 622.25, 698.46, 830.61, 932.33, 1108.73, 1244.51, 1396.91
  ];

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    } catch {
      /* AudioContext unavailable */
    }
  }

  public getAnalyser(): AnalyserNode | null {
    if (!this.analyser) this.init();
    return this.analyser;
  }

  public play() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.stepIndex = 0;
    this.chordIndex = 0;
    this.scheduleNextArpeggio();
  }

  public pause() {
    this.isPlaying = false;
    if (this.loopTimer) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public isActive(): boolean {
    return this.isPlaying;
  }

  private scheduleNextArpeggio() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const currentChord = this.chords[this.chordIndex];
    const now = this.ctx.currentTime;

    // Play bass pedal note at start of chord
    if (this.stepIndex === 0) {
      this.playWarmTone(currentChord.root, 0.22, 2.8, 'triangle', now);
      this.playWarmTone(currentChord.root * 0.5, 0.15, 3.2, 'sine', now);
    }

    // Play melodic arpeggio note
    const noteFreq = currentChord.notes[this.stepIndex % currentChord.notes.length];
    const octaveShift = (this.stepIndex % 4 === 3) ? 1.5 : 1;
    this.playCelestaNote(noteFreq * octaveShift, 0.12, 1.8, now);

    // Occasionally add a soft counter-melody chime
    if (this.stepIndex === 2 || this.stepIndex === 5) {
      const topNote = currentChord.notes[(this.stepIndex + 2) % currentChord.notes.length];
      this.playCelestaNote(topNote * 1.5, 0.08, 2.2, now + 0.18);
    }

    this.stepIndex++;
    if (this.stepIndex >= 6) {
      this.stepIndex = 0;
      this.chordIndex = (this.chordIndex + 1) % this.chords.length;
    }

    const tempoMs = 520; // Soft romantic waltz tempo
    this.loopTimer = window.setTimeout(() => this.scheduleNextArpeggio(), tempoMs);
  }

  private playWarmTone(freq: number, peakGain: number, duration: number, type: OscillatorType, startTime: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, startTime);
      filter.frequency.exponentialRampToValueAtTime(180, startTime + duration);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    } catch {
      /* ignore audio error */
    }
  }

  private playCelestaNote(freq: number, peakGain: number, duration: number, startTime: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);

      // Slight detune for romantic chorus shimmer
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.002, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration + 0.05);
      osc2.stop(startTime + duration + 0.05);
    } catch {
      /* ignore audio error */
    }
  }

  // Kept for compatibility with interactive components; uploaded songs are the only audio.
  public playStardustChime(pitchIndex?: number) {
    void pitchIndex;
  }
}

export const romanticAudio = new RomanticAudioEngine();
