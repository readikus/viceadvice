"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PITCHES } from "@/game/content/pitches";
import { useNight } from "@/game/engine/useNight";
import type { BrochureId, FrontPageRequest, FrontPageResponse, PlannerPalRequest, PlannerPalResponse } from "@/game/types";
import type { KennyMood } from "@/game/ui-props";
import { useKennyVoice } from "@/lib/realtime/useKennyVoice";
import { Brochure } from "./scene/Brochure";
import { CashMeter } from "./scene/CashMeter";
import { Debrief } from "./scene/Debrief";
import { formatDelta } from "./scene/format";
import { Kenny } from "./scene/Kenny";
import { Lifeline } from "./scene/Lifeline";
import { PitchTimer } from "./scene/PitchTimer";
import { RegisterBook } from "./scene/RegisterBook";
import { SituationCard } from "./scene/SituationCard";
import { Splash } from "./scene/Splash";
import { StampBar } from "./scene/StampBar";
import { TalkButton } from "./scene/TalkButton";
import { Transcript } from "./scene/Transcript";

/** PlannerPal hears the last minute of the meeting. */
const LIFELINE_WINDOW_MS = 60_000;

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? `${url} failed`);
  return data as T;
}

/** One night at Kenny's: splash, situation, five pitches, debrief. */
export function Game() {
  const voice = useKennyVoice();
  const night = useNight({ clockRunning: voice.status === "live" });
  const { state, pitch } = night;

  const [registerOpen, setRegisterOpen] = useState(false);
  const [brochure, setBrochure] = useState<BrochureId | null>(null);
  const [lifelineLoading, setLifelineLoading] = useState(false);
  const [advice, setAdvice] = useState<[string, string] | null>(null);
  const [frontPage, setFrontPage] = useState<FrontPageResponse | null>(null);

  const lastResult = state.phase === "consequence" ? state.results.at(-1) ?? null : null;
  const inPitch = state.phase === "pitch";
  const { endPitch, startPitch, pressTalk, releaseTalk, onEvent } = voice;

  // Kenny slides paperwork across the desk.
  useEffect(() => onEvent((e) => e.type === "show_brochure" && setBrochure(e.brochure)), [onEvent]);

  // A stamp (or the clock running out) ends Kenny's line.
  useEffect(() => {
    if (!inPitch) endPitch();
  }, [inPitch, endPitch]);

  /** Clears the desk and rings Kenny for the next pitch. Called from a click, so the mic prompt is allowed. */
  const openPitch = useCallback(
    (pitchId: string | undefined) => {
      setRegisterOpen(false);
      setBrochure(null);
      setAdvice(null);
      if (pitchId) void startPitch(pitchId);
    },
    [startPitch],
  );

  const beginPitches = () => {
    night.beginPitches();
    openPitch(state.deck[0]?.id);
  };

  const nextPitch = () => {
    night.next();
    openPitch(state.deck[state.pitchIndex + 1]?.id);
  };

  const restart = () => {
    setFrontPage(null);
    night.restart();
  };

  const callLifeline = async () => {
    if (!pitch || state.lifelinesLeft <= 0 || state.lifelineUsedThisPitch) return;
    night.callLifeline();
    setLifelineLoading(true);
    const since = Date.now() - LIFELINE_WINDOW_MS;
    const request: PlannerPalRequest = {
      pitchId: pitch.id,
      lines: voice.lines.filter((l) => l.at >= since && l.text).map(({ speaker, text }) => ({ speaker, text })),
      registerChecked: state.lookups.length > 0,
    };
    try {
      setAdvice((await postJson<PlannerPalResponse>("/api/plannerpal", request)).lines);
    } catch {
      setAdvice(["PlannerPal's line is busy.", "Trust the register, and take your time."]);
    } finally {
      setLifelineLoading(false);
    }
  };

  // The front page is written once the night is over.
  const finalPot = state.pot;
  const requestedFrontPage = useRef(false);
  useEffect(() => {
    if (state.phase !== "debrief") {
      requestedFrontPage.current = false;
      return;
    }
    if (requestedFrontPage.current) return;
    requestedFrontPage.current = true;
    const request: FrontPageRequest = { finalPot, startingPot: state.situation.startingPot, results: state.results };
    postJson<FrontPageResponse>("/api/frontpage", request)
      .then(setFrontPage)
      .catch(() =>
        setFrontPage({
          ending: finalPot >= state.situation.startingPot ? "yacht" : "bedsit",
          headline: "PRESSES JAMMED",
          story: ["The newsroom's on strike tonight.", "Your results are below.", "Kenny says it's not his fault."],
        }),
      );
  }, [state.phase, state.results, state.situation.startingPot, finalPot]);

  // Hold SPACE to talk, unless the player is typing in the register.
  const canTalk = inPitch && voice.status === "live";
  useEffect(() => {
    if (!canTalk) return;
    const typing = (e: KeyboardEvent) => e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || typing(e)) return;
      e.preventDefault();
      if (!e.repeat) pressTalk();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code !== "Space" || typing(e)) return;
      e.preventDefault();
      releaseTalk();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      releaseTalk();
    };
  }, [canTalk, pressTalk, releaseTalk]);

  if (state.phase === "splash") return <Splash onStart={night.start} />;
  if (state.phase === "situation") return <SituationCard situation={state.situation} variant="full" onContinue={beginPitches} />;
  if (state.phase === "debrief") {
    return (
      <Debrief
        frontPage={frontPage}
        startingPot={state.situation.startingPot}
        finalPot={state.pot}
        results={state.results}
        pitches={state.deck.length ? state.deck : PITCHES}
        onPlayAgain={restart}
      />
    );
  }

  const mood: KennyMood = lastResult ? (lastResult.decision === "SIGN" ? "grin" : "wounded") : "neutral";
  const isLastPitch = state.pitchIndex + 1 >= state.deck.length;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
        <SituationCard situation={state.situation} variant="compact" />
        <CashMeter pot={state.pot} startingPot={state.situation.startingPot} lastDelta={state.lastDelta} />
        <div className="flex flex-col items-end gap-1">
          <p className="text-xs opacity-60">
            Pitch {state.pitchIndex + 1} of {state.deck.length}
          </p>
          {inPitch && <PitchTimer secondsLeft={night.secondsLeft} totalSeconds={night.totalSeconds} />}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[1fr_auto_1fr]">
        <RegisterBook
          open={registerOpen}
          onToggle={() => setRegisterOpen(!registerOpen)}
          onLookup={night.lookup}
          result={night.lookupResult}
          lastQuery={night.lastQuery}
        />
        <Kenny getLevel={voice.getKennyLevel} mood={mood} speaking={voice.kennySpeaking} />
        <div className="flex justify-end">
          <Brochure brochure={brochure} onDismiss={() => setBrochure(null)} />
        </div>
      </div>

      {inPitch ? (
        <div className="flex flex-col items-center gap-4">
          {voice.status === "connecting" && <p className="text-sm opacity-70">Kenny&apos;s picking up the phone…</p>}
          {voice.error && (
            <div className="flex flex-col items-center gap-2">
              <p className="max-w-md text-center text-sm text-red-500">{voice.error}</p>
              {voice.status !== "live" && (
                <button onClick={() => openPitch(pitch?.id)} className="rounded-full border border-current/30 px-4 py-2 text-sm">
                  Try again
                </button>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-start justify-center gap-6">
            <Lifeline
              left={state.lifelinesLeft}
              loading={lifelineLoading}
              advice={advice}
              onCall={() => void callLifeline()}
              onDismiss={() => setAdvice(null)}
            />
            <TalkButton
              disabled={!canTalk}
              talking={voice.playerTalking}
              onPress={pressTalk}
              onRelease={releaseTalk}
              hint="Hold SPACE to talk"
            />
          </div>
          <StampBar disabled={false} onStamp={night.stamp} stamped={null} />
        </div>
      ) : (
        lastResult && (
          <div className="flex flex-col items-center gap-4">
            <StampBar disabled onStamp={() => {}} stamped={lastResult.decision} />
            <p className="text-lg">
              {lastResult.decision === "SIGN" ? "Kenny shakes your hand. " : "Kenny looks wounded. "}
              Your pot moves <b>{formatDelta(lastResult.delta)}</b>.
            </p>
            <button onClick={nextPitch} className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-black hover:bg-amber-300">
              {isLastPitch ? "See the morning papers" : "Next pitch"}
            </button>
          </div>
        )
      )}

      <Transcript lines={voice.lines} />
    </div>
  );
}
