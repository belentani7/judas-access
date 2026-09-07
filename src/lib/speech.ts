/* Motor de voz de JUDAS — síntesis (la web habla) y reconocimiento (la web escucha). */

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (!ttsSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const esES = voices.find((v) => v.lang.toLowerCase().startsWith('es') && v.lang.includes('ES'));
  const es = voices.find((v) => v.lang.toLowerCase().startsWith('es'));
  return esES ?? es ?? voices[0];
}

if (ttsSupported()) {
  window.speechSynthesis.onvoiceschanged = () => pickVoice();
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

/** Hace hablar al sistema. Devuelve una función para interrumpir. */
export function speak(text: string, opts: SpeakOptions = {}): () => void {
  if (!ttsSupported()) {
    opts.onEnd?.();
    return () => undefined;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'es-ES';
  u.rate = opts.rate ?? 0.95;
  u.pitch = opts.pitch ?? 0.65;
  const v = pickVoice();
  if (v) u.voice = v;
  u.onstart = () => opts.onStart?.();
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();
  synth.speak(u);
  return () => synth.cancel();
}

export function stopSpeech() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

/* ---------- Reconocimiento de voz del agente ---------- */

interface RecognizerLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export interface AgentEar {
  supported: boolean;
  start: () => void;
  stop: () => void;
}

/** Escucha al agente. onPhrase recibe el texto reconocido (minúsculas). */
export function createEar(onPhrase: (text: string) => void): AgentEar {
  const w = window as unknown as {
    SpeechRecognition?: new () => RecognizerLike;
    webkitSpeechRecognition?: new () => RecognizerLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return { supported: false, start: () => undefined, stop: () => undefined };

  let rec: RecognizerLike | null = null;
  try {
    rec = new Ctor();
    rec.lang = 'es-ES';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i += 1) {
        const r = e.results[i];
        if (r && r[0]) text += r[0].transcript;
      }
      onPhrase(text.toLowerCase().trim());
    };
    rec.onerror = () => undefined;
  } catch {
    return { supported: false, start: () => undefined, stop: () => undefined };
  }

  return {
    supported: true,
    start: () => {
      try {
        rec?.start();
      } catch {
        /* ya estaba activo */
      }
    },
    stop: () => {
      try {
        rec?.stop();
      } catch {
        /* noop */
      }
    },
  };
}
