import { useEffect, useState } from 'react';

export const GLYPHS = '█▓▒░<>/\\|=+*#%&@01';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** Efecto scramble-decode: el texto se revela entre glifos aleatorios. */
export function useScramble(text: string, speed = 26): string {
  const reduced = usePrefersReducedMotion();
  const [out, setOut] = useState(reduced ? text : '');

  useEffect(() => {
    if (reduced) {
      setOut(text);
      return;
    }
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      const reveal = Math.floor(frame / 2);
      let s = '';
      for (let i = 0; i < text.length; i += 1) {
        if (i < reveal) s += text[i];
        else if (i < reveal + 6) s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        else s += i % 2 === 0 ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : ' ';
      }
      setOut(s);
      if (reveal >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed, reduced]);

  return out;
}
