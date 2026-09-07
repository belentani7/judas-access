import { useEffect, useRef, useState } from 'react';
import PhaseFrame from '../PhaseFrame';
import { usePrefersReducedMotion } from '../../lib/hooks';
import { sfxOk } from '../../lib/sfx';

const RINGS = [86, 74, 62, 50, 38, 26, 14];

/** Arco abierto tipo cresta de huella (abre hacia la izquierda, anidado). */
function arcPath(r: number): string {
  const x = 100 - r * 0.5;
  const yTop = 100 - r * 0.866;
  const yBot = 100 + r * 0.866;
  return `M ${x.toFixed(1)} ${yTop.toFixed(1)} A ${r} ${r} 0 1 1 ${x.toFixed(1)} ${yBot.toFixed(1)}`;
}

interface Props {
  onComplete: () => void;
}

/** Capa 2 — mantener presionado el sensor revela las crestas; soltar degrada la lectura. */
export default function FingerprintScan({ onComplete }: Props) {
  const [percent, setPercent] = useState(0);
  const [holding, setHolding] = useState(false);
  const [verified, setVerified] = useState(false);
  const progRef = useRef(0);
  const holdingRef = useRef(false);
  const doneRef = useRef(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!doneRef.current) {
        if (holdingRef.current) progRef.current = Math.min(100, progRef.current + dt * 26);
        else progRef.current = Math.max(0, progRef.current - dt * 10);
        const p = Math.floor(progRef.current);
        setPercent((prev) => (prev === p ? prev : p));
        if (progRef.current >= 100) {
          doneRef.current = true;
          setVerified(true);
          sfxOk();
          window.setTimeout(onComplete, 1200);
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const down = () => {
    holdingRef.current = true;
    setHolding(true);
  };
  const up = () => {
    holdingRef.current = false;
    setHolding(false);
  };

  const seg = 100 / RINGS.length;
  const stroke = verified ? '#00ff41' : '#ff073a';

  return (
    <PhaseFrame
      phase={2}
      total={6}
      label="CAPA 02 // DERMATOGLIFO"
      title="HUELLA DACTILAR"
      subtitle="El artefacto exige una cresta humana real. Presiona el sensor y no lo sueltes hasta que todas las crestas queden impresas en el sistema."
      status={verified ? 'COINCIDENCIA 99.7% — HUELLA VERIFICADA' : `LECTURA DE CRESTAS: ${percent}%`}
    >
      <div className="flex flex-col items-center gap-6">
        <button
          type="button"
          onPointerDown={down}
          onPointerUp={up}
          onPointerLeave={up}
          onPointerCancel={up}
          aria-label="Sensor de huella: mantén presionado para escanear"
          className={`relative block h-64 w-64 cursor-pointer touch-none select-none rounded-full border-2 bg-black/60 transition-all duration-300 focus:outline-none ${
            verified
              ? 'border-term shadow-[0_0_40px_rgba(0,255,65,0.25)]'
              : holding
                ? 'border-neon shadow-[0_0_50px_rgba(255,7,58,0.45)]'
                : 'border-neon/40 hover:border-neon/70'
          }`}
        >
          {!reduced && holding && !verified && (
            <>
              <span className="ripple pointer-events-none absolute inset-0 rounded-full border border-neon" />
              <span className="ripple ripple-delay pointer-events-none absolute inset-0 rounded-full border border-neon/60" />
            </>
          )}
          <svg viewBox="0 0 200 200" className="h-full w-full p-7" aria-hidden>
            {RINGS.map((r, i) => {
              const local = Math.max(0, Math.min(100, ((percent - i * seg) / seg) * 100));
              return (
                <path
                  key={r}
                  d={arcPath(r)}
                  pathLength={100}
                  strokeDasharray="100"
                  strokeDashoffset={100 - local}
                  stroke={stroke}
                  strokeWidth={3.2}
                  fill="none"
                  strokeLinecap="round"
                  opacity={0.92}
                  style={{ filter: verified ? 'drop-shadow(0 0 4px #00ff41)' : 'drop-shadow(0 0 4px rgba(255,7,58,0.6))' }}
                />
              );
            })}
            <path d="M 52 34 q 48 -20 96 0" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - percent} stroke={stroke} strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.5} />
            <path d="M 52 166 q 48 20 96 0" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - percent} stroke={stroke} strokeWidth={2.4} fill="none" strokeLinecap="round" opacity={0.5} />
            <circle cx="100" cy="100" r="5" fill={stroke} opacity={percent > 4 ? 1 : 0.2} />
          </svg>
          <span className="pointer-events-none absolute inset-x-0 -bottom-8 text-center font-term text-[10px] tracking-[0.25em] text-dim">
            SENSOR BIO-05
          </span>
        </button>

        <div className="mt-4 w-full max-w-sm">
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
            {verified
              ? 'COINCIDENCIA 99.7% — HUELLA VERIFICADA'
              : holding
                ? 'ESCANEANDO CRESTAS DERMATOGÉLICAS…'
                : 'PRESIONA Y MANTÉN SOBRE EL SENSOR'}
          </p>
        </div>
      </div>
    </PhaseFrame>
  );
}
