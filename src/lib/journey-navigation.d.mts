/** No real identity authentication; only governs fictional scene transitions. */
export declare function canTravel(
  current: "orbit" | "room" | "core" | "archive",
  target: "orbit" | "room" | "core" | "archive",
  roomSolved: boolean,
  justSolved?: boolean,
): boolean;
export declare const SCENES: ReadonlyArray<"orbit" | "room" | "core" | "archive">;
