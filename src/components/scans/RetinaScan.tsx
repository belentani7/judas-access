import { useEffect, useRef, useState } from 'react';
import PhaseFrame from '../PhaseFrame';
import { usePrefersReducedMotion } from '../../lib/hooks';
import { sfxOk } from '../../lib/sfx';

const SIZE = 340;

interface Props {
  onComplete: () => void;
}

/** Capa 1 — el usuario debe MANTENER PRESIONADO y alinear la pupila con el centro. */
export default function RetinaScan({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const holdingRef = useRef(false);
  const progRef = useRef(0);
  const doneRef = useRef(false);
  const [percent, setPercent] = useState(0);
  const [holding, setHolding] = useState(false);
  const [verified, setVerified] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    let last = performance.now();
    let t = 0;
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    let pupilX = cx;
    let pupilY = cy + 26;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      ctx.clearRect(0, 0, SIZE, SIZE);

      const bg = ctx.createRadialGradient(cx, cy, 20, cx, cy, SIZE / 2);
      bg.addColorStop(0, 'rgba(139,0,0,0.3)');
      bg.addColorStop(1, 'rgba(5,0,2,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, SIZE, SIZE);

      const rot = reduced ? 0.4 : t * 0.5;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.strokeStyle = 'rgba(255,7,58,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([14, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, 150, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < 36; i += 1) {
        const a = (i / 36) * Math.PI * 2;
        const len = i % 9 === 0 ? 12 : 5;
        ctx.strokeStyle = i % 9 === 0 ? 'rgba(255,7,58,0.8)' : 'rgba(255,7,58,0.3)';
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 132, Math.sin(a) * 132);
        ctx.lineTo(Math.cos(a) * (132 - len), Math.sin(a) * (132 - len));
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-rot * 0.6);
      ctx.strokeStyle = 'rgba(255,7,58,0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, 112, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      const irisR = 78;
      const ig = ctx.createRadialGradient(cx, cy, 6, cx, cy, irisR);
      ig.addColorStop(0, '#ff073a');
      ig.addColorStop(0.35, '#8b0000');
      ig.addColorStop(1, '#2a0004');
      ctx.fillStyle = ig;
      ctx.beginPath();
      ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < 48; i += 1) {
        const a = (i / 48) * Math.PI * 2 + (reduced ? 0 : Math.sin(t * 0.7 + i) * 0.012);
        ctx.strokeStyle = `rgba(255,7,58,${0.1 + (i % 4) * 0.05})`;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 24, Math.sin(a) * 24);
        ctx.lineTo(Math.cos(a) * (irisR - 6), Math.sin(a) * (irisR - 6));
        ctx.stroke();
      }
      ctx.restore();

      if (holdingRef.current) {
        pupilX += (cx - pupilX) * Math.min(1, dt * 3.2);
        pupilY += (cy - pupilY) * Math.min(1, dt * 3.2);
      } else if (!reduced) {
        pupilX += (cx + Math.sin(t * 0.9) * 30 - pupilX) * dt * 1.4;
        pupilY += (cy + Math.cos(t * 0.7) * 22 - pupilY) * dt * 1.4;
      } else {
        pupilX += (cx - pupilX) * dt;
        pupilY += (cy + 18 - pupilY) * dt;
      }
      const dist = Math.hypot(pupilX - cx, pupilY - cy);

      if (!doneRef.current) {
        if (holdingRef.current && dist < 26) progRef.current = Math.min(100, progRef.current + dt * 24);
        else progRef.current = Math.max(0, progRef.current - dt * (holdingRef.current ? 4 : 9));
        const p = Math.floor(progRef.current);
        setPercent((prev) => (prev === p ? prev : p));
        if (progRef.current >= 100) {
          doneRef.current = true;
          setVerified(true);
          sfxOk();
          window.setTimeout(onComplete, 1200);
        }
      }

      ctx.fillStyle = '#030001';
      ctx.beginPath();
      ctx.arc(pupilX, pupilY, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,7,58,0.9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pupilX, pupilY, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.arc(pupilX - 8, pupilY - 9, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0,255,65,0.85)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pupilX, pupilY, 34 + (reduced ? 0 : Math.sin(t * 4) * 2), 0, Math.PI * 2);
      ctx.stroke();
      const marks: ReadonlyArray<readonly [number, number, number, number]> = [
        [-1, 0, -1.6, 0],
        [1, 0, 1.6, 0],
        [0, -1, 0, -1.6],
        [0, 1, 0, 1.6],
      ];
      for (const [ax, ay, bx, by] of marks) {
        ctx.beginPath();
        ctx.moveTo(pupilX + ax * 40, pupilY + ay * 40);
        ctx.lineTo(pupilX + bx * 40, pupilY + by * 40);
        ctx.stroke();
      }

      ctx.strokeStyle = doneRef.current ? '#00ff41' : '#ff073a';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, 150, -Math.PI / 2, -Math.PI / 2 + (progRef.current / 100) * Math.PI * 2);
      ctx.stroke();
      ctx.lineCap = 'butt';

      const bt = t % 3.4;
      const blinkAmt = !reduced && bt < 0.18 ? Math.sin((bt / 0.18) * Math.PI) : 0;
      if (blinkAmt > 0) {
        const hh = (SIZE / 2) * blinkAmt;
        ctx.fillStyle = 'rgba(3,0,1,0.96)';
        ctx.fillRect(0, 0, SIZE, hh);
        ctx.fillRect(0, SIZE - hh, SIZE, hh);
        ctx.strokeStyle = 'rgba(255,7,58,0.5)';
        ctx.beginPath();
        ctx.moveTo(0, hh);
        ctx.lineTo(SIZE, hh);
        ctx.moveTo(0, SIZE - hh);
        ctx.lineTo(SIZE, SIZE - hh);
        ctx.stroke();
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced, onComplete]);

  const down = () => {
    holdingRef.current = true;
    setHolding(true);
  };
  const up = () => {
    holdingRef.current = false;
    setHolding(false);
  };

  const instruction = verified
    ? 'RETINA VERIFICADA — CAPTURA IRIDIAL COMPLETA'
    : holding
      ? 'ALINEANDO PUPILA… NO SUELTES'
      : 'MANTÉN PRESIONADO EL ESCÁNER Y FIJA LA MIRADA';

  return (
    <PhaseFrame
      phase={1}
      total={6}
      label="CAPA 01 // BIOMETRÍA OCULAR"
      title="ESCÁNER DE RETINA"
      subtitle="El núcleo Judas solo se abre a ojos que sostienen la mirada. Mantén presionado el escáner: la pupila se alineará con el objetivo y el patrón iridial se capturará. Si sueltas, pierdes captura."
      status={`PATRÓN IRIDIAL: ${percent}%`}
    >
      <div className="flex flex-col items-center gap-5">
        <canvas
          ref={canvasRef}
          style={{ width: 'min(340px, 78vw)', height: 'min(340px, 78vw)' }}
          className="cursor-crosshair touch-none select-none"
          onPointerDown={down}
          onPointerUp={up}
          onPointerLeave={up}
          onPointerCancel={up}
          aria-label="Escáner de retina: mantén presionado para capturar"
        />
        <div className="w-full max-w-sm">
          <div className="h-1.5 w-full border border-neon/30 bg-black/60">
            <div
              className={`h-full transition-all duration-150 ${verified ? 'bg-term shadow-[0_0_10px_#00ff41]' : 'bg-neon shadow-[0_0_10px_#ff073a]'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p
            className={`mt-3 text-center font-term text-[11px] tracking-[0.2em] ${
              verified ? 'text-term' : holding ? 'text-neon' : 'text-dim'
            }`}
          >
            {instruction}
          </p>
        </div>
      </div>
    </PhaseFrame>
  );
}
