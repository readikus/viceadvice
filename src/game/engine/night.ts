import type { Decision, NightState, PitchBrief, PitchResult, Situation } from "../types";
import { LIFELINES_PER_NIGHT, TIMEOUT_DECISION, isCorrect, scoreDecision } from "../content/scoring";
import { normaliseFrn } from "./register";

/** The night as the engine sees it: the shared NightState plus per-pitch bookkeeping. */
export interface EngineState extends NightState {
  lifelineUsedThisPitch: boolean;
  /** Change to the pot from the last stamp, for the cash meter flash. */
  lastDelta: number | null;
}

export type NightAction =
  | { type: "START"; deck: PitchBrief[] }
  | { type: "BEGIN_PITCHES" }
  | { type: "LOOKUP"; frn: string }
  | { type: "USE_LIFELINE" }
  | { type: "STAMP"; decision: Decision }
  | { type: "TIMEOUT" }
  | { type: "NEXT" }
  | { type: "RESTART" };

export function initialNight(situation: Situation): EngineState {
  return {
    phase: "splash",
    situation,
    deck: [],
    pitchIndex: 0,
    pot: situation.startingPot,
    results: [],
    lifelinesLeft: LIFELINES_PER_NIGHT,
    lookups: [],
    lifelineUsedThisPitch: false,
    lastDelta: null,
  };
}

export function currentPitch(state: NightState): PitchBrief | undefined {
  return state.phase === "pitch" || state.phase === "consequence"
    ? state.deck[state.pitchIndex]
    : undefined;
}

function stamp(state: EngineState, decision: Decision): EngineState {
  const pitch = state.deck[state.pitchIndex];
  if (state.phase !== "pitch" || !pitch) return state;
  const delta = scoreDecision(pitch.kind, decision, pitch.signDelta);
  const result: PitchResult = {
    pitchId: pitch.id,
    kind: pitch.kind,
    decision,
    delta,
    registerChecked: state.lookups.length > 0,
    lifelineUsed: state.lifelineUsedThisPitch,
    correct: isCorrect(pitch.kind, decision),
  };
  return {
    ...state,
    phase: "consequence",
    // The pot can't go below zero: you can only lose what you have.
    pot: Math.max(0, state.pot + delta),
    results: [...state.results, result],
    lastDelta: delta,
  };
}

export function nightReducer(state: EngineState, action: NightAction): EngineState {
  switch (action.type) {
    case "START":
      return { ...initialNight(state.situation), phase: "situation", deck: action.deck };

    case "BEGIN_PITCHES":
      if (state.phase !== "situation") return state;
      return { ...state, phase: "pitch", pitchIndex: 0, lookups: [], lifelineUsedThisPitch: false };

    case "LOOKUP": {
      if (state.phase !== "pitch") return state;
      const frn = normaliseFrn(action.frn);
      if (!frn || state.lookups.includes(frn)) return state;
      return { ...state, lookups: [...state.lookups, frn] };
    }

    case "USE_LIFELINE":
      if (state.phase !== "pitch" || state.lifelinesLeft <= 0 || state.lifelineUsedThisPitch) return state;
      return { ...state, lifelinesLeft: state.lifelinesLeft - 1, lifelineUsedThisPitch: true };

    case "STAMP":
      return stamp(state, action.decision);

    case "TIMEOUT":
      return stamp(state, TIMEOUT_DECISION);

    case "NEXT": {
      if (state.phase !== "consequence") return state;
      const next = state.pitchIndex + 1;
      if (next >= state.deck.length) return { ...state, phase: "debrief", lastDelta: null };
      return {
        ...state,
        phase: "pitch",
        pitchIndex: next,
        lookups: [],
        lifelineUsedThisPitch: false,
        lastDelta: null,
      };
    }

    case "RESTART":
      return initialNight(state.situation);
  }
}
