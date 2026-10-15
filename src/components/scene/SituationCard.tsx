import type { SituationCardProps } from "@/game/ui-props";
import { formatPounds } from "./format";

export function SituationCard({ situation, variant, onContinue }: SituationCardProps) {
  if (variant === "compact") {
    return (
      <div className="rounded-xl border border-current/15 p-3 text-xs">
        <p className="font-semibold">You: {situation.age}, {formatPounds(situation.startingPot)} in pensions</p>
        <ul className="mt-1 list-disc pl-4 opacity-70">
          {situation.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <section className="m-auto flex max-w-xl flex-col gap-4 rounded-2xl border border-current/15 p-8">
      <p className="text-xs font-semibold uppercase tracking-widest opacity-60">Your situation</p>
      <h2 className="text-2xl font-bold">{situation.headline}</h2>
      <ul className="list-disc space-y-1 pl-5">
        {situation.facts.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <p className="text-sm opacity-70">
        Kenny has five pitches for you tonight. For each one, stamp SIGN, WALK or REPORT. Check his firm number in the
        register, and call PlannerPal if you need a second opinion.
      </p>
      {onContinue && (
        <button onClick={onContinue} className="self-start rounded-full bg-amber-400 px-6 py-3 font-semibold text-black hover:bg-amber-300">
          Sit down with Kenny
        </button>
      )}
    </section>
  );
}
