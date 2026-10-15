"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ASSETS } from "@/game/assets";
import { PITCHES } from "@/game/content/pitches";
import { decideEnding } from "@/game/engine/ending";
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
import { Stage, Wordmark } from "./scene/Stage";
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
  const [brochureDismissed, setBrochureDismissed] = useState(false);
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
      setBrochureDismissed(false);
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
          ending: decideEnding(finalPot, state.situation.startingPot, state.results),
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
  // Kenny slides his paperwork over with a tool call; if he never does, it lands once he's opened the pitch.
  const kennyOpened = voice.lines.some((l) => l.speaker === "kenny" && l.done);
  const shownBrochure = brochureDismissed ? null : (brochure ?? (kennyOpened ? (pitch?.brochure ?? null) : null));

  const statusLight = voice.playerTalking
    ? { label: "Listening", color: "bg-magenta" }
    : voice.kennySpeaking
      ? { label: "Kenny's talking", color: "bg-orange" }
      : voice.status === "live"
        ? { label: "Ready", color: "bg-teal" }
        : voice.status === "connecting"
          ? { label: "Connecting", color: "bg-paper/60 animate-pulse" }
          : { label: "Offline", color: "bg-paper/30" };

  return (
    <Stage background={ASSETS.office.path}>
      {/* Kenny sits behind the desk; the desk's front edge is drawn over him. */}
      <div className="absolute top-[6%] left-1/2 aspect-square h-[61%] -translate-x-1/2">
        <Kenny getLevel={voice.getKennyLevel} mood={mood} speaking={voice.kennySpeaking} />
      </div>
      <Image src={ASSETS.desk.path} alt="" fill sizes="100vw" loading="eager" className="pointer-events-none object-cover" />

      {/* Top bar. */}
      <header className="absolute inset-x-0 top-0 flex h-[7%] items-center justify-between bg-gradient-to-b from-ink/95 to-ink/70 px-[2.5%]">
        <Wordmark className="text-[2.6cqw]" />
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-[1.5cqw]">
          <p className="font-display text-[1.5cqw] font-bold tracking-[0.35em] text-paper uppercase">
            Pitch {state.pitchIndex + 1} / {state.deck.length}
          </p>
          {inPitch && <PitchTimer secondsLeft={night.secondsLeft} totalSeconds={night.totalSeconds} />}
        </div>
        <CashMeter pot={state.pot} startingPot={state.situation.startingPot} lastDelta={state.lastDelta} />
      </header>

      <div className="absolute top-[12%] left-[2.2%] w-[20%]">
        <SituationCard situation={state.situation} variant="compact" />
      </div>

      {/* Left of the desk: the phone with PlannerPal, and the register. */}
      <div className="absolute top-[50%] left-[7%] w-[14%]">
        <Image src={ASSETS.props.telephone.path} alt="" width={ASSETS.props.telephone.width} height={ASSETS.props.telephone.height} className="h-auto w-full drop-shadow-xl" />
      </div>
      <div className="absolute top-[61%] left-[17%] w-[10.5%]">
        <Lifeline
          left={state.lifelinesLeft}
          loading={lifelineLoading}
          advice={advice}
          onCall={() => void callLifeline()}
          onDismiss={() => setAdvice(null)}
        />
      </div>
      <div className="absolute top-[64%] left-[0.5%] w-[16%]">
        <RegisterBook
          open={registerOpen}
          onToggle={() => setRegisterOpen(!registerOpen)}
          onLookup={night.lookup}
          result={night.lookupResult}
          lastQuery={night.lastQuery}
        />
      </div>

      {/* Right of the desk: Kenny's paperwork. */}
      <div className="absolute top-[30%] right-[3.5%] w-[17%]">
        <Brochure brochure={shownBrochure} pitch={pitch ?? null} onDismiss={() => setBrochureDismissed(true)} />
      </div>

      {/* The stamp lands on the desk. */}
      {lastResult && (
        <div
          key={lastResult.pitchId}
          className={`absolute top-[52%] left-1/2 rounded-[1cqw] border-[0.6cqw] px-[3cqw] py-[0.5cqw] font-display text-[6cqw] font-bold tracking-widest uppercase neon-text [animation:stamp-slam_0.45s_ease-out_forwards] ${
            lastResult.decision === "SIGN" ? "border-magenta text-magenta" : lastResult.decision === "WALK" ? "border-orange text-orange" : "border-teal text-teal"
          }`}
        >
          {lastResult.decision === "SIGN" ? "Signed" : lastResult.decision === "WALK" ? "Walked" : "Reported"}
        </div>
      )}

      {/* Subtitles. */}
      <div className="absolute top-[78%] left-[10%] w-[80%]">
        {inPitch && voice.error ? (
          <div className="flex items-center justify-between gap-[1cqw] rounded-[0.8cqw] border-[0.12cqw] border-magenta bg-ink/90 px-[1.6cqw] py-[0.8cqw] text-[1.25cqw] text-magenta">
            <p>{voice.error}</p>
            {voice.status !== "live" && (
              <button onClick={() => openPitch(pitch?.id)} className="shrink-0 rounded-full border border-paper/50 px-[1.2cqw] py-[0.3cqw] font-display text-paper uppercase">
                Try again
              </button>
            )}
          </div>
        ) : inPitch ? (
          <Transcript lines={voice.lines} />
        ) : (
          lastResult && (
            <div className="rounded-[0.8cqw] border-[0.12cqw] border-paper/15 bg-ink/85 px-[1.6cqw] py-[0.9cqw] text-center text-[1.45cqw] text-paper">
              {lastResult.decision === "SIGN" ? "Kenny shakes your hand. " : "Kenny looks wounded. "}
              Your pot moves <b className={lastResult.delta >= 0 ? "text-teal" : "text-magenta"}>{formatDelta(lastResult.delta)}</b>.
            </div>
          )
        )}
      </div>

      {/* Controls. */}
      <div className="absolute top-[88.5%] inset-x-0 flex items-center justify-center gap-[1.6cqw]">
        {inPitch ? (
          <>
            <TalkButton disabled={!canTalk} talking={voice.playerTalking} onPress={pressTalk} onRelease={releaseTalk} hint="Hold space to talk" />
            <p className="flex w-[11cqw] items-center gap-[0.5cqw] font-display text-[1.05cqw] font-bold tracking-widest text-paper uppercase">
              <span className={`inline-block h-[0.8cqw] w-[0.8cqw] rounded-full ${statusLight.color}`} aria-hidden />
              {statusLight.label}
            </p>
            <StampBar disabled={false} onStamp={night.stamp} stamped={null} />
          </>
        ) : (
          lastResult && (
            <button
              onClick={nextPitch}
              className="rounded-full border-[0.2cqw] border-teal bg-ink/90 px-[3cqw] py-[0.9cqw] font-display text-[1.7cqw] font-bold tracking-widest text-teal uppercase neon-box hover:bg-teal hover:text-ink"
            >
              {isLastPitch ? "See the morning papers" : "Next pitch"}
            </button>
          )
        )}
      </div>
    </Stage>
  );
}
