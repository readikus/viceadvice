"use client";

import { useEffect, useRef, useState } from "react";
import type { TranscriptProps } from "@/game/ui-props";

export function Transcript({ lines }: TranscriptProps) {
  const [open, setOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lines]);

  const shown = lines.filter((l) => l.text || !l.done);
  return (
    <div className="rounded-xl border border-current/10">
      <button onClick={() => setOpen(!open)} className="w-full px-4 py-2 text-left text-xs font-semibold opacity-70">
        Transcript {open ? "▾" : "▸"}
      </button>
      {open && (
        <div className="flex max-h-56 flex-col gap-2 overflow-y-auto px-4 pb-4">
          {shown.length === 0 && <p className="text-sm opacity-50">Kenny&apos;s about to start…</p>}
          {shown.map((l) => (
            <div
              key={l.id}
              className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-sm ${
                l.speaker === "player" ? "self-end bg-foreground/10" : "self-start bg-amber-400/20"
              }`}
            >
              <span className="block text-[10px] font-semibold opacity-60">{l.speaker === "player" ? "You" : "Kenny"}</span>
              {l.text || <span className="opacity-50">…</span>}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
