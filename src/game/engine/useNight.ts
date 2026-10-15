"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import type { Decision } from "../types";
import { PITCHES } from "../content/pitches";
import { PITCH_SECONDS } from "../content/scoring";
import { SITUATION } from "../content/situation";
import { dealNight } from "./deal";
import { currentPitch, initialNight, nightReducer } from "./night";
import { lookupFrn } from "./register";

/**
 * Runs one night: the reducer plus the pitch timer.
 * `clockRunning` lets the page pause the timer, e.g. while Kenny's line is connecting.
 */
export function useNight({ clockRunning }: { clockRunning: boolean }) {
  const [state, dispatch] = useReducer(nightReducer, SITUATION, initialNight);
  const [secondsLeft, setSecondsLeft] = useState(PITCH_SECONDS);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const pitch = currentPitch(state);
  const inPitch = state.phase === "pitch";

  // Every action that opens a pitch gives it a fresh clock and an empty register book.
  const freshPitch = useCallback(() => {
    setSecondsLeft(PITCH_SECONDS);
    setLastQuery(null);
  }, []);

  useEffect(() => {
    if (!inPitch || !clockRunning) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [inPitch, clockRunning]);

  useEffect(() => {
    if (inPitch && secondsLeft === 0) dispatch({ type: "TIMEOUT" });
  }, [inPitch, secondsLeft]);

  return {
    state,
    pitch,
    secondsLeft,
    totalSeconds: PITCH_SECONDS,
    lastQuery,
    lookupResult: lastQuery ? lookupFrn(lastQuery) : null,
    start: useCallback(() => dispatch({ type: "START", deck: dealNight(PITCHES) }), []),
    beginPitches: useCallback(() => {
      freshPitch();
      dispatch({ type: "BEGIN_PITCHES" });
    }, [freshPitch]),
    lookup: useCallback((frn: string) => {
      setLastQuery(frn);
      dispatch({ type: "LOOKUP", frn });
    }, []),
    callLifeline: useCallback(() => dispatch({ type: "USE_LIFELINE" }), []),
    stamp: useCallback((decision: Decision) => dispatch({ type: "STAMP", decision }), []),
    next: useCallback(() => {
      freshPitch();
      dispatch({ type: "NEXT" });
    }, [freshPitch]),
    restart: useCallback(() => dispatch({ type: "RESTART" }), []),
  };
}
