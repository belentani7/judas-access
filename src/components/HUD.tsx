import { useEffect, useState } from 'react';
import { PHASES } from '../lib/constants';

interface Props {
  phaseIndex: number;
  canSkip: boolean;
  onSkip: () => void;
}

export default function HUD({ phaseIndex, canSkip, onSkip }: Props) {
  const [clock, setClock] = useState('--:--:--');
  const [cpu, setCpu] = useState(33);
  const [mem, setMem] = useState(61);

  useEffect(() => {
    const f = () => setClock(new Date().toLocaleTimeString('es-ES', { hour12: false }));
    f();
    const id = window.setInterval(f, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCpu(18 + Math.floor(Math.random() * 64));
      setMem(46 + Math.floor(Math.random() * 34));
    }, 2100);
    return () => window.clearInterval(id);
  }, []);

  const label = PHASES[phaseIndex] ?? '—';

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-neon/20 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-neon/70 font-display text-sm font-bold text-neon shadow-[0_0_14px_rgba(255,7,58,0.35)]">
              B
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-[13px] font-bold tracking-[0.2em] text-ash">
                BELENTANI
              </p>
              <p className="truncate font-term text-[9px] tracking-[0.3em] text-dim">
                JUDAS ERA // TERMINAL SEGURO
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Progreso del protocolo">
            {PHASES.map((p, i) => (
              <span key={p} className="flex items-center gap-1.5">
                <span
                  title={p}
                  className={`h-2 w-2 rotate-45 border transition-all duration-500 ${
                    i < phaseIndex
                      ? 'border-neon bg-neon shadow-[0_0_8px_#ff073a]'
                      : i === phaseIndex
                        ? 'pulse-dot border-neon bg-transparent'
                        : 'border-white/20 bg-transparent'
                  }`}
                />
                {i === phaseIndex && (
                  <span className="ml-1 font-term text-[9px] tracking-[0.25em] text-neon">{p}</span>
                )}
              </span>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3 md:gap-4">
            <span className="hidden font-term text-[11px] tracking-widest text-dim sm:block">
              {clock}
            </span>
            <span className="flex items-center gap-1.5 font-term text-[9px] tracking-[0.2em] text-term">
              <span className="pulse-dot-green h-1.5 w-1.5 rounded-full bg-term" />
              ONLINE
            </span>
            {canSkip ? (
              <button
                type="button"
                onClick={onSkip}
                className="border border-white/10 px-2.5 py-1 font-term text-[9px] tracking-[0.2em] text-dim transition-colors hover:border-neon/60 hover:text-neon"
              >
                SALTAR &gt;&gt;
              </button>
            ) : (
              <span className="font-term text-[9px] tracking-[0.2em] text-neon lg:hidden">
                {label} {phaseIndex + 1}/9
              </span>
            )}
          </div>
        </div>
      </header>

      <aside
        className="fixed bottom-4 right-4 z-40 hidden text-right font-term text-[10px] leading-relaxed tracking-widest text-dim/80 md:block"
        aria-hidden
      >
        <p>41.3874° N — 2.1686° E // BCN</p>
        <p className="text-neon/70">FREQ 432.00 Hz · ZION-LINK</p>
        <p>
          CPU {cpu}% · MEM {mem}% · SEÑAL ▮▮▮▯
        </p>
      </aside>
    </>
  );
}
