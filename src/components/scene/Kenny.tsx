"use client";

import { useEffect, useState } from "react";
import type { KennyProps } from "@/game/ui-props";

type Mouth = "closed" | "half" | "open";

const MOOD_FACE = { neutral: "🕴️", grin: "😁", wounded: "🥺" } as const;

/** Placeholder Kenny. The real art swaps three mouth frames on the same level thresholds. */
export function Kenny({ getLevel, mood, speaking }: KennyProps) {
  const [mouth, setMouth] = useState<Mouth>("closed");

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const level = getLevel();
      setMouth(level > 0.35 ? "open" : level > 0.1 ? "half" : "closed");
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [getLevel]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-40 w-40 items-center justify-center rounded-full bg-amber-400 text-7xl transition-transform ${
          mouth === "open" ? "scale-110" : mouth === "half" ? "scale-105" : ""
        }`}
        aria-hidden
      >
        {MOOD_FACE[mood]}
      </div>
      <p className="text-sm font-semibold">Kenny Valentine</p>
      <p className="h-4 text-xs opacity-60">{speaking ? "talking…" : ""}</p>
    </div>
  );
}
