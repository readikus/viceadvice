import type { StampBarProps } from "@/game/ui-props";
import type { Decision } from "@/game/types";

const STAMPS: { decision: Decision; className: string; hint: string }[] = [
  { decision: "SIGN", className: "bg-teal-500 hover:bg-teal-400", hint: "Take the deal" },
  { decision: "WALK", className: "bg-zinc-500 hover:bg-zinc-400", hint: "No thanks" },
  { decision: "REPORT", className: "bg-red-600 hover:bg-red-500", hint: "Report a scam" },
];

export function StampBar({ disabled, onStamp, stamped }: StampBarProps) {
  return (
    <div className="flex gap-3">
      {STAMPS.map(({ decision, className, hint }) => (
        <button
          key={decision}
          disabled={disabled}
          onClick={() => onStamp(decision)}
          title={hint}
          className={`rounded-lg px-5 py-3 font-black tracking-widest text-white disabled:opacity-40 ${className} ${
            stamped === decision ? "ring-4 ring-amber-400" : ""
          }`}
        >
          {decision}
        </button>
      ))}
    </div>
  );
}
