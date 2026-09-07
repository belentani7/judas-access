import { useEffect, useRef, useState } from 'react';
import { FRAG_PLANET, VERT_QUAD } from '../lib/shaders';
import { usePrefersReducedMotion } from '../lib/hooks';
import { speak, stopSpeech } from '../lib/speech';
import { pushLog } from '../components/LiveTerminal';
import { beep } from '../lib/sfx';

interface Hotspot {
  id: string;
  label: string;
  lat: number;
  lon: number;
  desc: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'zion',
    label: 'DIMENSIÓN ZION',
    lat: 0.42,
    lon: 0.7,
    desc: 'Punto de anclaje del Protocolo Omnipresencia. Aquí se integraron todas las versiones del multiverso de Belentani.',
  },
  {
    id: 'venom',
    label: 'ARCHIVO // VENOM',
    lat: -0.28,
    lon: 2.3,
    desc: 'La serpiente muda de piel pero el registro permanece. Transmisiones recuperadas de GitHub y redes.',
  },
  {
    id: 'core',
    label: 'NÚCLEO JUDAS',
    lat: 0.12,
    lon: -1.25,
    desc: 'Cámara S1: rojo/azul. El artefacto espera al otro lado de la puerta. Desciende cuando estés listo.',
  },
];

interface Props {
  onDescend: () => void;
  onOpenArchive: () => void;
  codename: string;
}

