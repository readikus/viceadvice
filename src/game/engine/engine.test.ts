import { describe, expect, it } from "vitest";
import { PITCHES } from "../content/pitches";
import { REGISTER } from "../content/register";
import { LIFELINES_PER_NIGHT, MIN_PER_KIND, PITCHES_PER_NIGHT, REPORT_LEGIT, REPORT_SCAM_BONUS, WALK_LEGIT } from "../content/scoring";
import { SITUATION } from "../content/situation";
import { validateContent } from "../content/validate";
import type { Decision, PitchBrief } from "../types";
import { dealNight } from "./deal";
import { buildDebrief, decideEnding, summariseNight } from "./ending";
import { initialNight, nightReducer, type EngineState, type NightAction } from "./night";
import { lookupFrn } from "./register";

/** Deterministic RNG so deals are repeatable. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2 ** 32;
    return s / 2 ** 32;
  };
}

const run = (actions: NightAction[], from: EngineState = initialNight(SITUATION)) =>
  actions.reduce(nightReducer, from);

const legit = PITCHES.find((p) => p.kind === "legit")!;
const scam = PITCHES.find((p) => p.kind === "scam")!;

/** A night whose deck is exactly these pitches, already at the first pitch. */
const nightWith = (deck: PitchBrief[]) => run([{ type: "START", deck }, { type: "BEGIN_PITCHES" }]);

describe("content", () => {
  it("is consistent with the register", () => {
    expect(validateContent()).toEqual([]);
  });
});

describe("dealNight", () => {
  it("deals the right number with at least two of each kind, no repeats", () => {
    for (let seed = 1; seed <= 200; seed++) {
      const deck = dealNight(PITCHES, seeded(seed));
      expect(deck).toHaveLength(PITCHES_PER_NIGHT);
      expect(new Set(deck.map((p) => p.id)).size).toBe(PITCHES_PER_NIGHT);
      expect(deck.filter((p) => p.kind === "legit").length).toBeGreaterThanOrEqual(MIN_PER_KIND);
      expect(deck.filter((p) => p.kind === "scam").length).toBeGreaterThanOrEqual(MIN_PER_KIND);
    }
  });

  it("varies between nights", () => {
    const orders = new Set(Array.from({ length: 20 }, (_, i) => dealNight(PITCHES, seeded(i + 1)).map((p) => p.id).join()));
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("lookupFrn", () => {
  it("finds a listed firm, ignoring spaces", () => {
    const entry = REGISTER[0];
    expect(lookupFrn(entry.frn.split("").join(" "))).toEqual(entry);
  });

  it("returns not_found for an unlisted number", () => {
    expect(lookupFrn("000000")).toBe("not_found");
  });
});

describe("nightReducer", () => {
  it("walks splash, situation, pitches, consequence and debrief", () => {
    let s = run([{ type: "START", deck: [legit, scam] }]);
    expect(s.phase).toBe("situation");
    s = nightReducer(s, { type: "BEGIN_PITCHES" });
    expect(s.phase).toBe("pitch");
    s = run([{ type: "STAMP", decision: "SIGN" }], s);
    expect(s.phase).toBe("consequence");
    s = nightReducer(s, { type: "NEXT" });
    expect(s.phase).toBe("pitch");
    expect(s.pitchIndex).toBe(1);
    s = run([{ type: "STAMP", decision: "REPORT" }, { type: "NEXT" }], s);
    expect(s.phase).toBe("debrief");
    expect(s.results).toHaveLength(2);
  });

  it.each<[PitchBrief, Decision, number, boolean]>([
    [legit, "SIGN", legit.signDelta, true],
    [legit, "WALK", WALK_LEGIT, false],
    [legit, "REPORT", REPORT_LEGIT, false],
    [scam, "SIGN", scam.signDelta, false],
    [scam, "WALK", 0, true],
    [scam, "REPORT", REPORT_SCAM_BONUS, true],
  ])("scores %s.id %s", (pitch, decision, delta, correct) => {
    const s = run([{ type: "STAMP", decision }], nightWith([pitch]));
    expect(s.results[0]).toMatchObject({ decision, delta, correct });
    expect(s.pot).toBe(SITUATION.startingPot + delta);
    expect(s.lastDelta).toBe(delta);
  });

  it("ignores stamps outside a pitch", () => {
    const s = run([{ type: "STAMP", decision: "SIGN" }]);
    expect(s.phase).toBe("splash");
    expect(s.results).toEqual([]);
  });

  it("applies the timeout decision", () => {
    const s = run([{ type: "TIMEOUT" }], nightWith([scam]));
    expect(s.results[0].decision).toBe("WALK");
  });

  it("records register lookups and resets them per pitch", () => {
    let s = run([{ type: "LOOKUP", frn: "614 207" }, { type: "LOOKUP", frn: "614207" }], nightWith([scam, legit]));
    expect(s.lookups).toEqual(["614207"]);
    s = run([{ type: "STAMP", decision: "WALK" }, { type: "NEXT" }], s);
    expect(s.results[0].registerChecked).toBe(true);
    expect(s.lookups).toEqual([]);
  });

  it("allows one lifeline per pitch and LIFELINES_PER_NIGHT in total", () => {
    let s = nightWith([scam, legit, scam, legit]);
    s = run([{ type: "USE_LIFELINE" }, { type: "USE_LIFELINE" }], s);
    expect(s.lifelinesLeft).toBe(LIFELINES_PER_NIGHT - 1);
    for (let i = 0; i < 3; i++) s = run([{ type: "STAMP", decision: "WALK" }, { type: "NEXT" }, { type: "USE_LIFELINE" }], s);
    expect(s.lifelinesLeft).toBe(0);
    expect(s.results[0].lifelineUsed).toBe(true);
  });

  it("never lets the pot go below zero", () => {
    const poor = { ...initialNight({ ...SITUATION, startingPot: 1000 }) };
    const s = run([{ type: "START", deck: [scam] }, { type: "BEGIN_PITCHES" }, { type: "STAMP", decision: "SIGN" }], poor);
    expect(s.pot).toBe(0);
  });

  it("restarts to the splash with a full pot", () => {
    const s = run([{ type: "STAMP", decision: "SIGN" }, { type: "RESTART" }], nightWith([scam]));
    expect(s).toEqual(initialNight(SITUATION));
  });
});

describe("endings and debrief", () => {
  it("decides the ending from the pot", () => {
    expect(decideEnding(180_000, 180_000)).toBe("yacht");
    expect(decideEnding(179_999, 180_000)).toBe("bedsit");
  });

  it("marks red flags caught when a scam isn't signed, missed when it is", () => {
    const s = run(
      [{ type: "STAMP", decision: "REPORT" }, { type: "NEXT" }, { type: "STAMP", decision: "SIGN" }, { type: "NEXT" }],
      nightWith([scam, scam]),
    );
    const [first, second] = buildDebrief(s.deck, s.results);
    expect(first.flagsCaught).toEqual(scam.redFlags);
    expect(second.flagsMissed).toEqual(scam.redFlags);
    expect(summariseNight(s.results)).toMatchObject({ correct: 1, total: 2, scamsSigned: 1, scamsReported: 1 });
  });
});
