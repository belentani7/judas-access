import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../lib/hooks';

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
  tint: number;
}

interface Props {
  label: string;
  onDone: () => void;
}

/** Salto hiperespacial: las estrellas se estiran, la nave atraviesa el túnel. */
export default function Hyperspace({ label, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const doneRef = useRef(false);

  useEffect(() => {
    if (reduced) {
      const t = window.setTimeout(onDone, 500);
      return () => window.clearTimeout(t);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const N = 850;
    const stars: Star[] = Array.from({ length: N }, () => {
      const z = Math.random() * 1.4 + 0.1;
      return {
        x: (Math.random() * 2 - 1) * 1.6,
        y: (Math.random() * 2 - 1) * 1.6,
        z,
        pz: z,
        tint: Math.random(),
      };
    });

    let raf = 0;
    const start = performance.now();
    const DURATION = 1900;

    const frame = (now: number) => {
      const t = (now - start) / DURATION;
      if (t >= 1 && !doneRef.current) {
        doneRef.current = true;
        onDone();
        return;
      }
      const speed = 0.004 + t * t * 0.09;

      ctx.fillStyle = `rgba(3,0,2,${0.34 - t * 0.18})`;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      for (const s of stars) {
        s.pz = s.z;
        s.z -= speed;
        if (s.z <= 0.02) {
          s.x = (Math.random() * 2 - 1) * 1.6;
          s.y = (Math.random() * 2 - 1) * 1.6;
          s.z = 1.4;
          s.pz = s.z;
        }
        const sx = cx + (s.x / s.z) * cx * 0.9;
        const sy = cy + (s.y / s.z) * cy * 0.9;
        const px = cx + (s.x / s.pz) * cx * 0.9;
        const py = cy + (s.y / s.pz) * cy * 0.9;

        const red = s.tint > 0.72;
        const blue = s.tint < 0.18;
        ctx.strokeStyle = red ? 'rgba(255,7,58,0.9)' : blue ? 'rgba(120,180,255,0.8)' : 'rgba(255,240,240,0.85)';
        ctx.lineWidth = red || blue ? 1.6 : 1.1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      /* núcleo del túnel */
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.16 * (0.4 + t));
      glow.addColorStop(0, `rgba(255,7,58,${0.28 * t})`);
      glow.addColorStop(1, 'rgba(255,7,58,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(frame);
    };

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [reduced, onDone]);

  return (
    <div className="fixed inset-0 z-[70] bg-[#030002]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4">
        <svg width="150" height="60" viewBox="0 0 150 60" className="drop-shadow-[0_0_18px_rgba(255,7,58,0.8)]" aria-hidden>
          <path d="M75 4 L86 30 L140 46 L86 40 L80 56 L75 44 L70 56 L64 40 L10 46 L64 30 Z" fill="#0a0104" stroke="#ff073a" strokeWidth="1.5" />
          <circle cx="75" cy="26" r="4" fill="#ff073a" className="animate-pulse" />
        </svg>
        <p className="glitch font-display text-lg font-bold tracking-[0.3em] text-ash md:text-2xl" data-text={label}>
          {label}
        </p>
        <p className="font-term text-[10px] tracking-[0.4em] text-neon">VELOCIDAD 0.33c → 33c</p>
      </div>
    </div>
  );
}