export default function PlanetViewer({ onDescend, onOpenArchive, codename }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const markerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rotRef = useRef({ x: 0.6, y: 0.18 });
  const zoomRef = useRef(1.0);
  const draggingRef = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [selected, setSelected] = useState<Hotspot | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const gl = canvas.getContext('webgl', { antialias: false, powerPreference: 'high-performance' });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT_QUAD);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG_PLANET);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRot = gl.getUniformLocation(prog, 'u_rot');
    const uZoom = gl.getUniformLocation(prog, 'u_zoom');

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const rots = HOTSPOTS.map((hs) => ({
      cosLat: Math.cos(hs.lat),
      sinLat: Math.sin(hs.lat),
      cosLon: Math.cos(hs.lon),
      sinLon: Math.sin(hs.lon),
    }));

    const render = (t: number) => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRot, rotRef.current.x, rotRef.current.y);
      gl.uniform1f(uZoom, zoomRef.current * dpr);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      /* proyectar hotspots (espejo exacto del shader) */
      const scale = (h / 2) * ((zoomRef.current * 1) / 1.42);
      const cx = w / 2;
      const cy = h / 2;
      const ax = rotRef.current.x;
      const ay = rotRef.current.y;
      const cax = Math.cos(ax);
      const sax = Math.sin(ax);
      const cay = Math.cos(ay);
      const say = Math.sin(ay);

      HOTSPOTS.forEach((hs, i) => {
        const el = markerRefs.current[i];
        if (!el) return;
        const r = rots[i];
        let x = r.cosLat * r.cosLon;
        let y = r.sinLat;
        let z = r.cosLat * r.sinLon;
        /* rot Y */
        const x1 = cax * x - sax * z;
        const z1 = sax * x + cax * z;
        x = x1;
        z = z1;
        /* rot X */
        const y2 = cay * y - say * z;
        const z2 = say * y + cay * z;
        y = y2;
        z = z2;

        const sx = cx + x * scale;
        const sy = cy - y * scale;
        const vis = z > 0.08;
        el.style.opacity = vis ? String(Math.min(1, (z - 0.08) / 0.3)) : '0';
        el.style.pointerEvents = vis ? 'auto' : 'none';
        el.style.transform = `translate(-50%,-50%) translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`;
      });
    };

    let raf = 0;
    const start = performance.now();
    let autoRot = 0;
    if (reduced) {
      render(4.0);
    } else {
      const loop = (now: number) => {
        if (!draggingRef.current) autoRot += 0.0011;
        rotRef.current.x = 0.6 + autoRot;
        render((now - start) / 1000);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) render(4.0);
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [reduced]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    rotRef.current.y = Math.max(-1.1, Math.min(1.1, rotRef.current.y - dy * 0.004));
    if (reduced) {
      rotRef.current.x += dx * 0.005;
    } else {
      rotRef.current.x += dx * 0.005;
    }
  };
  const onPointerUp = () => {
    draggingRef.current = false;
  };
  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    zoomRef.current = Math.max(0.8, Math.min(1.4, zoomRef.current - e.deltaY * 0.0008));
  };

  const act = (hs: Hotspot) => {
    if (hs.id === 'core') onDescend();
    else if (hs.id === 'venom') onOpenArchive();
  };

  const speakHotspot = (hs: Hotspot) => {
    beep(720, 0.05);
    setSpeakingId(hs.id);
    pushLog(`Transmisión de voz: ${hs.label}.`);
    speak(`Agente ${codename}. ${hs.label}. ${hs.desc}`, {
      onEnd: () => setSpeakingId(null),
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative">
        <div
          ref={wrapRef}
          className="relative h-[46vh] min-h-[320px] w-full overflow-hidden border border-neon/25 bg-black lg:h-[62vh]"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            aria-label="Planeta de la Dimensión Zion: arrastra para rotar, rueda para acercar"
          />
          {HOTSPOTS.map((hs, i) => (
            <button
              key={hs.id}
              type="button"
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
              onClick={() => {
                setSelected(hs);
                beep(880, 0.04);
              }}
              className="absolute top-0 left-0 z-10 flex items-center gap-2 opacity-0 transition-opacity duration-200"
              style={{ transform: 'translate(-50%,-50%)' }}
            >
              <span className="pulse-dot block h-3 w-3 rotate-45 border border-neon bg-neon/80" />
              <span className="whitespace-nowrap border border-neon/40 bg-black/70 px-2 py-0.5 font-term text-[9px] tracking-[0.2em] text-neon">
                {hs.label}
              </span>
            </button>
          ))}
          <span className="pointer-events-none absolute top-3 left-3 font-term text-[9px] tracking-[0.3em] text-dim">
            VISOR ORBITAL // ZION-PRIME
          </span>
          <span className="pointer-events-none absolute right-3 bottom-3 font-term text-[9px] tracking-[0.3em] text-dim">
            ARRASTRA · RUEDA PARA ZOOM
          </span>
        </div>
      </div>

      <aside className="flex flex-col gap-3">
        <div className="border border-white/10 bg-black/50 p-4">
          <p className="font-term text-[9px] tracking-[0.3em] text-dim">COORDENADA SELECCIONADA</p>
          {selected ? (
            <div className="screen-enter mt-2" key={selected.id}>
              <p className="font-display text-sm font-bold tracking-widest text-neon">{selected.label}</p>
              <p className="mt-2 font-body text-xs leading-relaxed text-dim">{selected.desc}</p>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => speakHotspot(selected)}
                  className="btn-ghost text-[10px]"
                >
                  {speakingId === selected.id ? '◉ TRANSMITIENDO VOZ…' : '◉ ESCUCHAR A JUDAS'}
                </button>
                {selected.id !== 'zion' && (
                  <button type="button" onClick={() => act(selected)} className="btn-neon text-[10px]">
                    {selected.id === 'core' ? '▼ DESCENDER A LA CÁMARA' : 'ABRIR ARCHIVO'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-2 font-body text-xs leading-relaxed text-dim">
              Toca un marcador rojo sobre el planeta. Cada punto es una puerta: Zion habla, Venom
              recuerda, el Núcleo espera abajo.
            </p>
          )}
        </div>

        <div className="border border-white/10 bg-black/50 p-4">
          <p className="font-term text-[9px] tracking-[0.3em] text-dim">BITÁCORA DEL DESCENSO</p>
          <ul className="mt-2 flex flex-col gap-1.5 font-term text-[10px] leading-relaxed tracking-wider text-dim">
            <li>
              <span className="text-term">✓</span> Órbita estabilizada a 432.00 Hz
            </li>
            <li>
              <span className="text-term">✓</span> Escudos conceptuales activos
            </li>
            <li>
              <span className="text-neon">▲</span> Señal térmica bajo la superficie: Cámara S1
            </li>
            <li>
              <span className="text-dim/60">·</span> La serpiente observa desde el archivo
            </li>
          </ul>
        </div>

        <button type="button" onClick={onDescend} className="btn-neon text-sm">
          ▼ INICIAR DESCENSO A LA CÁMARA S1
        </button>
        <button type="button" onClick={() => stopSpeech()} className="btn-ghost text-[10px]">
          SILENCIAR TRANSMISIONES
        </button>
      </aside>
    </div>
  );
}
