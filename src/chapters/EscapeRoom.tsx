import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../lib/hooks';
import { beep, sfxErr, sfxOk } from '../lib/sfx';
import { pushLog } from '../components/LiveTerminal';

const CODE = '3011';
const SWITCH_ORDER = ['R', 'A', 'V'];
const SWITCH_META: Record<string, { label: string; color: string; glow: string }> = {
  R: { label: 'ROJO', color: '#ff073a', glow: 'rgba(255,7,58,0.6)' },
  A: { label: 'AZUL', color: '#3d7bff', glow: 'rgba(61,123,255,0.6)' },
  V: { label: 'VERDE', color: '#00ff41', glow: 'rgba(0,255,65,0.6)' },
};

interface Props {
  onSolve: () => void;
  codename: string;
}

/** Cámara S1 (rojo/azul): restablecer corriente, revelar el código con UV y abrir la puerta. */
export default function EscapeRoom({ onSolve, codename }: Props) {
  const [switches, setSwitches] = useState<Record<string, boolean>>({ R: false, A: false, V: false });
  const [power, setPower] = useState(false);
  const [spark, setSpark] = useState(false);
  const [uv, setUv] = useState(false);
  const [entry, setEntry] = useState('');
  const [alarm, setAlarm] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [inside, setInside] = useState(false);
  const [extract, setExtract] = useState(0);
  const [solved, setSolved] = useState(false);
  const [scale, setScale] = useState(1);

  const orderRef = useRef<string[]>([]);
  const extractTimer = useRef<number | null>(null);
  const roomWrapRef = useRef<HTMLDivElement | null>(null);
  const roomRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef(1);
  const reduced = usePrefersReducedMotion();

  /* escala responsive de la sala */
  useEffect(() => {
    const fit = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = Math.min(1, (vw - 24) / 940, (vh * 0.7) / 600);
      scaleRef.current = s;
      setScale(s);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  /* parallax de la sala con el ratón */
  useEffect(() => {
    if (reduced) return;
    const wrap = roomWrapRef.current;
    if (!wrap) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      tx = nx * 7;
      ty = -ny * 4;
    };
    const loop = () => {
      const el = roomRef.current;
      if (el)
        el.style.transform = `scale(${scaleRef.current.toFixed(3)}) rotateX(${(2 + ty).toFixed(2)}deg) rotateY(${(-8 + tx).toFixed(2)}deg)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced, inside]);

  const flipSwitch = (id: string) => {
    if (power || doorOpen) return;
    beep(300, 0.05, 'square', 0.03);
    const next = { ...switches };
    if (switches[id]) {
      next[id] = false;
      orderRef.current = orderRef.current.filter((s) => s !== id);
      setSwitches(next);
      return;
    }
    next[id] = true;
    orderRef.current.push(id);
    const seq = orderRef.current;
    const valid = seq.every((s, i) => s === SWITCH_ORDER[i]);
    if (!valid) {
      setSpark(true);
      sfxErr();
      pushLog('Cortocircuito: secuencia de corriente incorrecta.');
      window.setTimeout(() => {
        setSpark(false);
        setSwitches({ R: false, A: false, V: false });
        orderRef.current = [];
      }, 420);
      return;
    }
    setSwitches(next);
    if (seq.length === 3) {
      window.setTimeout(() => {
        setPower(true);
        sfxOk();
        pushLog('Corriente restablecida en la Cámara S1. El teclado espera.');
      }, 350);
    }
  };

  const pressKey = (k: string) => {
    if (!power || doorOpen) return;
    beep(700 + Math.random() * 250, 0.04);
    if (k === 'C') {
      setEntry('');
      return;
    }
    if (k === 'OK') {
      if (entry === CODE) {
        sfxOk();
        setDoorOpen(true);
        pushLog(`Código ${CODE} aceptado. La puerta de la Cámara S1 se abre.`);
      } else {
        sfxErr();
        setAlarm(true);
        pushLog('Código rechazado. Protocolo de intruso activado.');
        window.setTimeout(() => {
          setAlarm(false);
          setEntry('');
        }, 900);
      }
      return;
    }
    if (entry.length < 4) setEntry(entry + k);
  };

  /* extracción del núcleo (mantener) */
  const startExtract = useCallback(() => {
    if (solved) return;
    extractTimer.current = window.setInterval(() => {
      setExtract((p) => {
        const n = Math.min(100, p + 4);
        if (n >= 100) {
          if (extractTimer.current) window.clearInterval(extractTimer.current);
          return 100;
        }
        return n;
      });
    }, 45);
  }, [solved]);

  const stopExtract = useCallback(() => {
    if (extractTimer.current) {
      window.clearInterval(extractTimer.current);
      extractTimer.current = null;
    }
    setExtract((p) => (p < 100 ? Math.max(0, p - 8) : p));
  }, []);

  useEffect(() => {
    if (extract >= 100 && !solved) {
      setSolved(true);
      sfxOk();
      pushLog(`Agente ${codename}: NÚCLEO JUDAS extraído. El viaje continúa.`);
      window.setTimeout(onSolve, 1200);
    }
  }, [extract, solved, onSolve, codename]);

  const monitorLines = !power
    ? ['FALLO ELÉCTRICO EN CÁMARA S1', 'SECUENCIA: ROJO → AZUL → VERDE', 'SIN CORRIENTE EL TECLADO ES PIEDRA', 'TREINTA MONEDAS. ONCE DUDARON.']
    : !doorOpen
      ? ['CORRIENTE RESTABLECIDA ✓', 'TECLADO ACTIVO — INTRODUCE EL CÓDIGO', 'PISTA UV: mantén la lámpara sobre la pared', 'TREINTA MONEDAS. ONCE DUDARON.']
      : ['PUERTA ABIERTA ✓', 'ENTRA. EL ARTEFACTO TE ESPERA.'];

  if (inside) {
    return (
      <section className="screen-enter flex w-full max-w-2xl flex-col items-center">
        <p className="font-term text-[10px] tracking-[0.3em] text-dim">INTERIOR DE LA CÁMARA S1</p>
        <div className="relative mt-6 flex h-72 w-72 items-center justify-center">
          <span className="ripple absolute inset-0 rounded-full border border-neon/50" />
          <span className="ripple ripple-delay absolute inset-0 rounded-full border border-neon/30" />
          <div
            className="relative flex h-44 w-44 items-center justify-center rounded-full"
            style={{
              background: 'radial-gradient(circle at 38% 32%, #ff5c7a, #ff073a 34%, #8b0000 62%, #2a0004 100%)',
              boxShadow: solved
                ? '0 0 90px rgba(0,255,65,0.5), 0 0 160px rgba(0,255,65,0.2)'
                : '0 0 70px rgba(255,7,58,0.65), 0 0 150px rgba(139,0,0,0.4)',
              animation: reduced ? 'none' : 'orbFloat 3.4s ease-in-out infinite',
            }}
          >
            <span className="font-display text-3xl font-bold text-black/70">33</span>
          </div>
          <div
            className="pointer-events-none absolute inset-6 rounded-full border border-dashed border-neon/40"
            style={{ animation: reduced ? 'none' : 'spinSlow 14s linear infinite' }}
          />
        </div>

        <h3 className="glitch mt-6 font-display text-xl font-bold tracking-[0.2em] text-ash" data-text="EL ARTEFACTO">
          EL ARTEFACTO
        </h3>
        <p className="mt-2 max-w-md text-center font-body text-sm leading-relaxed text-dim">
          El núcleo de Judas late a 432 Hz. Mantén presionado para extraerlo: la integración del
          guerrero y el ángel pasa a tus manos, agente {codename}.
        </p>

        <button
          type="button"
          onPointerDown={startExtract}
          onPointerUp={stopExtract}
          onPointerLeave={stopExtract}
          disabled={solved}
          className="btn-neon relative mt-6 w-64 overflow-hidden text-sm"
        >
          <span
            className="absolute inset-y-0 left-0 bg-term/25 transition-all"
            style={{ width: `${extract}%` }}
          />
          <span className="relative">
            {solved ? 'NÚCLEO EXTRAÍDO ✓' : extract > 0 ? `EXTRAYENDO… ${Math.floor(extract)}%` : 'MANTÉN PARA EXTRAER'}
          </span>
        </button>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-term text-[10px] tracking-[0.3em] text-neon">
          ESCAPE ROOM // CÁMARA S1 — ROJO/AZUL
        </p>
        <p className="font-term text-[10px] tracking-[0.2em] text-dim">
          1· CORRIENTE → 2· CÓDIGO UV → 3· TECLADO → 4· PUERTA
        </p>
      </div>

      <div ref={roomWrapRef} className="relative" style={{ height: 620 * scale, perspective: 1150 }}>
        <div
          ref={roomRef}
          className="absolute top-1/2 left-1/2"
          style={{
            width: 900,
            height: 520,
            marginLeft: -450,
            marginTop: -260,
            transform: `scale(${scale}) rotateX(2deg) rotateY(-8deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* ---------- PAREDES / SUELO / TECHO ---------- */}
          <div className="absolute inset-0" style={{ transform: 'translateZ(-450px)', transformStyle: 'preserve-3d', background: 'linear-gradient(180deg,#12030a,#0a0207 55%,#070105)' }}>
            {/* rejilla de pared */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,7,58,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,7,58,0.07) 1px, transparent 1px)',
                backgroundSize: '45px 45px',
              }}
            />
            {/* mancha de humedad */}
            <div className="absolute top-0 left-24 h-56 w-64 rounded-full opacity-50" style={{ background: 'radial-gradient(closest-side, rgba(0,0,0,0.8), transparent)' }} />

            {/* UV: código oculto */}
            <div
              className="absolute top-16 left-14 font-term text-4xl tracking-[0.5em] transition-all duration-300"
              style={{
                color: uv ? '#c99bff' : 'transparent',
                textShadow: uv ? '0 0 18px rgba(168,85,247,0.9), 0 0 40px rgba(168,85,247,0.5)' : 'none',
                transform: 'rotate(-4deg)',
              }}
            >
              3011
            </div>
            <p
              className="absolute top-32 left-14 font-term text-[10px] tracking-[0.3em] transition-all duration-300"
              style={{ color: uv ? 'rgba(201,155,255,0.85)' : 'transparent' }}
            >
              LAS MONEDAS + LOS QUE NO DUDARON
            </p>

            {/* ---------- PUERTA ---------- */}
            <div className="absolute top-10 left-1/2 h-[430px] w-[240px] -translate-x-1/2 overflow-hidden border-4 border-[#2b0a12] bg-[#0c0308] shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
              <div
                className="absolute inset-0 transition-transform duration-[1400ms] ease-in-out"
                style={{ transform: doorOpen ? 'translateY(-102%)' : 'translateY(0)', background: 'linear-gradient(180deg,#1c060c,#12040a 60%,#0d0307)', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)' }}
              >
                <div className="absolute inset-x-6 top-6 h-24 border border-neon/20 bg-black/40" />
                <div className="absolute inset-x-6 top-36 h-24 border border-neon/20 bg-black/40" />
                <div className="absolute inset-x-6 bottom-24 h-24 border border-neon/20 bg-black/40" />
                <div className="absolute top-1/2 right-4 h-16 w-3 -translate-y-1/2 rounded-full bg-[#3a0d18] shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
                <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-black/60" />
                <p className="absolute bottom-4 inset-x-0 text-center font-term text-[10px] tracking-[0.4em] text-neon/60">S1</p>
              </div>
              {/* interior revelado */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'radial-gradient(circle at 50% 60%, rgba(255,7,58,0.35), rgba(20,0,5,0.95) 70%)' }}>
                <span className="font-term text-[10px] tracking-[0.4em] text-neon">EL ARTEFACTO LATE</span>
              </div>
            </div>

            {/* ---------- TECLADO ---------- */}
            <div className="absolute top-28 right-16 w-[150px] border-2 border-[#2b0a12] bg-[#150409] p-2.5 shadow-[0_0_24px_rgba(0,0,0,0.7)]">
              <div
                className={`mb-2 flex h-8 items-center justify-center border font-term text-lg tracking-[0.5em] ${
                  power ? 'border-neon/50 bg-black text-neon shadow-[0_0_12px_rgba(255,7,58,0.3)]' : 'border-white/10 bg-black text-dim/40'
                } ${alarm ? 'shake' : ''}`}
              >
                {power ? '●'.repeat(entry.length) || '—' : '·OFF·'}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => pressKey(k)}
                    disabled={!power || doorOpen}
                    className={`h-9 border font-term text-xs transition-all ${
                      k === 'OK'
                        ? 'border-term/50 bg-term/10 text-term hover:bg-term/25'
                        : k === 'C'
                          ? 'border-neon/40 bg-neon/10 text-neon hover:bg-neon/25'
                          : 'border-white/15 bg-black/50 text-ash hover:border-neon/60 hover:bg-neon/15'
                    } ${!power || doorOpen ? 'cursor-not-allowed opacity-30' : 'active:translate-y-px'}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* cartel */}
            <div className="absolute bottom-16 right-14 w-[170px] rotate-2 border border-white/15 bg-[#17060c] p-3 shadow-[0_6px_18px_rgba(0,0,0,0.6)]">
              <p className="font-term text-[9px] tracking-[0.25em] text-neon">AVISO // S1</p>
              <p className="mt-1.5 font-body text-[10px] leading-snug text-dim">
                La Fase S1 opera en ROJO/AZUL. Sin la secuencia de corriente correcta, la puerta es
                un muro. La luz violeta revela lo que el rojo oculta.
              </p>
              <div className="mt-2 h-8 border border-white/10" style={{ background: 'repeating-linear-gradient(45deg,#8b0000 0 8px,#0a0207 8px 16px)' }} />
            </div>
          </div>

          {/* ---------- PARED IZQUIERDA: INTERRUPTORES ---------- */}
          <div className="absolute inset-0" style={{ width: 900, height: 520, transform: 'rotateY(90deg) translateZ(-450px)', background: 'linear-gradient(180deg,#100208,#080105)' }}>
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'linear-gradient(rgba(61,123,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(61,123,255,0.06) 1px, transparent 1px)',
                backgroundSize: '45px 45px',
              }}
            />
            <div className="absolute top-1/2 left-1/2 w-[300px] -translate-x-1/2 -translate-y-1/2 border-2 border-[#233047] bg-[#0a0d16] p-5 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <p className="text-center font-term text-[10px] tracking-[0.35em] text-[#7fa3ff]">PANEL DE CORRIENTE</p>
              <p className="mt-1 text-center font-term text-[8px] tracking-[0.2em] text-dim">ORDEN CORRECTO REQUERIDO</p>
              <div className={`mt-4 flex justify-center gap-6 ${spark ? 'shake' : ''}`}>
                {SWITCH_ORDER.map((id) => {
                  const meta = SWITCH_META[id];
                  const on = switches[id];
                  return (
                    <button key={id} type="button" onClick={() => flipSwitch(id)} className="group flex w-16 flex-col items-center gap-2" aria-label={`Interruptor ${meta.label}`}>
                      <span
                        className={`block h-20 w-8 border-2 transition-all duration-200 ${on ? '' : 'opacity-80'}`}
                        style={{
                          borderColor: meta.color,
                          background: on ? `linear-gradient(180deg, ${meta.color}, ${meta.color}55)` : '#05070c',
                          boxShadow: on ? `0 0 18px ${meta.glow}, inset 0 0 10px rgba(255,255,255,0.2)` : 'inset 0 4px 10px rgba(0,0,0,0.9)',
                          transform: on ? 'translateY(-6px)' : 'translateY(6px)',
                        }}
                      />
                      <span className="font-term text-[9px] tracking-[0.25em]" style={{ color: on ? meta.color : '#6b7280' }}>
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className={`mx-auto mt-4 h-2 w-3/4 ${power ? 'bg-term shadow-[0_0_14px_#00ff41]' : 'bg-white/10'}`} />
            </div>
            {spark && <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(120,180,255,0.5), transparent 60%)' }} />}
          </div>

          {/* ---------- PARED DERECHA: MONITOR ---------- */}
          <div className="absolute inset-0" style={{ width: 900, height: 520, transform: 'rotateY(-90deg) translateZ(-450px)', background: 'linear-gradient(180deg,#100208,#080105)' }}>
            <div className="absolute top-1/2 left-1/2 w-[340px] -translate-x-1/2 -translate-y-1/2 border-4 border-[#1a1f14] bg-black p-4 shadow-[0_0_36px_rgba(0,0,0,0.85)]">
              <div className="flex items-center justify-between border-b border-term/20 pb-2">
                <span className="font-term text-[9px] tracking-[0.3em] text-term/70">MONITOR // S1</span>
                <span className="pulse-dot-green h-1.5 w-1.5 rounded-full bg-term" />
              </div>
              <div className="mt-3 flex flex-col gap-2 font-term text-[11px] leading-relaxed tracking-wider text-term/90">
                {monitorLines.map((l) => (
                  <p key={l}>
                    <span className="text-term/50">&gt;</span> {l}
                  </p>
                ))}
                <p className="text-term">
                  &gt; <span className="cursor-blink">_</span>
                </p>
              </div>
              <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,255,65,0.12) 0 1px, transparent 1px 3px)' }} />
            </div>
          </div>

          {/* ---------- SUELO ---------- */}
          <div
            className="absolute"
            style={{
              width: 900,
              height: 900,
              left: 0,
              top: '50%',
              marginTop: -450,
              transform: 'rotateX(90deg) translateZ(-260px)',
              background: 'linear-gradient(180deg,#0d0208,#050103)',
              backgroundImage:
                'linear-gradient(rgba(255,7,58,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,7,58,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              boxShadow: 'inset 0 0 140px rgba(0,0,0,0.95)',
            }}
          />

          {/* ---------- TECHO + LÁMPARA ---------- */}
          <div
            className="absolute"
            style={{
              width: 900,
              height: 900,
              left: 0,
              top: '50%',
              marginTop: -450,
              transform: 'rotateX(90deg) translateZ(260px)',
              background: '#060104',
            }}
          >
            <div
              className="absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background: power ? 'radial-gradient(circle, rgba(255,180,120,0.85), rgba(255,7,58,0.25) 55%, transparent 75%)' : 'radial-gradient(circle, rgba(120,60,60,0.25), transparent 70%)',
                animation: !power && !reduced ? 'crtFlicker 2.2s steps(8) infinite' : 'none',
              }}
            />
          </div>
        </div>

        {/* cono de luz ambiental */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: power ? 1 : 0.5,
            background: 'radial-gradient(ellipse 42% 55% at 50% 38%, rgba(255,7,58,0.12), transparent 70%)',
          }}
        />
      </div>

      {/* ---------- HUD DE INVENTARIO ---------- */}
      <div className="mt-2 flex flex-col items-center gap-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onPointerDown={() => setUv(true)}
            onPointerUp={() => setUv(false)}
            onPointerLeave={() => setUv(false)}
            className={`btn-ghost text-xs ${uv ? 'border-purple-400 text-purple-300 shadow-[0_0_24px_rgba(168,85,247,0.5)]' : ''}`}
          >
            🔦 LÁMPARA UV — MANTÉN
          </button>
          {doorOpen && (
            <button type="button" onClick={() => setInside(true)} className="btn-neon text-sm">
              ▶ ENTRAR EN LA CÁMARA
            </button>
          )}
        </div>
        <p className="max-w-xl text-center font-term text-[10px] leading-relaxed tracking-[0.15em] text-dim">
          OBJETIVO: restablece la corriente (el monitor indica la secuencia), revela el código con la
          lámpara UV sobre la pared del fondo e introdúcelo en el teclado. Agente {codename}, la
          puerta solo se abre una vez.
        </p>
        {alarm && (
          <p className="shake font-term text-xs tracking-[0.3em] text-neon">⚠ CÓDIGO RECHAZADO — INTRUSO DETECTADO</p>
        )}
      </div>

      {uv && (
        <div
          className="pointer-events-none fixed inset-0 z-40"
          style={{ background: 'radial-gradient(circle at 30% 35%, rgba(168,85,247,0.22), transparent 55%)' }}
        />
      )}
      {alarm && <div className="pointer-events-none fixed inset-0 z-40 bg-neon/20" />}

      <style>{`
        @keyframes orbFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes spinSlow { to { transform: rotate(360deg) } }
      `}</style>
    </section>
  );
}
