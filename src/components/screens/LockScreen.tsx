import { useScramble } from '../../lib/hooks';
import { ENTITY_IMG, MARQUEE_TEXT, SCAN_STEPS } from '../../lib/constants';
import type { AgentData } from '../../lib/types';

interface Props {
  onBegin: () => void;
  returning: AgentData | null;
  onEnterDirect: () => void;
  onRestart: () => void;
}

export default function LockScreen({ onBegin, returning, onEnterDirect, onRestart }: Props) {
  const kicker = useScramble('// NÚCLEO JUDAS — TERMINAL 33 · SOLO PERSONAL AUTORIZADO');

  return (
    <section className="screen-enter w-full max-w-5xl">
      <div className="marquee mb-6 border-y border-neon/25 py-1.5 font-term text-[10px] tracking-[0.3em] text-neon/80">
        <div>
          {MARQUEE_TEXT}
          {MARQUEE_TEXT}
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="font-term text-[11px] tracking-[0.22em] text-neon">{kicker}</p>

          <h1
            className="glitch mt-4 font-display font-bold leading-[1.05] text-ash"
            data-text="ACCESO RESTRINGIDO"
            style={{ fontSize: 'clamp(2rem, 6.5vw, 3.9rem)' }}
          >
            ACCESO
            <br />
            RESTRINGIDO
          </h1>

          <p className="mt-5 max-w-lg font-body text-sm leading-relaxed text-dim">
            Este terminal pertenece al núcleo <span className="text-neon">JUDAS</span> y está
            sellado por el Protocolo Omnipresencia v3.0. Para cruzar la puerta, el sistema exige
            verificación biométrica completa y firma de confidencialidad. Cada intento queda
            registrado en el archivo del Cronista.
          </p>

          <ol className="mt-6 max-w-lg border-l-2 border-blood pl-4">
            {SCAN_STEPS.map((s, i) => (
              <li
                key={s}
                className={`flex items-center justify-between gap-3 border-b border-white/5 py-1.5 font-term text-[11px] tracking-[0.18em] ${
                  returning ? 'text-dim/60' : 'text-ash/90'
                }`}
              >
                <span>
                  <span className="mr-3 text-neon">{String(i + 1).padStart(2, '0')}</span>
                  {s}
                </span>
                {returning && <span className="text-term">✓ COMPLETADO</span>}
              </li>
            ))}
          </ol>

          {returning ? (
            <div className="screen-enter mt-7 max-w-lg border border-term/35 bg-term/5 p-4">
              <p className="font-term text-[10px] tracking-[0.3em] text-term">
                AGENTE RECONOCIDO
              </p>
              <p className="mt-1 font-term text-lg tracking-[0.15em] text-ash">
                {returning.codename} <span className="text-dim">· {returning.agentId}</span>
              </p>
              <p className="mt-1 font-body text-xs text-dim">
                Tu vínculo sigue activo (expira en 24 h). Puedes entrar sin repetir la misión o
                quemar el registro y empezar de cero.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={onEnterDirect} className="btn-neon text-sm">
                  ENTRADA DIRECTA &gt;&gt;
                </button>
                <button type="button" onClick={onRestart} className="btn-ghost text-xs">
                  REINICIAR PROTOCOLO
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-7">
              <button type="button" onClick={onBegin} className="btn-neon text-base">
                ▶ INICIAR SECUENCIA DE ACCESO
              </button>
              <p className="mt-3 font-term text-[10px] tracking-[0.2em] text-dim/70">
                El acceso no autorizado activa el protocolo de silencio.
              </p>
            </div>
          )}
        </div>

        <aside className="relative border border-neon/25 bg-black/50 backdrop-blur-sm">
          <div className="absolute -top-px -left-px h-4 w-4 border-t border-l border-neon/70" />
          <div className="absolute -top-px -right-px h-4 w-4 border-t border-r border-neon/70" />
          <div className="absolute -bottom-px -left-px h-4 w-4 border-b border-l border-neon/70" />
          <div className="absolute -right-px -bottom-px h-4 w-4 border-r border-b border-neon/70" />

          <div className="relative overflow-hidden">
            <img
              src={ENTITY_IMG}
              alt="Entidad BELENTANI — registro visual"
              className="aspect-[4/5] w-full object-cover opacity-90"
              style={{ filter: 'grayscale(30%) contrast(1.2)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050002] via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[#ff073a] opacity-[0.07] mix-blend-overlay" />
            <div className="absolute right-2 top-2 border border-neon/60 bg-black/70 px-2 py-1 font-term text-[9px] tracking-[0.25em] text-neon">
              RECORD_01 // THE ARCHITECT
            </div>
          </div>

          <div className="p-4">
            <p className="font-display text-xl font-bold tracking-[0.25em] text-ash">BELENTANI</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 border border-term/40 px-2 py-1 font-term text-[9px] tracking-[0.2em] text-term">
                <span className="pulse-dot-green h-1.5 w-1.5 rounded-full bg-term" />
                VERIFIED GLOBAL ARTIST
              </span>
              <span className="flex items-center gap-1.5 border border-neon/50 px-2 py-1 font-term text-[9px] tracking-[0.2em] text-neon">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-neon" />
                ENTITY ACTIVE
              </span>
            </div>
            <dl className="mt-4 flex flex-col gap-1.5 border-t border-white/10 pt-3 font-term text-[10px] tracking-[0.2em]">
              <div className="flex justify-between">
                <dt className="text-dim">ERA</dt>
                <dd className="text-neon">JUDAS</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-dim">FRECUENCIA</dt>
                <dd className="text-ash">432.00 Hz</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-dim">DIMENSIÓN</dt>
                <dd className="text-ash">ZION</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-dim">ESTADO</dt>
                <dd className="text-term">ESPERANDO OPERADOR</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}
