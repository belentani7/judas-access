import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../lib/hooks';

type Ember = { x: number; y: number; vx: number; vy: number; r: number; c: string; a: number };

/** Fondo vivo: brasas rojas en canvas + orbes de luz pulsante. */
export default function Backdrop() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let embers: Ember[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const spawn = (): Ember => {
      const neon = Math.random() < 0.12;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.14,
        vy: -(0.08 + Math.random() * (neon ? 0.5 : 0.3)),
        r: neon ? 1.4 + Math.random() * 1.4 : 0.7 + Math.random() * 1.6,
        c: neon ? '#ff073a' : Math.random() < 0.5 ? '#8b0000' : '#5a000f',
        a: 0.25 + Math.random() * 0.5,
      };
    };

    const paintStatic = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of embers) {
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = w < 768 ? 150 : Math.min(480, Math.floor((w * h) / 3600));
      embers = Array.from({ length: count }, spawn);
      if (reduced) paintStatic();
    };

    const step = () => {
      ctx.fillStyle = 'rgba(5,0,2,0.3)';
      ctx.fillRect(0, 0, w, h);
      for (const p of embers) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -12) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -12) p.x = w + 10;
        else if (p.x > w + 12) p.x = -10;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(step);
    };

    resize();
    window.addEventListener('resize', resize);
    if (!reduced) raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reduced]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#050002]" aria-hidden>
      <canvas ref={ref} className="absolute inset-0" />
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
    </div>
  );
}
