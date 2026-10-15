import type { PitchTimerProps } from "@/game/ui-props";

export function PitchTimer({ secondsLeft, totalSeconds }: PitchTimerProps) {
  const m = Math.floor(secondsLeft / 60);
  const s = String(secondsLeft % 60).padStart(2, "0");
  const low = secondsLeft <= 20;
  return (
    <div className="w-24 text-right">
      <p className={`text-2xl font-bold tabular-nums ${low ? "text-red-500" : ""}`}>
        {m}:{s}
      </p>
      <div className="mt-1 h-1 rounded bg-current/10">
        <div className="h-1 rounded bg-amber-400" style={{ width: `${(secondsLeft / totalSeconds) * 100}%` }} />
      </div>
    </div>
  );
}
