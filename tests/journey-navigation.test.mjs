import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {canTravel,SCENES} from "../src/lib/journey-navigation.mjs";

test("all four native chapters stay available", () => {
  assert.deepEqual([...SCENES],["orbit","room","core","archive"]);
});
test("core remains inaccessible until camera S1 solved", () => {
  assert.equal(canTravel("room","core",false),false);
  assert.equal(canTravel("orbit","core",false),false);
});
test("room solution enables direct transition to core immediately", () => {
  assert.equal(canTravel("room","core",true),true);
});
test("normal navigation and invalid targets cannot bypass unlock", () => {
  assert.equal(canTravel("orbit","room",false),true);
  assert.equal(canTravel("orbit","archive",false),true);
  assert.equal(canTravel("orbit","orbit",true),false);
  assert.equal(canTravel("room","unknown",true),false);
});
test("real EscapeRoom uses justSolved flag to bypass stale React closure", () => {
  const source=readFileSync(new URL("../src/chapters/Journey.tsx",import.meta.url),"utf8");
  assert.match(source,/setRoomSolved\(true\);[\s\S]{0,200}travel\('core', true\)/);
  assert.match(source,/canTravel\(scene, target, roomSolved, justSolved\)/);
});

test("archive status only claims recovered after navigating to archive", () => {
  const journey = readFileSync("src/chapters/Journey.tsx","utf8");
  assert.match(journey, /const \[archiveVisited, setArchiveVisited\] = useState\(false\)/);
  assert.match(journey, /warpTo === 'archive'\) setArchiveVisited\(true\)/);
  assert.match(journey, /archiveVisited \? 'RECUPERADO' : 'PENDIENTE'/);
  assert.doesNotMatch(journey, /ARCHIVO VENOM DESENCRYPTADO/);
});


test("chapter navigation announces current scene and locked core to screen readers", () => {
  const journey = readFileSync("src/chapters/Journey.tsx", "utf8");
  assert.match(journey, /aria-disabled=\{isLocked\}/);
  assert.match(journey, /aria-current=\{scene === s \? 'step' : undefined\}/);
  assert.match(journey, /aria-label=\{isLocked \? /);
  assert.match(journey, /sellado hasta resolver Cámara S1/);
  assert.match(journey, /onClick=\{\(\) => travel\(s\)\}/);
});

// The immediate unlock token is only valid while the visitor is in S1.
test("justSolved cannot bypass S1 from another chapter", () => {
  assert.equal(canTravel("room", "core", false, true), true);
  assert.equal(canTravel("orbit", "core", false, true), false);
  assert.equal(canTravel("archive", "core", false, true), false);
  assert.equal(canTravel("room", "core", false, "true"), false);
  assert.equal(canTravel("archive", "core", true), true);
});

test("room cleanup cancels delayed onSolve and ongoing extraction", () => {
  const source = readFileSync("src/chapters/EscapeRoom.tsx", "utf8");
  assert.match(source, /if \(solveTimer\.current !== null\) window\.clearTimeout\(solveTimer\.current\)/);
  assert.match(source, /if \(extractTimer\.current !== null\) window\.clearInterval\(extractTimer\.current\)/);
  assert.match(source, /solveTimer\.current = window\.setTimeout\(\(\) => \{/);
  assert.doesNotMatch(source, /window\.setTimeout\(onSolve, 1200\)/);
});

test("S1 extraction supports keyboard and cancelled pointer gestures", () => {
  const source = readFileSync("src/chapters/EscapeRoom.tsx", "utf8");
  assert.match(source, /onKeyDown=\{\(event\) => \{/);
  assert.match(source, /onKeyUp=\{\(event\) => \{/);
  assert.match(source, /onPointerCancel=\{stopExtract\}/);
  assert.match(source, /onBlur=\{stopExtract\}/);
  assert.match(source, /if \(solved \|\| extractTimer\.current !== null\) return/);
});
