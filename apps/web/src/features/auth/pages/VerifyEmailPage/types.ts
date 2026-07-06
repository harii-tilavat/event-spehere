export type VerifyPhase = "verifying" | "done" | "error";

export interface VerifyState {
  phase: VerifyPhase;
  message?: string;
}
