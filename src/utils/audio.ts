/**
 * High-fidelity Audio & Haptic Feedback Engine for StockSense Scanner
 * Uses Web Audio API for zero-latency, crisp industrial scanner beeps without external asset loading delays.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays an authentic Honeywell / Zebra warehouse handheld laser scanner confirmation beep.
 */
export function playScannerBeep(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.28, now);
    masterGain.connect(ctx.destination);

    // Primary scanner tone (high frequency sharp chirp)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2450, now);
    osc1.frequency.exponentialRampToValueAtTime(2750, now + 0.08);

    gain1.gain.setValueAtTime(0.9, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc1.connect(gain1);
    gain1.connect(masterGain);

    // Harmonic layer for crisp acoustic feedback
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(3200, now);
    gain2.gain.setValueAtTime(0.3, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc2.connect(gain2);
    gain2.connect(masterGain);

    // Start & Stop
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.1);
    osc2.stop(now + 0.07);

    // Trigger haptic vibration if supported (100ms sharp pulse)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([60]);
    }
  } catch {
    // Fallback: silent fail graceful if audio policy blocks initial interaction
  }
}

/**
 * Plays a double success chime for batch completed or audit validated
 */
export function playDoubleBeep(): void {
  playScannerBeep();
  setTimeout(() => {
    playScannerBeep();
  }, 120);
}
