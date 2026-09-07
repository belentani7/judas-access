import { useEffect, useRef, useState } from 'react';
import PhaseFrame from '../PhaseFrame';
import { GLYPHS, usePrefersReducedMotion } from '../../lib/hooks';
import { sfxErr, sfxOk } from '../../lib/sfx';
import { ENTITY_IMG } from '../../lib/constants';

const ZONES = [
  { label: 'SUJETO', value: 'PEDRO BELENTANI' },
  { label: 'ORIGEN', value: 'SÃO PAULO → BARCELONA' },
  { label: 'CLASE', value: 'ARTISTA VERIFICADO // ENTIDAD-05' },
];

interface Props {
  onComplete: () => void;
}

/** Capa 3 — minijuego de timing: capturar cada zona cuando la línea la atraviesa. */
export default function IDScan({ onComplete }: Props) {
  const [zoneIdx, setZoneIdx] = useState(0);
  const [captured, setCaptured] = useState<boolean[]>([false, false, false]);
  const [decoded, setDecoded] = useState<string[]>(['—', '—', '—']);
  const [misses, setMisses] = useState(0);
  const [fail, setFail] = useState(false);
  const [done, setDone] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef(0);
  const zoneRef = useRef(0);
  const doneRef = useRef(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const speed = reduced ? 24 : 44;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      posRef.current += dt * speed;
      if (posRef.current > 100) posRef.current = 0;
      const el = lineRef.current;
      if (el) el.style.top = `${posRef.current}%`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const decodeField = (i: number) => {
    const value = ZONES[i].value;
    let f = 0;
    const id = window.setInterval(() => {
      f += 1;
      let s = '';
      for (let j = 0; j < value.length; j += 1) {
        s += j < f ? value[j] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDecoded((d) => d.map((v, k) => (k === i ? s : v)));
      if (f >= value.length) window.clearInterval(id);
    }, 34);
  };

  const capture = () => {
    if (doneRef.current) return;
    const card = cardRef.current;
    const row = rowsRef.current[zoneRef.current];
    if (!card || !row) return;
    const cardRect = card.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const lineY = (posRef.current / 100) * cardRect.height;
    const top = rowRect.top - cardRect.top;
    const bottom = top + rowRect.height;
    if (lineY >= top - 10 && lineY <= bottom + 10) {
      sfxOk();
      decodeField(zoneRef.current);
      setCaptured((c) => c.map((v, i) => (i === zoneRef.current ? true : v)));
      if (zoneRef.current >= ZONES.length - 1) {
        doneRef.current = true;
        setDone(true);
        window.setTimeout(onComplete, 1400);
      } else {
        zoneRef.current += 1;
        setZoneIdx(zoneRef.current);
      }
    } else {
      sfxErr();
      setMisses((m) => m + 1);
      setFail(true);
      window.setTimeout(() => setFail(false), 480);
    }
  };

  return (
    <PhaseFrame
      phase={3}
      total={6}
      label="CAPA 03 // REGISTRO CIVIL GLOBAL"
      title="VERIFICACIÓN DE ID"
      subtitle="La línea de barrido cruza el documento. Dispara CAPTURAR justo cuando atraviese la zona iluminada para decodificar cada campo. Fuera de rango, la lectura falla."
      status={done ? 'IDENTIDAD CONFIRMADA — ENTIDAD-05 EN EL SISTEMA' : `ZONA ${zoneIdx + 1}/3 ${misses > 0 ? `· FALLOS: ${misses}` : ''}`}
    >
      <div className="flex flex-col items-center gap-5">
        <div
          ref={cardRef}
          className={`relative w-full max-w-md overflow-hidden border bg-gradient-to-b from-[#140409] to-[#070103] transition-colors ${
            fail ? 'shake border-neon' : 'border-neon/40'
          }`}
        >
          <div className="flex items-center justify-between border-b border-neon/25 px-4 py-2">
            <span className="font-term text-[10px] tracking-[0.2em] text-neon">
              BELENTANI GLOBAL REGISTRY
            </span>
            <span className="border border-term/40 px-1.5 py-0.5 font-term text-[9px] tracking-[0.2em] text-term">
              NIVEL-33
            </span>
          </div>

          <div className="grid grid-cols-[86px_1fr] gap-4 p-4 sm:grid-cols-[104px_1fr]">
            <div className="relative self-start overflow-hidden border border-neon/30">
              <img
                src={ENTITY_IMG}
                alt="Registro visual de la entidad"
                className="aspect-[4/5] w-full object-cover opacity-90 saturate-50 contrast-125"
                style={{ filter: 'grayscale(35%) sepia(18%) hue-rotate(-18deg)' }}
              />
              <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-center font-term text-[8px] tracking-[0.2em] text-neon">
                ENTIDAD-05
              </span>
            </div>

            <div className="flex flex-col justify-center gap-2">
              {ZONES.map((z, i) => (
                <div
                  key={z.label}
                  ref={(el) => {
                    rowsRef.current[i] = el;
                  }}
                  className={`border px-2.5 py-1.5 transition-all duration-300 ${
                    captured[i]
                      ? 'border-term/50 bg-term/5'
                      : i === zoneIdx && !done
                        ? 'border-neon/70 bg-neon/10 shadow-[0_0_16px_rgba(255,7,58,0.2)]'
                        : 'border-white/10 bg-black/30'
                  }`}
                >
                  <p className="font-term text-[8px] tracking-[0.25em] text-dim">
                    {z.label} {captured[i] && <span className="text-term">✓ DECODIFICADO</span>}
                  </p>
                  <p
                    className={`mt-0.5 break-words font-term text-[11px] tracking-wider sm:text-xs ${
                      captured[i] ? 'text-term' : 'text-ash'
                    }`}
                  >
                    {decoded[i]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            ref={lineRef}
            className={`pointer-events-none absolute inset-x-0 h-[2px] ${
              done ? 'bg-term shadow-[0_0_14px_#00ff41]' : 'bg-term/90 shadow-[0_0_12px_#00ff41]'
            }`}
            style={{ top: '0%' }}
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <button type="button" onClick={capture} disabled={done} className="btn-neon text-sm">
            ◉ CAPTURAR ZONA
          </button>
          <p className={`font-term text-[10px] tracking-[0.2em] ${fail ? 'text-neon' : 'text-dim'}`}>
            {fail ? '>> FUERA DE RANGO — REINTENTA' : 'Dispara cuando la línea cruce la zona roja'}
          </p>
        </div>
      </div>
    </PhaseFrame>
  );
}
