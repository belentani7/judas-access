/** Narrative routing constraints for JUDAS: pure functions, no personal data. */
export const SCENES = Object.freeze(["orbit", "room", "core", "archive"]);
export function canTravel(current, target, roomSolved) {
  return SCENES.includes(current) && SCENES.includes(target) &&
    current !== target && (target !== "core" || roomSolved === true);
}
