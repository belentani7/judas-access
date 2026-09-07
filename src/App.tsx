import { useCallback, useEffect, useState } from 'react';
import Backdrop from './components/Backdrop';
import HUD from './components/HUD';
import LiveTerminal, { pushLog } from './components/LiveTerminal';
import LockScreen from './components/screens/LockScreen';
import BootScreen from './components/screens/BootScreen';
import RetinaScan from './components/scans/RetinaScan';
import FingerprintScan from './components/scans/FingerprintScan';
import IDScan from './components/scans/IDScan';
import AgentForm from './components/AgentForm';
import JudasTest from './components/JudasTest';
import SignaturePad from './components/SignaturePad';
import GrantedScreen from './components/screens/GrantedScreen';
import Journey from './chapters/Journey';
import type { AgentData } from './lib/types';
import { beep } from './lib/sfx';

type Phase =
  | 'lock'
  | 'boot'
  | 'retina'
  | 'fingerprint'
  | 'idscan'
  | 'agent'
  | 'judas'
  | 'sign'
  | 'granted';

const PHASE_INDEX: Record<Phase, number> = {
  lock: 0,
  boot: 1,
  retina: 2,
  fingerprint: 3,
  idscan: 4,
  agent: 5,
  judas: 6,
  sign: 7,
  granted: 8,
};

const STORAGE_KEY = 'belentani_judas_agent_v1';

function loadAgent(): AgentData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data?: AgentData; expiry?: number };
    if (!parsed?.data || !parsed?.expiry || Date.now() > parsed.expiry) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function saveAgent(d: AgentData) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ data: d, expiry: Date.now() + 24 * 3600 * 1000 }),
    );
  } catch {
    /* almacenamiento no disponible */
  }
}

function clearAgent() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

const FALLBACK_AGENT: AgentData = {
  codename: 'SIN-CÓDIGO',
  division: 'HUMAN',
  divisionAlias: 'La Interfaz',
  agentId: 'JDS-0000-HUM-33',
  hash: 'FALLBACK-33',
  ts: new Date().toISOString(),
};

export default function App() {
  const [phase, setPhase] = useState<Phase>('lock');
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [returning, setReturning] = useState<AgentData | null>(null);
  const [flash, setFlash] = useState(false);
  const [journey, setJourney] = useState(false);

  useEffect(() => {
    const stored = loadAgent();
    if (stored) setReturning(stored);
  }, []);

  const go = useCallback((next: Phase) => {
    setFlash(true);
    beep(520, 0.08);
    window.setTimeout(() => setPhase(next), 380);
    window.setTimeout(() => setFlash(false), 900);
  }, []);

  /* ---- transiciones (callbacks estables para los escáneres) ---- */
  const begin = useCallback(() => {
    pushLog('Secuencia de autenticación iniciada por el operador.');
    go('boot');
  }, [go]);

  const toRetina = useCallback(() => {
    pushLog('Boot completado. Capa 1 exigida: RETINA.');
    go('retina');
  }, [go]);

  const toFingerprint = useCallback(() => {
    pushLog('Capa 1 superada: retina válida. Capa 2: HUELLA.');
    go('fingerprint');
  }, [go]);

  const toIdScan = useCallback(() => {
    pushLog('Capa 2 superada: huella válida. Capa 3: IDENTIDAD.');
    go('idscan');
  }, [go]);

  const toAgentForm = useCallback(() => {
    pushLog('Identidad confirmada. Abriendo terminal de agentes.');
    go('agent');
  }, [go]);

  const handleAgent = useCallback(
    (a: AgentData) => {
      setAgent(a);
      go('judas');
    },
    [go],
  );

  const toSignature = useCallback(() => {
    pushLog('Evaluación psicológica archivada. Pendiente: FIRMA.');
    go('sign');
  }, [go]);

  const handleSignature = useCallback(
    (dataUrl: string) => {
      setAgent((prev) => {
        const full: AgentData = { ...(prev ?? FALLBACK_AGENT), signature: dataUrl };
        saveAgent(full);
        return full;
      });
      pushLog('Contrato firmado. Vínculo establecido. Caja fuerte abierta.');
      go('granted');
    },
    [go],
  );

  const enterDirect = useCallback(() => {
    const stored = loadAgent();
    if (!stored) return;
    setAgent(stored);
    pushLog(`Agente ${stored.codename} re-autenticado. Entrada directa.`);
    go('granted');
  }, [go]);

  const restart = useCallback(() => {
    clearAgent();
    setReturning(null);
    setAgent(null);
    pushLog('Protocolo reiniciado. Memoria del agente purgada.');
    go('lock');
  }, [go]);

  const skip = useCallback(() => {
    const a: AgentData = {
      codename: 'INVITADO',
      division: 'HUMAN',
      divisionAlias: 'La Interfaz',
      agentId: 'JDS-0000-BYP-33',
      hash: 'BYPASS-33',
      ts: new Date().toISOString(),
      bypass: true,
    };
    setAgent(a);
    pushLog('BYPASS autorizado — acceso de cortesía concedido.');
    go('granted');
  }, [go]);

  const canSkip =
    phase !== 'lock' && phase !== 'granted';

  return (
    <div className="relative min-h-screen overflow-x-hidden font-body text-ash">
      <Backdrop />
      <div className="crt-overlay" aria-hidden />
      <div className="crt-band" aria-hidden />
      <div className="vignette" aria-hidden />

      {!journey && <HUD phaseIndex={PHASE_INDEX[phase]} canSkip={canSkip} onSkip={skip} />}
      <LiveTerminal />

      {journey && agent ? (
        <Journey agent={agent} onExit={() => setJourney(false)} />
      ) : (
      <main className="relative z-10 flex min-h-screen px-4 pb-32 pt-24 md:px-8 md:pb-60">
        <div className="m-auto w-full">
          {phase === 'lock' && (
            <LockScreen
              onBegin={begin}
              returning={returning}
              onEnterDirect={enterDirect}
              onRestart={restart}
            />
          )}
          {phase === 'boot' && <BootScreen onComplete={toRetina} />}
          {phase === 'retina' && <RetinaScan onComplete={toFingerprint} />}
          {phase === 'fingerprint' && <FingerprintScan onComplete={toIdScan} />}
          {phase === 'idscan' && <IDScan onComplete={toAgentForm} />}
          {phase === 'agent' && <AgentForm onComplete={handleAgent} />}
          {phase === 'judas' && <JudasTest onComplete={toSignature} />}
          {phase === 'sign' && (
            <SignaturePad codename={agent?.codename ?? 'SIN-CÓDIGO'} onComplete={handleSignature} />
          )}
          {phase === 'granted' && agent && (
            <GrantedScreen
              agent={agent}
              onRestart={restart}
              onJourney={() => {
                pushLog(`Agente ${agent.codename} ha iniciado el viaje. Destino: órbita Zion.`);
                setJourney(true);
              }}
            />
          )}
        </div>
      </main>
      )}

      {flash && (
        <div className="pointer-events-none fixed inset-0 z-[70]" aria-hidden>
          <div className="flash-fade absolute inset-0 bg-[#ff073a]/20" />
          <div className="flash-bar absolute top-[22%] right-0 left-0 h-10 bg-[#ff073a]/10" />
          <div className="flash-bar-2 absolute top-[58%] right-0 left-0 h-16 bg-[#030001]/70" />
        </div>
      )}
    </div>
  );
}
