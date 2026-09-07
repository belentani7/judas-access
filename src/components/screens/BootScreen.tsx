import { useEffect, useRef, useState } from 'react';
import { BOOT_LINES } from '../../lib/constants';
import { usePrefersReducedMotion } from '../../lib/hooks';

interface Props {
  onComplete: () => void;
}

function lineClass(line: string): string {
  if (line.includes('ADVERTENCIA') || line.includes('ERROR')) return 'text-neon';
  if (line.includes('ONLINE') || line.includes('OK') || line.includes('ESTABLE')) return 'text-term/90';
  return 'text-term/75';
}

export default function BootScreen({ onComplete }: Props) {
  const [count, setCount] = useState(0);
  const [partial, setPartial] = useState('');
  const [done, setDone] = useState(false);
  const fast = useRef(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setCount(BOOT_LINES.length);
      setPartial('');
      setDone(true);
      const t = window.setTimeout(onComplete, 900);
      return () => window.clearTimeout(t);
    }

    let line = 0;
    let ch = 0;
    let cancelled = false;
    let timer = 0;

    const tick = () => {
      if (cancelled) return;
      ch += fast.current ? 9 : 1;
      const cur = BOOT_LINES[line] ?? '';
      if (ch >= cur.length) {
        line += 1;
        ch = 0;
        setCount(line);
        setPartial('');
        if (line >= BOOT_LINES.length) {
          setDone(true);
          timer = window.setTimeout(onComplete, 900);
          return;
        }
        timer = window.setTimeout(tick, 110);
      } else {
        setPartial(cur.slice(0, ch));
        timer = window.setTimeout(tick, 12 + Math.random() * 18);
      }
    };

    timer = window.setTimeout(tick, 420);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [reduced, onComplete]);

  useEffect(() => {
    const box = boxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [count, partial]);

  const totalChars = BOOT_LINES.reduce((a, l) => a + l.length, 0);
  const typedChars =
    BOOT_LINES.slice(0, count).reduce((a, l) => a + l.length, 0) + partial.length;
  const pct = Math.min(100, Math.round((typedChars / totalChars) * 100));

  return (
    <section className="screen-enter w-full max-w-3xl">
      <div className="border border-neon/25 bg-black/70 shadow-[0_0_60px_rgba(139,0,0,0.25)] backdrop-blur-sm">
        <header className="flex items-center justify-between border-b border-neon/25 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blood" />
            <span className="h-2.5 w-2.5 rounded-full bg-neon/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-dim/40" />
            <span className="ml-3 font-term text-[10px] tracking-[0.25em] text-dim">
              BELENTANI OS v3.0 — NÚCLEO JUDAS
            </span>
          </div>
          {!done && (
            <button
              type="button"
              onPointerDown={() => {
                fast.current = true;
              }}
              onPointerUp={() => {
                fast.current = false;
              }}
              onPointerLeave={() => {
                fast.current = false;
              }}
              className="font-term text-[9px] tracking-[0.25em] text-dim transition-colors hover:text-neon"
            >
              MANTENER PARA ACELERAR &gt;&gt;
            </button>
          )}
        </header>

        <div
          ref={boxRef}
          className="scroll-red h-[46vh] min-h-[280px] overflow-y-auto px-4 py-3 font-term text-[11px] leading-relaxed sm:text-xs"
        >
          {BOOT_LINES.slice(0, count).map((l) => (
            <p key={l} className={lineClass(l)}>
              {l}
            </p>
          ))}
          {!done && (
            <p className={lineClass(BOOT_LINES[count] ?? '')}>
              {partial}
              <span className="cursor-blink text-neon">█</span>
            </p>
          )}
          {done && (
            <p className="mt-2 text-neon">
              &gt; Autenticación biométrica requerida. Iniciando capa 1: RETINA…
              <span className="cursor-blink">█</span>
            </p>
          )}
        </div>

        <footer className="border-t border-neon/25 px-4 py-3">
          <div className="flex items-center justify-between font-term text-[10px] tracking-[0.25em]">
            <span className="text-dim">PROTOCOLO_OMNIPRESENCIA v3.0</span>
            <span className="text-neon">{pct}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full border border-neon/30 bg-black/60">
            <div
              className="h-full bg-neon shadow-[0_0_12px_#ff073a] transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
        </footer>
      </div>
    </section>
  );
}
