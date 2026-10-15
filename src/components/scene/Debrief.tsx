import type { DebriefProps } from "@/game/ui-props";
import { buildDebrief, summariseNight } from "@/game/engine/ending";
import { formatDelta, formatPounds } from "./format";

export function Debrief({ frontPage, startingPot, finalPot, results, pitches, onPlayAgain }: DebriefProps) {
  const rows = buildDebrief(pitches, results);
  const summary = summariseNight(results);
  return (
    <section className="flex flex-col gap-8 py-6">
      <div className="rounded-2xl border-4 border-double border-current/40 p-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] opacity-60">The Miami Ledger · 1986</p>
        {frontPage ? (
          <>
            <h2 className="mt-2 text-4xl font-black uppercase">{frontPage.headline}</h2>
            <p className="mt-1 text-sm font-semibold">{frontPage.ending === "yacht" ? "🛥️ Yacht ending" : "🛏️ Bedsit ending"}</p>
            <div className="mx-auto mt-4 max-w-2xl space-y-1 text-left">
              {frontPage.story.map((s) => (
                <p key={s}>{s}</p>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4 animate-pulse">Hot off the press…</p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-8 text-center">
        <div>
          <p className="text-xs uppercase opacity-60">Started with</p>
          <p className="text-2xl font-bold">{formatPounds(startingPot)}</p>
        </div>
        <div>
          <p className="text-xs uppercase opacity-60">Finished with</p>
          <p className={`text-2xl font-bold ${finalPot >= startingPot ? "text-teal-500" : "text-red-500"}`}>{formatPounds(finalPot)}</p>
        </div>
        <div>
          <p className="text-xs uppercase opacity-60">Right calls</p>
          <p className="text-2xl font-bold">
            {summary.correct} / {summary.total}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase opacity-60">Register checks</p>
          <p className="text-2xl font-bold">{summary.registerChecks}</p>
        </div>
      </div>

      <ol className="flex flex-col gap-4">
        {rows.map(({ pitch, result, flagsCaught, flagsMissed }) => (
          <li key={pitch.id} className="rounded-xl border border-current/15 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-bold">
                {pitch.title}{" "}
                <span className={`ml-1 rounded px-2 py-0.5 text-xs ${pitch.kind === "scam" ? "bg-red-600 text-white" : "bg-teal-500 text-white"}`}>
                  {pitch.kind === "scam" ? "SCAM" : "GOOD ADVICE"}
                </span>
              </h3>
              <p className="text-sm">
                You stamped <b>{result.decision}</b> {result.correct ? "✅" : "❌"} · {formatDelta(result.delta)}
                {result.registerChecked && " · checked the register"}
                {result.lifelineUsed && " · called PlannerPal"}
              </p>
            </div>
            {pitch.kind === "scam" ? (
              <ul className="mt-2 space-y-1 text-sm">
                {[...flagsCaught.map((f) => ({ f, caught: true })), ...flagsMissed.map((f) => ({ f, caught: false }))].map(({ f, caught }) => (
                  <li key={f.id}>
                    {caught ? "🚩 Spotted:" : "🙈 Missed:"} <b>{f.label}</b>. {f.why}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {pitch.whyItHoldsUp.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      <button onClick={onPlayAgain} className="self-center rounded-full bg-amber-400 px-8 py-4 font-bold text-black hover:bg-amber-300">
        Play again
      </button>
    </section>
  );
}
