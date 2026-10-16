/**
 * Synthesizes a soft, harmonic celestial water chime using the Web Audio API.
 * Requires zero external audio files and triggers reliably on user gesture.
 */
interface WebkitWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export function playWaterChime() {
  if (typeof window === "undefined") return;

  try {
    const webkitWin = window as unknown as WebkitWindow;
    const AudioContextClass = window.AudioContext || webkitWin.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Harmonic bell frequencies (Poseidon aqua resonance)
    const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      // Bell envelope: sharp attack, gentle decay
      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.3);
    });
  } catch {
    // Graceful fallback if Web Audio is restricted
  }
}
