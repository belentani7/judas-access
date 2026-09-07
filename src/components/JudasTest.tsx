import { useState } from 'react';
import PhaseFrame from './PhaseFrame';
import { JUDAS_QUESTIONS } from '../lib/constants';
import { pushLog } from './LiveTerminal';
import { beep } from '../lib/sfx';

interface Props {
  onComplete: () => void;
}

export default function JudasTest({ onComplete }: Props) {
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [reaction, setReaction] = useState<string | null>(null);

  const q = JUDAS_QUESTIONS[qi];
  const last = qi === JUDAS_QUESTIONS.length - 1;

  const pick = (i: number) => {
    if (sel !== null) return;
    setSel(i);
    setReaction(q.options[i].reaction);
    pushLog(q.options[i].logline);
    beep(660, 0.06);
    window.setTimeout(() => {
      if (!last) {
        setQi((v) => v + 1);
        setSel(null);
        setReaction(null);
      } else {
        pushLog('Perfil psicológico compatible. Coeficiente JUDAS: 33%.');
        onComplete();
      }
    }, 2300);
  };

  return (
    <PhaseFrame
      phase={5}
      total={6}
      label="FASE 05 // EVALUACIÓN PSICOLÓGICA"
      title="TEST JUDAS"
      subtitle="Tres lecturas. El sistema no busca respuestas correctas: busca patrones. Cada elección modifica tu registro dentro del núcleo."
      status={`LECTURA ${qi + 1} DE ${JUDAS_QUESTIONS.length}`}
    >
      <div key={qi} className="screen-enter">
        <p className="font-term text-sm leading-relaxed tracking-wider text-ash">
          <span className="text-neon">&gt;&gt;</span> {q.q}
        </p>

        <div className="mt-5 flex flex-col gap-2">
          {q.options.map((o, i) => {
            const isSel = sel === i;
            return (
              <button
                key={o.text}
                type="button"
                onClick={() => pick(i)}
                disabled={sel !== null}
                className={`flex items-center gap-3 border px-3.5 py-3 text-left font-term text-xs tracking-wider transition-all duration-200 ${
                  isSel
                    ? 'border-term bg-term/10 text-term shadow-[0_0_18px_rgba(0,255,65,0.15)]'
                    : sel !== null
                      ? 'border-white/5 text-dim/40'
                      : 'border-white/10 bg-black/40 text-ash hover:translate-x-1.5 hover:border-neon/60 hover:text-neon'
                }`}
              >
                <span className={`shrink-0 ${isSel ? 'text-term' : 'text-neon'}`}>
                  {String.fromCharCode(65 + i)}_
                </span>
                {o.text}
              </button>
            );
          })}
        </div>

        {reaction && (
          <div className="screen-enter mt-5 border border-term/30 bg-black/60 px-4 py-3">
            <p className="font-term text-[9px] tracking-[0.3em] text-dim">RESPUESTA DEL SISTEMA</p>
            <p className="mt-1.5 font-term text-[11px] leading-relaxed tracking-wider text-term">
              {reaction}
            </p>
            {last && (
              <p className="mt-2 font-term text-[11px] tracking-[0.2em] text-neon">
                COEFICIENTE JUDAS: 33% — PERFIL COMPATIBLE
              </p>
            )}
          </div>
        )}
      </div>
    </PhaseFrame>
  );
}
