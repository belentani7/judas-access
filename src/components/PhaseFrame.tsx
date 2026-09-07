import type { ReactNode } from 'react';
import { useScramble } from '../lib/hooks';

interface Props {
  phase: number;
  total: number;
  label: string;
  title: string;
  subtitle: string;
  status?: string;
  children: ReactNode;
}

function Corners() {
  const c = 'absolute h-4 w-4 border-neon/70';
  return (
    <>
      <span className={`${c} -top-px -left-px border-t border-l`} />
      <span className={`${c} -top-px -right-px border-t border-r`} />
      <span className={`${c} -bottom-px -left-px border-b border-l`} />
      <span className={`${c} -bottom-px -right-px border-b border-r`} />
    </>
  );
}

export default function PhaseFrame({ phase, total, label, title, subtitle, status, children }: Props) {
  const t = useScramble(title);
  return (
    <section className="screen-enter relative w-full max-w-2xl">
      <div className="mb-3 flex items-center justify-between font-term text-[10px] tracking-[0.25em]">
        <span className="text-neon">{label}</span>
        <span className="text-dim">
          FASE {String(phase).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
      <div className="mb-5 h-px w-full bg-white/10">
        <div
          className="h-px bg-neon shadow-[0_0_8px_#ff073a] transition-all duration-700"
          style={{ width: `${((phase - 1) / Math.max(1, total - 1)) * 100}%` }}
        />
      </div>
      <h2 className="glitch font-display text-[clamp(1.3rem,4vw,2.1rem)] font-bold tracking-wide text-ash" data-text={t}>
        {t}
      </h2>
      <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-dim">{subtitle}</p>
      {status && (
        <p className="mt-3 font-term text-[11px] tracking-[0.2em] text-term" role="status">
          {status}
        </p>
      )}
      <div className="relative mt-6 border border-white/10 bg-black/50 p-5 backdrop-blur-sm md:p-7">
        <Corners />
        {children}
      </div>
    </section>
  );
}
