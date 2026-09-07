/* Pequeños avisos sonoros con WebAudio — sin ficheros externos. */

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function beep(freq = 880, dur = 0.07, type: OscillatorType = 'square', gain = 0.022) {
  try {
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  } catch {
    /* silencio */
  }
}

export const sfxOk = () => {
  beep(880);
  window.setTimeout(() => beep(1318, 0.09), 90);
};

export const sfxErr = () => beep(140, 0.18, 'sawtooth', 0.028);

export const sfxKey = () => beep(1900, 0.02, 'square', 0.008);
