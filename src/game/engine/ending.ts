import type { FrontPageResponse, PitchBrief, PitchResult, RedFlag } from "../types";

export type Ending = FrontPageResponse["ending"];

/**
 * The ending is decided here, never by the model: finish the night with at least
 * the pot you started with and it's the yacht; lose money and it's the bedsit.
 */
export function decideEnding(finalPot: number, startingPot: number): Ending {
  return finalPot >= startingPot ? "yacht" : "bedsit";
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
