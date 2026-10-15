import type { Ending, PitchBrief, PitchResult, RedFlag } from "../types";

export type { Ending };

/**
 * The ending is decided here, never by the model:
 * - bedsit: you finish with less than you started with;
 * - yacht: every call was right (sign the good advice, walk or report every scam);
 * - comfortable: anything in between, where you kept your pot but missed a trick.
 */
export function decideEnding(finalPot: number, startingPot: number, results: PitchResult[]): Ending {
  if (finalPot < startingPot) return "bedsit";
  return results.length > 0 && results.every((r) => r.correct) ? "yacht" : "comfortable";
}

export interface PitchDebrief {
  pitch: PitchBrief;
  result: PitchResult;
  /** Scam tells the player acted on (they didn't sign). */
  flagsCaught: RedFlag[];
  /** Scam tells the player missed (they signed). */
  flagsMissed: RedFlag[];
}

/** One row per pitch played, in order, for the debrief screen. */
export function buildDebrief(pitches: PitchBrief[], results: PitchResult[]): PitchDebrief[] {
  return results.flatMap((result) => {
    const pitch = pitches.find((p) => p.id === result.pitchId);
    if (!pitch) return [];
    const caught = pitch.kind === "scam" && result.decision !== "SIGN";
    return [
      {
        pitch,
        result,
        flagsCaught: caught ? pitch.redFlags : [],
        flagsMissed: caught ? [] : pitch.redFlags,
      },
    ];
  });
}

export interface NightSummary {
  correct: number;
  total: number;
  scamsSigned: number;
  scamsReported: number;
  registerChecks: number;
  lifelinesUsed: number;
}

export function summariseNight(results: PitchResult[]): NightSummary {
  return {
    correct: results.filter((r) => r.correct).length,
    total: results.length,
    scamsSigned: results.filter((r) => r.kind === "scam" && r.decision === "SIGN").length,
    scamsReported: results.filter((r) => r.kind === "scam" && r.decision === "REPORT").length,
    registerChecks: results.filter((r) => r.registerChecked).length,
    lifelinesUsed: results.filter((r) => r.lifelineUsed).length,
  };
}
