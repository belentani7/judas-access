import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
const root = resolve(".");
const read = p => readFileSync(resolve(root, p), "utf8");

test("all nine chapter phases and the original immersive journey remain connected", () => {
  const app = read("src/App.tsx");
  for (const phase of ["lock", "boot", "retina", "fingerprint", "idscan", "agent", "judas", "sign", "granted"]) {
    assert.match(app, new RegExp("phase === '"+phase+"'"));
  }
  for (const path of ["src/chapters/Journey.tsx", "src/chapters/PlanetViewer.tsx",
    "src/chapters/Hyperspace.tsx", "src/chapters/EscapeRoom.tsx",
    "src/chapters/ArchiveScene.tsx", "src/chapters/VoiceCore.tsx"]) {
    assert.ok(existsSync(resolve(root, path)), path);
  }
});

test("browser storage is a minimal 24-hour narrative alias, not personal identity or handwritten signatures", () => {
  const app = read("src/App.tsx");
  const beginning = app.indexOf("function saveAgent(");
  const ending = app.indexOf("\nfunction clearAgent()", beginning);
  assert.ok(beginning > -1 && ending > beginning);
  const body = app.slice(beginning, ending);
  assert.match(body, /data: safe/);
  assert.match(body, /24 \* 3600 \* 1000/);
  assert.doesNotMatch(body, /realName:\s*d\.realName/);
  assert.doesNotMatch(body, /signature:\s*d\.signature/);
  assert.match(app, /'signature' in item \|\| 'realName' in item/);
  assert.match(app, /raw.length > 1500/);
});

test("access simulation is explicitly labeled non-biometric and non-contractual", () => {
  const html = read("index.html");
  const lock = read("src/components/screens/LockScreen.tsx");
  const sign = read("src/components/SignaturePad.tsx");
  const terminal = read("src/components/LiveTerminal.tsx");
  const form = read("src/components/AgentForm.tsx");
  assert.match(html, /Sin biometría real/);
  assert.match(lock, /no usan[\s\S]*cámara, huellas ni retina real/);
  assert.match(sign, /No es una firma legal/);
  assert.match(form, /NO SE GUARDA/);
  assert.match(terminal, /SIMULACIÓN/);
});

test("an access sequence never requires credentials or hidden remote login", () => {
  const app = read("src/App.tsx");
  assert.doesNotMatch(app, /fetch\(|axios|SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(app, /window\.setTimeout/);
  assert.match(app, /saveAgent\(full\)/);
});
