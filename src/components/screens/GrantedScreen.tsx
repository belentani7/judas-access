import { ENTITY_IMG, NAV_LINKS, REDIRECT_URL } from '../../lib/constants';
import type { AgentData } from '../../lib/types';

interface Props {
  agent: AgentData;
  onRestart: () => void;
  onJourney: () => void;
}

export default function GrantedScreen({ agent, onRestart, onJourney }: Props) {
  const ts = (() => {
    try {
      return new Date(agent.ts).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return agent.ts;
    }
  })();

  const rows: [string, string, string?][] = [
    ['AGENTE', agent.codename, 'text-ash'],
    ['ID DE ACCESO', agent.agentId, 'text-ash'],
    ['DIVISIÓN', `${agent.division} // ${agent.divisionAlias}`, 'text-ash'],
    ['NIVEL DE ACCESO', '33 — OMNIPRESENCIA', 'text-neon'],
    ['HASH DE SESIÓN', agent.hash, 'text-dim'],
    ['TIMESTAMP', ts, 'text-dim'],
    ['ESTADO', agent.bypass ? 'ACCESO DE CORTESÍA' : 'DENTRO DEL VIAJE', 'text-term'],
  ];

  return (
    <section className="screen-enter w-full max-w-4xl">
      <div className="flex flex-wrap items-center gap-4">
        <div className="stamp inline-block border-4 border-term px-5 py-2 font-display text-lg font-bold tracking-[0.25em] text-term shadow-[0_0_35px_rgba(0,255,65,0.3)] md:text-2xl">
          ACCESO CONCEDIDO
        </div>
        <div className="stamp inline-block border-2 border-neon px-3 py-1.5 font-term text-[10px] tracking-[0.3em] text-neon" style={{ animationDelay: '0.25s' }}>
          CAJA FUERTE ABIERTA
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-display font-bold leading-[1.08] text-ash" style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.6rem)' }}>
          <span className="mask-line">
            <span>BIENVENIDO AL MUNDO</span>
          </span>
          <span className="mask-line">
            <span style={{ animationDelay: '0.15s' }}>
              DE <span className="glitch text-neon" data-text="JUDAS.">JUDAS.</span>
            </span>
          </span>
        </h2>
        <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-dim">
          Un nuevo sonido está llegando. Ya eres consciente de lo que ha sucedido y el vínculo está
          firmado: desde ahora no hay botón de salida, solo niveles más profundos.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[240px_1fr]">
        <div className="flex flex-col gap-4">
          <div className="relative overflow-hidden border border-neon/30">
            <img
              src={ENTITY_IMG}
              alt="Entidad BELENTANI"
              className="aspect-[4/5] w-full object-cover"
              style={{ filter: 'grayscale(30%) contrast(1.2)' }}
            />
            <div className="absolute inset-0 bg-[#ff073a] opacity-[0.07] mix-blend-overlay" />
            <span className="absolute bottom-2 left-2 border border-term/50 bg-black/70 px-2 py-0.5 font-term text-[9px] tracking-[0.25em] text-term">
              GUÍA DEL VIAJE
            </span>
          </div>
          {agent.signature && (
            <div className="border border-white/15 bg-black/60 p-2">
              <img src={agent.signature} alt="Firma registrada del agente" className="h-16 w-full object-contain" />
              <p className="mt-1 text-center font-term text-[8px] tracking-[0.3em] text-dim">
                FIRMA REGISTRADA
              </p>
            </div>
          )}
        </div>

        <div className="border border-white/10 bg-black/50 backdrop-blur-sm">
          <p className="border-b border-white/10 px-4 py-2.5 font-term text-[10px] tracking-[0.3em] text-neon">
            EXPEDIENTE DEL AGENTE // CLASIFICADO
          </p>
          <dl className="flex flex-col">
            {rows.map(([k, v, tone]) => (
              <div
                key={k}
                className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-white/5 px-4 py-2.5 transition-colors hover:bg-neon/5"
              >
                <dt className="font-term text-[9px] tracking-[0.3em] text-dim">{k}</dt>
                <dd className={`break-all font-term text-xs tracking-[0.15em] ${tone ?? 'text-ash'}`}>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="px-4 py-3 font-body text-xs leading-relaxed text-dim/80">
            El Cronista ha archivado tu sesión. Si la realidad vuelve a no encontrarse, recuerda:
            ERROR_404 no es un fallo, es una puerta.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <p className="font-term text-[10px] tracking-[0.3em] text-dim">
          SELECCIONA DESTINO — EL PORTAL TE ESPERA
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {NAV_LINKS.map((n) => (
            <a
              key={n}
              href={REDIRECT_URL}
              target="_blank"
              rel="noreferrer"
              className="group border border-white/10 bg-black/40 px-3 py-3.5 text-center font-term text-[10px] tracking-[0.25em] text-dim transition-all duration-200 hover:-translate-y-0.5 hover:border-neon hover:bg-neon/10 hover:text-neon hover:shadow-[0_0_20px_rgba(255,7,58,0.2)]"
            >
              {n}
              <span className="mt-1 block text-[8px] text-dim/50 transition-colors group-hover:text-term">
                ▸ IR
              </span>
            </a>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={onJourney} className="btn-neon pulse-dot text-base">
            ▶ INICIAR EL VIAJE — CAPÍTULO II
          </button>
          <div className="flex items-center gap-3">
            <a href={REDIRECT_URL} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
              PORTAL EXTERNO ↗
            </a>
            <button type="button" onClick={onRestart} className="btn-ghost text-xs">
              ⟲ REINICIAR PROTOCOLO
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
