/** Query key factory — single source of truth (docs/05 §4). Grows with each phase. */
export const qk = {
  health: ["health"] as const,
  me: ["auth", "me"] as const,
};
