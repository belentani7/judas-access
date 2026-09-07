import { useState } from 'react';
import type { FormEvent } from 'react';
import PhaseFrame from './PhaseFrame';
import { DIVISIONS } from '../lib/constants';
import type { AgentData } from '../lib/types';
import { pushLog } from './LiveTerminal';
import { sfxErr, sfxOk } from '../lib/sfx';

export function makeHash(): string {
  try {
    return Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  } catch {
    return 'Z10N33ERR';
  }
}

interface Props {
  onComplete: (agent: AgentData) => void;
}

export default function AgentForm({ onComplete }: Props) {
  const [codename, setCodename] = useState('');
  const [realName, setRealName] = useState('');
  const [division, setDivision] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);

  const fail = (m: string) => {
    sfxErr();
    setError(m);
    setShaking(true);
    window.setTimeout(() => setShaking(false), 480);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (codename.trim().length < 3) {
      fail('EL CÓDIGO DE AGENTE REQUIERE MÍNIMO 3 CARACTERES');
      return;
    }
    if (!division) {
      fail('SELECCIONA TU DIVISIÓN DENTRO DEL SISTEMA DE 5 ELEMENTOS');
      return;
    }
    const d = DIVISIONS.find((x) => x.code === division);
    if (!d) return;
    const agent: AgentData = {
      codename: codename.trim().toUpperCase(),
      realName: realName.trim() || undefined,
      division: d.code,
      divisionAlias: d.alias,
      agentId: `JDS-${Math.floor(1000 + Math.random() * 9000)}-${d.code.slice(0, 3)}-33`,
      hash: makeHash(),
      ts: new Date().toISOString(),
    };
    sfxOk();
    pushLog(`Agente ${agent.codename} registrado en la división ${d.code}.`);
    onComplete(agent);
  };

  return (
    <PhaseFrame
      phase={4}
      total={6}
      label="FASE 04 // ALTA OPERATIVA"
      title="REGISTRO DE AGENTE"
      subtitle="Las tres capas biométricas están superadas. Ahora el sistema necesita saber quién camina por el viaje: elige un código de agente y la división del artefacto donde quedarás integrado."
    >
      <form onSubmit={submit} className={shaking ? 'shake' : undefined} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block font-term text-[10px] tracking-[0.25em] text-dim">
              CÓDIGO DE AGENTE *
            </span>
            <input
              className="field"
              value={codename}
              onChange={(e) => setCodename(e.target.value.toUpperCase())}
              placeholder="EJ: SERPIENTE-09"
              maxLength={22}
              autoComplete="off"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-term text-[10px] tracking-[0.25em] text-dim">
              NOMBRE REAL (OPCIONAL)
            </span>
            <input
              className="field"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder="SOLO SI CONFÍAS EN EL SISTEMA"
              maxLength={40}
              autoComplete="off"
            />
          </label>
        </div>

        <p className="mt-6 mb-2 font-term text-[10px] tracking-[0.25em] text-dim">
          DIVISIÓN DE INTEGRACIÓN — ELIGE TU ELEMENTO *
        </p>
        <div className="flex flex-col gap-2">
          {DIVISIONS.map((d) => {
            const active = division === d.code;
            return (
              <button
                key={d.code}
                type="button"
                onClick={() => setDivision(d.code)}
                aria-pressed={active}
                className={`group flex items-start gap-3 border px-3.5 py-2.5 text-left transition-all duration-200 ${
                  active
                    ? 'border-neon bg-neon/10 shadow-[0_0_20px_rgba(255,7,58,0.2)]'
                    : 'border-white/10 bg-black/40 hover:translate-x-1 hover:border-neon/50'
                }`}
              >
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rotate-45 border transition-colors ${
                    active ? 'border-neon bg-neon' : 'border-dim group-hover:border-neon'
                  }`}
                />
                <span>
                  <span className="font-term text-xs tracking-[0.2em] text-ash">
                    {d.code} <span className="text-neon">// {d.alias}</span>
                  </span>
                  <span className="mt-0.5 block font-body text-xs leading-snug text-dim">
                    {d.desc}
                  </span>
                </span>
                {active && (
                  <span className="ml-auto self-center font-term text-[9px] tracking-[0.2em] text-term">
                    ASIGNADA ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <p className="mt-4 border border-neon/40 bg-neon/10 px-3 py-2 font-term text-[10px] tracking-[0.2em] text-neon">
            ⚠ {error}
          </p>
        )}

        <p className="mt-4 font-body text-[11px] leading-relaxed text-dim/80">
          El código de agente será tu identidad dentro del viaje. Elige con cuidado: el Cronista
          archiva cada nombre y nada se borra en la Dimensión Zion.
        </p>

        <div className="mt-5 flex justify-end">
          <button type="submit" className="btn-neon text-sm">
            REGISTRAR AGENTE &gt;&gt;
          </button>
        </div>
      </form>
    </PhaseFrame>
  );
}
