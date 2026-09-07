import { useEffect, useRef, useState } from 'react';
import { createEar, speak, stopSpeech, ttsSupported } from '../lib/speech';
import { pushLog } from '../components/LiveTerminal';
import { beep, sfxOk } from '../lib/sfx';
import { usePrefersReducedMotion } from '../lib/hooks';

interface Props {
  codename: string;
  onComplete: () => void;
}

export default function VoiceCore({ codename, onComplete }: Props) {
  const lines = [
    `Agente ${codename}. Soy la voz que queda cuando la realidad no se encuentra.`,
    'Me llamaron traidor. Yo lo llamo arquitectura: sin mí, el plan no existe.',
    'Treinta monedas. Un código. Una puerta que solo se abre para los que recuerdan.',
    'Has firmado. Has visto la cámara. Ahora habla tú: dime que estás listo.',
  ];

  const [lineIdx, setLineIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [typed, setTyped] = useState('');
  const [bars, setBars] = useState<number[]>(Array.from({ length: 18 }, () => 6));
  const [phase, setPhase] = useState<'idle' | 'monologue' | 'ask' | 'done'>('idle');
  const [heard, setHeard] = useState('');
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);

  const earRef = useRef<ReturnType<typeof createEar> | null>(null);
  const barTimer = useRef<number | null>(null);
  const typeTimer = useRef<number | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    setMicSupported(typeof (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition !== 'undefined' || typeof (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition !== 'undefined');
    return () => {
      stopSpeech();
      earRef.current?.stop();
      if (barTimer.current) window.clearInterval(barTimer.current);
      if (typeTimer.current) window.clearInterval(typeTimer.current);
    };
  }, []);

  const startBars = () => {
    if (barTimer.current) window.clearInterval(barTimer.current);
    barTimer.current = window.setInterval(() => {
      setBars(Array.from({ length: 18 }, () => 8 + Math.random() * 52));
    }, reduced ? 400 : 90);
  };
  const stopBars = () => {
    if (barTimer.current) window.clearInterval(barTimer.current);
    setBars(Array.from({ length: 18 }, () => 6));
  };

  const typeLine = (text: string) => {
    if (typeTimer.current) window.clearInterval(typeTimer.current);
    let i = 0;
    setTyped('');
    typeTimer.current = window.setInterval(() => {
      i += 2;
      setTyped(text.slice(0, i));
      if (i >= text.length && typeTimer.current) window.clearInterval(typeTimer.current);
    }, 24);
  };

  const playMonologue = (from: number) => {
    setPhase('monologue');
    setPlaying(true);
    const step = (i: number) => {
      if (i >= lines.length) {
        setPlaying(false);
        stopBars();
        setPhase('ask');
        pushLog('JUDAS espera la respuesta del agente.');
        return;
      }
      setLineIdx(i);
      typeLine(lines[i]);
      startBars();
      speak(lines[i], {
        onEnd: () => {
          window.setTimeout(() => step(i + 1), reduced ? 250 : 420);
        },
      });
    };
    step(from);
  };

  const startListening = () => {
    if (!earRef.current) {
      earRef.current = createEar((text) => {
        setHeard(text);
        if (/(listo|lista|estoy aqu[ií]|vamos)/.test(text)) {
          accept();
        }
      });
    }
    if (!earRef.current.supported) return;
    setListening(true);
    earRef.current.start();
    window.setTimeout(() => setListening(false), 5000);
  };

  const accept = () => {
    if (phase === 'done') return;
    setPhase('done');
    stopSpeech();
    earRef.current?.stop();
    sfxOk();
    pushLog(`Agente ${codename}: «Estoy listo.» Vínculo de voz confirmado.`);
    window.setTimeout(onComplete, 1400);
  };

  const progressPct = phase === 'done' ? 100 : phase === 'ask' ? 86 : phase === 'monologue' ? Math.round(((lineIdx + 1) / lines.length) * 80) : 0;

  return (
    <section className="screen-enter w-full max-w-3xl">
      <p className="font-term text-[10px] tracking-[0.3em] text-neon">NÚCLEO JUDAS // INTERFAZ DE VOZ</p>
      <h2 className="glitch mt-1 font-display text-2xl font-bold tracking-wide text-ash" data-text="LA VOZ DEL NÚCLEO">
        LA VOZ DEL NÚCLEO
      </h2>
      <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-dim">
        El artefacto no se guarda en un archivo: se pronuncia. JUDAS te hablará con su propia voz y
        al final espera una respuesta hablada. Activa el sonido del dispositivo.
      </p>

      {/* visualizador */}
      <div className="mt-6 flex h-24 items-end justify-center gap-1.5 border border-white/10 bg-black/60 px-4 pb-3 pt-4">
        {bars.map((b, i) => (
          <span
            key={i}
            className={`w-2 transition-all duration-100 ${playing ? 'bg-neon shadow-[0_0_8px_#ff073a]' : 'bg-blood'}`}
            style={{ height: `${playing || phase === 'ask' ? b : 6}%`, opacity: playing ? 1 : 0.45 }}
          />
        ))}
      </div>

      {/* transcripción */}
      <div className="mt-3 min-h-[96px] border border-white/10 bg-black/50 p-4">
        {lineIdx >= 0 ? (
          <p className="font-term text-sm leading-relaxed tracking-wider text-term">
            <span className="text-neon">JUDAS &gt;</span> {typed}
            {playing && <span className="cursor-blink text-neon">_</span>}
          </p>
        ) : (
          <p className="font-term text-xs tracking-[0.2em] text-dim">
            [ TRANSCRIPCIÓN EN ESPERA — PULSA INICIAR MONÓLOGO ]
          </p>
        )}
        {heard && (
          <p className="mt-2 font-term text-xs tracking-wider text-ash">
            <span className="text-term">TÚ &gt;</span> «{heard}»
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 border border-neon/30 bg-black/60">
          <div className="h-full bg-neon shadow-[0_0_10px_#ff073a] transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="font-term text-[10px] tracking-[0.25em] text-dim">{progressPct}%</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {phase === 'idle' && (
          <button type="button" onClick={() => playMonologue(0)} className="btn-neon text-sm">
            ◉ INICIAR MONÓLOGO DE JUDAS
          </button>
        )}
        {phase === 'monologue' && (
          <button type="button" onClick={() => { stopSpeech(); stopBars(); playMonologue(0); }} className="btn-ghost text-xs">
            ⟲ REINICIAR MONÓLOGO
          </button>
        )}
        {phase === 'ask' && (
          <>
            {micSupported && (
              <button type="button" onClick={startListening} className={`btn-neon text-sm ${listening ? 'pulse-dot' : ''}`}>
                {listening ? '◉ ESCUCHANDO… DI «ESTOY LISTO»' : '🎙 RESPONDER CON LA VOZ'}
              </button>
            )}
            <button type="button" onClick={accept} className={micSupported ? 'btn-ghost text-xs' : 'btn-neon text-sm'}>
              ESCRIBIR: «ESTOY LISTO» ▸
            </button>
          </>
        )}
        {phase === 'done' && (
          <p className="stamp inline-block border-2 border-term px-4 py-2 font-term text-sm tracking-[0.3em] text-term">
            VÍNCULO DE VOZ CONFIRMADO ✓
          </p>
        )}
        {!ttsSupported() && (
          <p className="font-term text-[10px] tracking-[0.2em] text-dim">
            * Este navegador no sintetiza voz: la transcripción sustituye al audio.
          </p>
        )}
      </div>

      <p className="mt-4 font-term text-[10px] leading-relaxed tracking-[0.15em] text-dim/70">
        REGISTRO: la voz de JUDAS se sintetiza en tu dispositivo (es-ES, tono 0.65). Nada sale de tu
        máquina. El reconocimiento de voz, si lo activas, tampoco: todo ocurre en local.
      </p>
    </section>
  );
}
