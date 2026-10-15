"use client";

import { useEffect, useState } from "react";
import { KENNY_ATLAS } from "@/game/assets";
import type { KennyProps } from "@/game/ui-props";

type Mouth = keyof typeof KENNY_ATLAS.mouth;

/** Mouth thresholds on Kenny's output level, 0 to 1. */
const HALF_AT = 0.1;
const OPEN_AT = 0.35;

/**
 * Kenny behind the desk, drawn from the sprite sheet. The mouth column follows his
 * voice level every frame; the row is his mood, with the occasional blink.
 */
export function Kenny({ getLevel, mood, speaking }: KennyProps) {
  const [mouth, setMouth] = useState<Mouth>("closed");
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    let frame = 0;
    const tick = (t: number) => {
      let level = getLevel();
      // If the browser won't let us measure his voice, fake a speech-like rhythm while he talks.
      if (speaking && level < 0.02) level = Math.max(0, Math.sin(t / 90) * 0.3 + Math.sin(t / 37) * 0.2 + 0.1);
      setMouth(level > OPEN_AT ? "open" : level > HALF_AT ? "half" : "closed");
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [getLevel, speaking]);

  // Blink every few seconds.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setBlinking(true);
        timer = setTimeout(() => {
          setBlinking(false);
          schedule();
        }, 140);
      }, 2500 + Math.random() * 3500);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const col = KENNY_ATLAS.mouth[mouth];
  // Only blink when his mouth is shut, so the eyes-closed row never fights the lip-sync.
  const row = blinking && mouth === "closed" ? KENNY_ATLAS.expression.eyesClosed : KENNY_ATLAS.expression[mood];

  return (
    <div
      role="img"
      aria-label={speaking ? "Kenny Valentine, talking" : "Kenny Valentine"}
      className="h-full w-full bg-no-repeat drop-shadow-[0_0_1.5cqw_rgba(255,46,136,0.35)]"
      style={{
        backgroundImage: `url(${KENNY_ATLAS.path})`,
        backgroundSize: `${KENNY_ATLAS.columns * 100}% ${KENNY_ATLAS.rows * 100}%`,
        backgroundPosition: `${(col / (KENNY_ATLAS.columns - 1)) * 100}% ${(row / (KENNY_ATLAS.rows - 1)) * 100}%`,
      }}
    />
  );
}
