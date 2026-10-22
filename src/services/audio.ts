/**
 * Ambient, gentle chime generator using Web Audio API
 * Creates a soothing crystalline bell sound when habits or to-dos are checked off.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a peaceful crystal harmonic bell chord
 */
export function playGentleChime(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Harmonic frequencies in E major pentatonic (peaceful, uplifting)
    const freqs = [659.25, 830.61, 987.77]; // E5, G#5, B5

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      // Soft envelope
      gain.gain.setValueAtTime(0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.04 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 1.0);
    });
  } catch (err) {
    // Ignore audio permission or context errors
    console.debug('Audio chime skipped:', err);
  }
}

/**
 * Play a dreamy celestial cosmic chime chord when a focus session finishes
 */
export function playCosmicChime(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Ethereal celestial chord: F#4, C#5, F5, G#5, C#6
    const freqs = [369.99, 554.37, 698.46, 830.61, 1108.73];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      // Deep celestial decay envelope
      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.09, now + idx * 0.06 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 1.9);
    });
  } catch (err) {
    console.debug('Cosmic chime skipped:', err);
  }
}

/**
 * Play an ascending magical chime chord when reaching a new cosmic growth stage
 */
export function playCosmicStageUpChime(enabled: boolean = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Ascending starry cascade: C5, E5, G5, B5, D6, G6
    const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 1.6);
    });
  } catch (err) {
    console.debug('Stage up chime skipped:', err);
  }
}

