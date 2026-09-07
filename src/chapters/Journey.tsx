import { useCallback, useState } from 'react';
import type { AgentData } from '../lib/types';
import { REDIRECT_URL } from '../lib/constants';
import PlanetViewer from './PlanetViewer';
import Hyperspace from './Hyperspace';
import EscapeRoom from './EscapeRoom';
import VoiceCore from './VoiceCore';
import ArchiveScene from './ArchiveScene';
import { pushLog } from '../components/LiveTerminal';
import { beep } from '../lib/sfx';

type Scene = 'orbit' | 'room' | 'core' | 'archive';

const SCENE_META: Record<Scene, { label: string; sub: string }> = {
  orbit: { label: 'ÓRBITA ZION', sub: 'Visor de planetas del multiverso' },
  room: { label: 'CÁMARA S1', sub: 'Escape room — rojo/azul' },
  core: { label: 'NÚCLEO JUDAS', sub: 'Interfaz de voz del artefacto' },
  archive: { label: 'ARCHIVO VENOM', sub: 'Transmisiones recuperadas' },
};

interface Props {
  agent: AgentData;
  onExit: () => void;
}

export default function Journey({ agent, onExit }: Props) {
  const [scene, setScene] = useState<Scene>('orbit');
  const [warpTo, setWarpTo] = useState<Scene | null>(null);
  const [roomSolved, setRoomSolved] = useState(false);
  const [coreDone, setCoreDone] = useState(false);

  const travel = useCallback(
    (target: Scene) => {
      if (target === scene) return;
      if (target === 'core' && !roomSolved) {
        pushLog('El Núcleo está sellado: primero abre la Cámara S1.');
        beep(160, 0.15, 'sawtooth', 0.03);
        return;
      }
      beep(520, 0.06);
      setWarpTo(target);
    },
    [scene, roomSolved],
  );

  const onWarpDone = useCallback(() => {
    if (warpTo) {
      setScene(warpTo);
      pushLog(`Salto hiperespacial completado: ${SCENE_META[warpTo].label}.`);
    }
    setWarpTo(null);
  }, [warpTo]);

  const order: Scene[] = ['orbit', 'room', 'core', 'archive'];
  const locked = (s: Scene) => s === 'core' && !roomSolved;

  return (
    <div className="relative z-10 flex min-h-screen flex-col pt-16">
      {/* cabecera del capítulo */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-neon/20 bg-black/60 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center border border-neon/70 font-display text-sm font-bold text-neon shadow-[0_0_14px_rgba(255,7,58,0.35)]">
              B
            </span>
            <div className="leading-tight">
              <p className="font-display text-[12px] font-bold tracking-[0.2em] text-ash">CAPÍTULO II — EL VIAJE</p>
              <p className="font-term text-[9px] tracking-[0.3em] text-dim">
                AGENTE {agent.codename} // {agent.division}
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-1.5" aria-label="Escenas del viaje">
            {order.map((s) => {
              const isLocked = locked(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => travel(s)}
                  className={`border px-2.5 py-1.5 font-term text-[9px] tracking-[0.18em] transition-all ${
                    scene === s
                      ? 'border-neon bg-neon/15 text-neon shadow-[0_0_14px_rgba(255,7,58,0.25)]'
                      : isLocked
                        ? 'cursor-not-allowed border-white/10 text-dim/40'
                        : 'border-white/15 text-dim hover:border-neon/50 hover:text-neon'
                  }`}
                >
                  {isLocked ? '▮▮ ' : ''}
                  {SCENE_META[s].label}
                </button>
              );
            })}
          </nav>
          <button type="button" onClick={onExit} className="btn-ghost px-2.5 py-1.5 text-[9px]">
            ⟲ PROTOCOLO
          </button>
        </div>
        {/* progreso del capítulo */}
        <div className="h-0.5 w-full bg-black/60">
          <div
            className="h-full bg-gradient-to-r from-blood to-neon shadow-[0_0_10px_#ff073a] transition-all duration-700"
            style={{ width: `${(order.indexOf(scene) / (order.length - 1)) * 70 + (coreDone ? 30 : roomSolved ? 18 : 0)}%` }}
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-start justify-center px-4 py-8 md:px-6">
        <div className="w-full">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="font-display text-sm font-bold tracking-[0.3em] text-ash">
              {SCENE_META[scene].label}
            </h1>
            <p className="font-term text-[10px] tracking-[0.25em] text-dim">{SCENE_META[scene].sub}</p>
          </div>

          {scene === 'orbit' && (
            <PlanetViewer
              codename={agent.codename}
              onDescend={() => travel('room')}
              onOpenArchive={() => travel('archive')}
            />
          )}
          {scene === 'room' && (
            <EscapeRoom
              codename={agent.codename}
              onSolve={() => {
                setRoomSolved(true);
                travel('core');
              }}
            />
          )}
          {scene === 'core' && (
            <VoiceCore
              codename={agent.codename}
              onComplete={() => {
                setCoreDone(true);
                travel('archive');
              }}
            />
          )}
          {scene === 'archive' && <ArchiveScene />}

          {/* estado del viaje */}
          <div className="mt-8 grid gap-2 border border-white/10 bg-black/40 p-4 sm:grid-cols-3">
            <p className="font-term text-[10px] tracking-[0.2em]">
              <span className={roomSolved ? 'text-term' : 'text-neon'}>{roomSolved ? '✓' : '▲'}</span>{' '}
              <span className="text-dim">CÁMARA S1 {roomSolved ? 'ABIERTA' : 'SELLADA'}</span>
            </p>
            <p className="font-term text-[10px] tracking-[0.2em]">
              <span className={coreDone ? 'text-term' : 'text-neon'}>{coreDone ? '✓' : '▲'}</span>{' '}
              <span className="text-dim">VÍNCULO DE VOZ {coreDone ? 'CONFIRMADO' : 'PENDIENTE'}</span>
            </p>
            <p className="font-term text-[10px] tracking-[0.2em]">
              <span className="text-term">✓</span> <span className="text-dim">ARCHIVO VENOM DESENCRYPTADO</span>
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-term text-[9px] tracking-[0.25em] text-dim/70">
              EL VIAJE CONTINÚA EN LA SUPERFICIE — TU WEB REAL ESPERA
            </p>
            <a href={REDIRECT_URL} target="_blank" rel="noreferrer" className="btn-neon text-xs">
              ENTRAR A JUDAS-EXPERIENCE ↗
            </a>
          </div>
        </div>
      </main>

      {warpTo && <Hyperspace label={`SALTO A ${SCENE_META[warpTo].label}`} onDone={onWarpDone} />}
    </div>
  );
}
