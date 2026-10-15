"use client";

import { useEffect, useRef } from "react";
import { ADVISOR_NAME } from "@/lib/persona";
import { useRealtimeDialogue } from "@/lib/useRealtimeDialogue";

export function Game() {
  const { status, error, lines, muted, advisorSpeaking, start, stop, toggleMute } =
    useRealtimeDialogue();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const live = status === "live";
  const connecting = status === "connecting";

  return (
    <div className="flex flex-1 flex-col gap-6">
      <section className="flex flex-col items-center gap-4 py-6">
        <div
          className={`flex h-28 w-28 items-center justify-center rounded-full bg-amber-400 text-5xl text-black transition-transform ${
            advisorSpeaking ? "scale-110 animate-pulse" : ""
          }`}
          aria-hidden
        >
          🤑
        </div>
        <p className="text-sm opacity-70">
          {connecting && `Calling ${ADVISOR_NAME}…`}
          {live && (advisorSpeaking ? `${ADVISOR_NAME} is talking` : "Your turn: just speak")}
          {!live && !connecting && `${ADVISOR_NAME} is waiting by the phone`}
        </p>

        <div className="flex gap-3">
          {!live ? (
            <button
              onClick={start}
              disabled={connecting}
              className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-black hover:bg-amber-300 disabled:opacity-50"
            >
              {connecting ? "Connecting…" : `Call ${ADVISOR_NAME}`}
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className="rounded-full border border-current/30 px-5 py-3 font-medium hover:bg-foreground/5"
              >
                {muted ? "Unmute" : "Mute"}
              </button>
              <button
                onClick={stop}
                className="rounded-full bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-500"
              >
                Hang up
              </button>
            </>
          )}
        </div>

        {error && <p className="max-w-md text-center text-sm text-red-500">{error}</p>}
      </section>

      <section className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border border-current/10 p-4">
        {lines.length === 0 ? (
          <p className="m-auto text-sm opacity-50">The transcript will appear here.</p>
        ) : (
          lines
            .filter((l) => l.text || !l.done)
            .map((l) => (
              <div
                key={l.id}
                className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                  l.speaker === "player"
                    ? "self-end bg-foreground/10"
                    : "self-start bg-amber-400/20"
                }`}
              >
                <span className="block text-xs font-semibold opacity-60">
                  {l.speaker === "player" ? "You" : ADVISOR_NAME}
                </span>
                {l.text || <span className="opacity-50">…</span>}
              </div>
            ))
        )}
        <div ref={bottomRef} />
      </section>
    </div>
  );
}
