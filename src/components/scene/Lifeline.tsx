import type { LifelineProps } from "@/game/ui-props";

/** The PlannerPal card propped against the phone. */
export function Lifeline({ left, loading, advice, onCall, onDismiss }: LifelineProps) {
  return (
    <div className="relative">
      {advice && (
        <button
          onClick={onDismiss}
          title="Dismiss"
          className="absolute bottom-[110%] left-0 z-20 w-[20cqw] rounded-[0.8cqw] border-[0.15cqw] border-teal bg-ink/95 p-[1cqw] text-left text-[1.1cqw] leading-snug text-paper neon-box"
        >
          <span className="block font-display text-[0.9cqw] font-bold tracking-widest text-teal uppercase">PlannerPal says</span>
          {advice[0]}
          <br />
          {advice[1]}
        </button>
      )}
      <div className="-rotate-[4deg] rounded-[0.6cqw] border-[0.12cqw] border-paper/30 bg-ink/95 p-[0.8cqw] shadow-xl">
        <p className="flex items-center gap-[0.4cqw] text-[1.25cqw] font-semibold text-paper">
          <span className="inline-block h-[1.1cqw] w-[1.1cqw] rounded-tl-full rounded-br-full bg-teal" aria-hidden />
          PlannerPal
        </p>
        <p className="text-[0.9cqw] text-paper/80">
          {left} {left === 1 ? "call" : "calls"} left
        </p>
        <button
          onClick={onCall}
          disabled={left <= 0 || loading}
          className="mt-[0.4cqw] w-full rounded-[0.3cqw] bg-teal px-[0.5cqw] py-[0.25cqw] font-display text-[0.9cqw] font-bold tracking-wide text-ink uppercase hover:bg-paper disabled:opacity-40"
        >
          {loading ? "Calling…" : "Call PlannerPal"}
        </button>
      </div>
    </div>
  );
}
