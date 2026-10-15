"use client";

import { useEffect, useRef, useState } from "react";
import type { TranscriptProps } from "@/game/ui-props";

/** Subtitle bar with the latest line, plus a drawer for the whole conversation. */
export function Transcript({ lines }: TranscriptProps) {
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shown = lines.filter((l) => l.text);
  const latest = shown.at(-1);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [open, lines]);

  return (
    <div className="relative">
      {open && (
        <div className="absolute bottom-[115%] left-0 z-30 flex max-h-[28cqw] w-full flex-col gap-[0.6cqw] overflow-y-auto rounded-[0.8cqw] border-[0.12cqw] border-paper/20 bg-ink/95 p-[1.2cqw]">
          {shown.length === 0 && <p className="text-paper/60">Nothing said yet.</p>}
          {shown.map((l) => (
            <p key={l.id} className={l.speaker === "player" ? "text-teal" : "text-paper"}>
              <span className="mr-[0.5cqw] font-display text-[0.9cqw] font-bold uppercase opacity-70">{l.speaker === "player" ? "You" : "Kenny"}</span>
              {l.text}
            </p>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
      <div className="flex min-h-[4.2cqw] items-center gap-[1cqw] rounded-[0.8cqw] border-[0.12cqw] border-paper/15 bg-ink/85 px-[1.6cqw] py-[0.6cqw] text-[1.45cqw] text-paper backdrop-blur-sm">
        <p className="line-clamp-2 flex-1" aria-live="polite">
          {latest ? (
            <>
              {latest.speaker === "player" && <span className="mr-[0.5cqw] font-display text-teal uppercase">You:</span>}
              {latest.text}
            </>
          ) : (
            <span className="text-paper/50">Kenny&apos;s about to start…</span>
          )}
        </p>
        <button onClick={() => setOpen(!open)} className="shrink-0 font-display text-[0.9cqw] tracking-widest text-paper/60 uppercase hover:text-paper">
          {open ? "Hide" : "Transcript"}
        </button>
      </div>
    </div>
  );
}
