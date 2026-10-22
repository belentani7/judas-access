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
  assert.match(source,/canTravel\(scene, target, roomSolved \|\| justSolved\)/);
});
