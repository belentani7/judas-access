import { useEffect, useState } from 'react';
import { pushLog } from '../components/LiveTerminal';

interface Repo {
  name: string;
  url: string;
  desc: string;
  tag: string;
  tagTone: 'real' | 'signal' | 'search';
}

const REPOS: Repo[] = [
  {
    name: 'github.com/belentani7',
    url: 'https://github.com/belentani7',
    desc: 'Full-Stack TS/Python · Creative tech · Barcelona — catálogo, agente, automatización, observabilidad y diseño cinematográfico.',
    tag: 'REAL // CONFIRMADO',
    tagTone: 'real',
  },
  {
    name: 'instagram @belentani_',
    url: 'https://www.instagram.com/belentani_/',
    desc: '8.7K seguidores · 1.259 transmisiones — «I am that, I am. Asherah’s Legacy. “Mon Amour” On Spotify».',
    tag: 'SEÑAL SOCIAL',
    tagTone: 'signal',
  },
  {
    name: 'facebook / Pedro Belentani',
    url: 'https://www.facebook.com/belentani/',
    desc: '«Initializing the BELENTANI PROTOCOL — in a world full of denial, lack of self-awareness and psychological noise…»',
    tag: 'TRANSMISIÓN',
    tagTone: 'signal',
  },
  {
    name: 'búsqueda: “belentani omega”',
    url: 'https://github.com/search?q=belentani+omega&type=repositories',
    desc: 'Rastro del protocolo Omega. El Cronista aún no confirma el repositorio: la búsqueda queda armada para el agente.',
    tag: 'BÚSQUEDA ARMADA',
    tagTone: 'search',
  },
  {
    name: 'búsqueda: “belentaniobjetos”',
    url: 'https://github.com/search?q=belentaniobjetos&type=repositories',
    desc: 'Inventario de objetos del artefacto. Si existe, está encriptado; si no existe, está esperando ser creado.',
    tag: 'BÚSQUEDA ARMADA',
    tagTone: 'search',
  },
  {
    name: 'búsqueda: “belentani judas”',
    url: 'https://github.com/search?q=belentani+judas&type=repositories',
    desc: 'Núcleo Judas en código abierto. La traición como algoritmo, la redención como pull request.',
    tag: 'BÚSQUEDA ARMADA',
    tagTone: 'search',
  },
  {
    name: 'búsqueda: “manus planets”',
    url: 'https://github.com/search?q=manus+planets&type=repositories',
    desc: 'La constelación de planetas generada por Manus AI. Coordenadas externas del visor orbital que acabas de pilotar.',
    tag: 'CONSTELACIÓN',
    tagTone: 'search',
  },
];

const LOG_FEED = [
  'Descifrando metadatos de la constelación…',
  'El rastro de la serpiente cruza tres plataformas.',
  'Commits encontrados: la marca respira en TypeScript.',
  'Manus AI: órbitas de planetas detectadas en el sector.',
  'El Artefacto dejó huella en Barcelona, 2026.',
  'Archivando señales para el expediente del agente…',
];

export default function ArchiveScene() {
  const [logIdx, setLogIdx] = useState(0);
  const [revealed, setRevealed] = useState<number>(0);

  useEffect(() => {
    const id = window.setInterval(() => setLogIdx((i) => (i + 1) % LOG_FEED.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (revealed >= REPOS.length) return;
    const id = window.setTimeout(() => setRevealed((r) => r + 1), revealed === 0 ? 300 : 420);
    return () => window.clearTimeout(id);
  }, [revealed]);

  useEffect(() => {
    if (revealed === 1) pushLog('ARCHIVO // VENOM desencriptado: 7 transmisiones.');
  }, [revealed]);

  const tone = (t: Repo['tagTone']) =>
    t === 'real'
      ? 'border-term/50 bg-term/10 text-term'
      : t === 'signal'
        ? 'border-neon/50 bg-neon/10 text-neon'
        : 'border-dim/40 bg-white/5 text-dim';

  return (
    <section className="screen-enter w-full">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-term text-[10px] tracking-[0.3em] text-neon">TRANSMISIÓN RECUPERADA</p>
          <h2 className="glitch mt-1 font-display text-2xl font-bold tracking-wide text-ash" data-text="ARCHIVO // VENOM">
            ARCHIVO // VENOM
          </h2>
        </div>
        <p className="font-term text-[10px] tracking-[0.2em] text-dim">
          &gt; {LOG_FEED[logIdx]}
          <span className="cursor-blink text-term">_</span>
        </p>
      </div>

      <p className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-dim">
        La serpiente cambia de piel, el registro permanece. Estas son las señales reales que el
        Cronista ha localizado fuera de la caja fuerte: el perfil confirmado del artista, sus
        transmisiones sociales y las búsquedas armadas sobre los repositorios del protocolo.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {REPOS.slice(0, revealed).map((r) => (
          <a
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="group relative border border-white/10 bg-black/50 p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-neon/60 hover:bg-neon/5 hover:shadow-[0_0_28px_rgba(255,7,58,0.18)]"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-term text-sm tracking-wider text-ash transition-colors group-hover:text-neon">
                {r.name}
              </p>
              <span className={`shrink-0 border px-1.5 py-0.5 font-term text-[8px] tracking-[0.2em] ${tone(r.tagTone)}`}>
                {r.tag}
              </span>
            </div>
            <p className="mt-2 font-body text-xs leading-relaxed text-dim">{r.desc}</p>
            <p className="mt-3 font-term text-[10px] tracking-[0.25em] text-dim transition-colors group-hover:text-term">
              ABRIR TRANSMISIÓN <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </p>
          </a>
        ))}
        {revealed < REPOS.length && (
          <div className="flex items-center justify-center border border-dashed border-white/15 p-4">
            <p className="font-term text-[10px] tracking-[0.3em] text-dim/60">
              DESCIFRANDO SEÑAL {revealed + 1}/{REPOS.length}…
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
