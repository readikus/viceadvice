import type { PitchTimerProps } from "@/game/ui-props";

export function PitchTimer({ secondsLeft, totalSeconds }: PitchTimerProps) {
  const m = Math.floor(secondsLeft / 60);
  const s = String(secondsLeft % 60).padStart(2, "0");
  const low = secondsLeft <= 20;
  return (
    <div className="flex items-center gap-[0.6cqw]" aria-label={`${m} minutes ${s} seconds left`}>
      <div className="h-[0.35cqw] w-[6cqw] rounded-full bg-paper/20">
        <div className={`h-full rounded-full ${low ? "bg-magenta" : "bg-orange"}`} style={{ width: `${(secondsLeft / totalSeconds) * 100}%` }} />
      </div>
      <span className={`font-display text-[1.3cqw] font-bold tabular-nums ${low ? "text-magenta neon-text" : "text-paper"}`}>
        {m}:{s}
      </span>
    </div>
  );
}
