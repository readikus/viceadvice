import type { Decision, PitchKind } from "../types";

/**
 * Scoring rules. The spec only fixed three of these six cells; the rest are proposals.
 *
 *              legit                       scam
 * SIGN    +pitch.signDelta (gain)      pitch.signDelta (big loss)
 * WALK    +WALK_LEGIT (barely grows)   0
 * REPORT  REPORT_LEGIT (penalty)       +REPORT_SCAM_BONUS
 *
 * Reporting a legit pitch costs a little, so "report everything" isn't a winning strategy.
 */
export const WALK_LEGIT = 500;
export const WALK_SCAM = 0;
export const REPORT_SCAM_BONUS = 5_000;
export const REPORT_LEGIT = -2_000;

/** If the pitch timer runs out with no stamp, this is what happens. */
export const TIMEOUT_DECISION: Decision = "WALK";

export const PITCHES_PER_NIGHT = 5;
export const MIN_PER_KIND = 2;
export const LIFELINES_PER_NIGHT = 2;
/** Each pitch runs for about two minutes. */
export const PITCH_SECONDS = 120;

export function scoreDecision(kind: PitchKind, decision: Decision, signDelta: number): number {
  if (decision === "SIGN") return signDelta;
  if (decision === "WALK") return kind === "legit" ? WALK_LEGIT : WALK_SCAM;
  return kind === "scam" ? REPORT_SCAM_BONUS : REPORT_LEGIT;
}

export function isCorrect(kind: PitchKind, decision: Decision): boolean {
  return kind === "legit" ? decision === "SIGN" : decision !== "SIGN";
}
