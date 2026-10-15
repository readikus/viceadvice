import type { LifelineProps } from "@/game/ui-props";

export function Lifeline({ left, loading, advice, onCall, onDismiss }: LifelineProps) {
  return (
    <div className="flex max-w-xs flex-col gap-2">
      <button
        onClick={onCall}
        disabled={left <= 0 || loading}
        className="rounded-full border border-current/30 px-4 py-2 text-sm font-semibold hover:bg-foreground/5 disabled:opacity-40"
      >
        {loading ? "Calling PlannerPal…" : `☎️ Call PlannerPal (${left} left)`}
      </button>
      {advice && (
        <button onClick={onDismiss} className="rounded-xl bg-teal-500/15 p-3 text-left text-sm" title="Dismiss">
          <span className="block text-xs font-semibold opacity-60">PlannerPal says</span>
          {advice[0]}
          <br />
          {advice[1]}
        </button>
      )}
    </div>
  );
}
