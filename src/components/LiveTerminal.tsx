import { useEffect, useRef, useState } from 'react';
import { TERMINAL_LOGS } from '../lib/constants';

/** Emite una línea personalizada al terminal vivo desde cualquier parte. */
export function pushLog(msg: string) {
  window.dispatchEvent(new CustomEvent<string>('jdas:log', { detail: msg }));
}

export default function LiveTerminal() {
  const [lines, setLines] = useState<string[]>([
    'Sistema en línea.',
    'Analizando patrones de interacción del usuario...',
  ]);
  const idx = useRef(0);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const add = (l: string) => setLines((prev) => [...prev.slice(-7), l]);
    const onCustom = (e: Event) => add((e as CustomEvent<string>).detail);
    window.addEventListener('jdas:log', onCustom);
    const id = window.setInterval(() => {
      add(TERMINAL_LOGS[idx.current % TERMINAL_LOGS.length]);
      idx.current += 1;
    }, 4600);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('jdas:log', onCustom);
    };
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [lines]);

  return (
    <aside className="fixed bottom-4 left-4 z-40 hidden w-80 border border-neon/20 bg-black/70 backdrop-blur-sm md:block">
      <header className="flex items-center justify-between border-b border-neon/20 px-3 py-1.5">
        <span className="font-term text-[10px] tracking-[0.22em] text-dim">
          SYSTEM CORE TERMINAL
        </span>
        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-neon" />
      </header>
      <div
        ref={boxRef}
        className="h-32 overflow-hidden px-3 py-2 font-term text-[11px] leading-relaxed text-term/90"
      >
        {lines.map((l, i) => (
          <div key={`${i}-${l}`} className={i === lines.length - 1 ? 'opacity-100' : 'opacity-50'}>
            &gt; {l}
          </div>
        ))}
        <div className="text-neon">
          &gt; <span className="cursor-blink">_</span>
        </div>
      </div>
    </aside>
  );
}
