import type { Decision } from "@/game/types";
import type { StampBarProps } from "@/game/ui-props";

const STAMPS: { decision: Decision; color: string; hint: string }[] = [
  { decision: "SIGN", color: "text-magenta border-magenta hover:bg-magenta", hint: "Take the deal" },
  { decision: "WALK", color: "text-orange border-orange hover:bg-orange", hint: "Politely decline" },
  { decision: "REPORT", color: "text-teal border-teal hover:bg-teal", hint: "Report it as a scam" },
];

export function StampBar({ disabled, onStamp, stamped }: StampBarProps) {
  return (
    <div className="flex gap-[1.5cqw]">
      {STAMPS.map(({ decision, color, hint }) => (
        <button
          key={decision}
          disabled={disabled}
          onClick={() => onStamp(decision)}
          title={hint}
          className={`w-[11cqw] rounded-[0.7cqw] border-[0.2cqw] bg-ink/90 py-[0.8cqw] font-display text-[1.9cqw] font-bold tracking-wider neon-box transition-colors hover:text-ink disabled:pointer-events-none ${color} ${
            stamped && stamped !== decision ? "opacity-30" : ""
          }`}
        >
          {decision}
        </button>
      ))}
    </div>
  );
}
