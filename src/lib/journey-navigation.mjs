/** Narrative routing constraints for JUDAS; never an authentication gate. */
export const SCENES = Object.freeze(["orbit", "room", "core", "archive"]);
export function canTravel(current, target, roomSolved, justSolved = false) {
  return SCENES.includes(current) && SCENES.includes(target) &&
    current !== target &&
    (target !== "core" || roomSolved === true || (current === "room" && justSolved === true));
}
