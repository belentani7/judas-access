import { useEffect, useRef, useState } from 'react';
import PhaseFrame from './PhaseFrame';
import { CONTRACT_CLAUSES } from '../lib/constants';
import { sfxErr, sfxOk } from '../lib/sfx';

interface Props {
  codename: string;
  onComplete: (signatureDataUrl: string) => void;
}

export default function SignaturePad({ codename, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [nudge, setNudge] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const fit = () => {
      const rect = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.max(1, Math.floor(rect.width * dpr));
      c.height = Math.max(1, Math.floor(rect.height * dpr));
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = pos(e);
    ctx.strokeStyle = '#ff2a4d';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#ff073a';
    ctx.shadowBlur = 7;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();
    setHasInk(true);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const up = () => {
    drawing.current = false;
  };

  const clear = () => {
    const c = canvasRef.current;
    const ctx = c?.getContext('2d');
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
  };

  const sign = () => {
    if (!hasInk || !accepted) {
      sfxErr();
      setNudge(true);
      window.setTimeout(() => setNudge(false), 550);
      return;
    }
    sfxOk();
    pushSigned();
  };

  const pushSigned = () => {
    const c = canvasRef.current;
    if (!c) return;
    onComplete(c.toDataURL('image/png'));
  };

  return (
    <PhaseFrame
      phase={6}
      total={6}
      label="FASE 06 // VÍNCULO FINAL"
      title="FIRMA DE CONFIDENCIALIDAD"
      subtitle="Última cerradura de la caja fuerte. Lee el protocolo, acepta y traza tu firma: la tinta queda vinculada a tu código de agente de forma irreversible."
    >
      <div className="scroll-red max-h-52 overflow-y-auto border border-white/10 bg-black/50 p-4">
        <p className="font-term text-[10px] tracking-[0.3em] text-neon">
          PROTOCOLO OMNIPRESENCIA v3.0 — CONTRATO DEL AGENTE {codename}
        </p>
        <ol className="mt-3 flex flex-col gap-2.5">
          {CONTRACT_CLAUSES.map((c, i) => (
            <li key={i} className="flex gap-2.5 font-body text-xs leading-relaxed text-dim">
              <span className="shrink-0 font-term text-[10px] text-neon">
                {String(i + 1).padStart(2, '0')}
              </span>
              {c}
            </li>
          ))}
        </ol>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-3 select-none">
        <span
          className={`flex h-4 w-4 items-center justify-center border transition-all ${
            accepted ? 'border-term bg-term/20 text-term' : 'border-dim/50 text-transparent'
          }`}
        >
          ✓
        </span>
        <input
          type="checkbox"
          className="sr-only"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <span className="font-term text-[10px] tracking-[0.2em] text-ash">
          HE LEÍDO Y ACEPTO EL PROTOCOLO — SOY CONSCIENTE DE LO QUE HA SUCEDIDO
        </span>
      </label>

      <div
        className={`relative mt-4 overflow-hidden border border-dashed bg-black/40 ${
          nudge ? 'shake border-neon' : 'border-neon/35'
        }`}
      >
        <canvas
          ref={canvasRef}
          className="block h-40 w-full cursor-crosshair touch-none"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          aria-label="Zona de firma: traza tu firma aquí"
        />
        <span className="pointer-events-none absolute top-3 left-3 font-term text-[9px] tracking-[0.3em] text-dim/70">
          ZONA DE FIRMA
        </span>
        <span className="pointer-events-none absolute bottom-3 left-3 font-term text-base text-neon/70">
          ✕
        </span>
        <span className="pointer-events-none absolute inset-x-10 bottom-5 border-b border-dashed border-white/15" />
        {!hasInk && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-term text-[11px] tracking-[0.35em] text-dim/60">
            TRAZA TU FIRMA AQUÍ
          </span>
        )}
      </div>

      {nudge && (
        <p className="mt-3 border border-neon/40 bg-neon/10 px-3 py-2 font-term text-[10px] tracking-[0.2em] text-neon">
          ⚠ FIRMA OBLIGATORIA — TRAZA TU FIRMA Y ACEPTA EL PROTOCOLO
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={clear} className="btn-ghost text-xs">
          LIMPIAR FIRMA
        </button>
        <button
          type="button"
          onClick={sign}
          className={`btn-neon text-sm ${!hasInk || !accepted ? 'opacity-60' : ''}`}
        >
          FIRMAR Y ACEPTAR EL VIAJE
        </button>
      </div>
    </PhaseFrame>
  );
}
