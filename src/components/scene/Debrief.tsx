import Image from "next/image";
import { ASSETS } from "@/game/assets";
import { buildDebrief, summariseNight } from "@/game/engine/ending";
import type { DebriefProps } from "@/game/ui-props";
import { formatDelta, formatPounds } from "./format";
import { Wordmark } from "./Stage";

const CAPTION = {
  yacht: "Our reader, pictured on the deck of their new yacht.",
  comfortable: "Our reader's conservatory, where they plan to spend a long, quiet retirement.",
  bedsit: "Our reader's new bedsit. The heater has two bars; only one works.",
} as const;

export function Debrief({ frontPage, startingPot, finalPot, results, pitches, onPlayAgain }: DebriefProps) {
  const rows = buildDebrief(pitches, results);
  const summary = summariseNight(results);
  const ending = frontPage?.ending;

  return (
    <div className="min-h-dvh w-full bg-background px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        {/* The front page. */}
        <article className="rotate-[-0.6deg] bg-paper px-6 py-6 text-ink shadow-2xl sm:px-10">
          <header className="flex items-end justify-between border-b-4 border-double border-ink pb-2">
            <p className="font-display text-xs tracking-widest uppercase">Miami · Friday · 1986</p>
            <p className="font-display text-3xl font-bold tracking-tight uppercase sm:text-5xl">The Miami Ledger</p>
            <p className="font-display text-xs tracking-widest uppercase">25¢</p>
          </header>
          {frontPage && ending ? (
            <>
              <h1 className="mt-4 font-display text-4xl leading-none font-bold uppercase sm:text-6xl">{frontPage.headline}</h1>
              <div className="mt-5 grid gap-6 md:grid-cols-[3fr_2fr]">
                <figure>
                  <div className="relative aspect-video w-full overflow-hidden border-2 border-ink">
                    <Image src={ASSETS.endings[ending].path} alt="" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover sepia-[0.25]" />
                  </div>
                  <figcaption className="mt-1 text-xs italic">{CAPTION[ending]}</figcaption>
                </figure>
                <div className="space-y-3 font-serif text-lg leading-snug">
                  {frontPage.story.map((s, i) => (
                    <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-1 first-letter:font-display first-letter:text-5xl first-letter:leading-none" : ""}>
                      {s}
                    </p>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="py-24 text-center font-display text-2xl uppercase animate-pulse">Hot off the press…</p>
          )}
        </article>

        {/* The scores. */}
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          {[
            ["Started with", formatPounds(startingPot), "text-paper"],
            ["Finished with", formatPounds(finalPot), finalPot >= startingPot ? "text-teal" : "text-magenta"],
            ["Right calls", `${summary.correct} / ${summary.total}`, "text-orange"],
            ["Register checks", String(summary.registerChecks), "text-paper"],
          ].map(([label, value, color]) => (
            <div key={label} className="rounded-xl border border-paper/15 bg-purple/60 p-4">
              <p className="font-display text-xs tracking-widest text-paper/70 uppercase">{label}</p>
              <p className={`font-display text-3xl font-bold neon-text ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Pitch by pitch. */}
        <ol className="flex flex-col gap-4">
          {rows.map(({ pitch, result, flagsCaught, flagsMissed }) => (
            <li key={pitch.id} className="rounded-xl border border-paper/15 bg-purple/50 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-xl font-bold uppercase">
                  {pitch.title}{" "}
                  <span className={`ml-1 rounded px-2 py-0.5 align-middle text-xs ${pitch.kind === "scam" ? "bg-magenta text-ink" : "bg-teal text-ink"}`}>
                    {pitch.kind === "scam" ? "Scam" : "Good advice"}
                  </span>
                </h3>
                <p className="text-sm text-paper/85">
                  You stamped <b>{result.decision}</b> {result.correct ? "✅" : "❌"} · {formatDelta(result.delta)}
                  {result.registerChecked && " · checked the register"}
                  {result.lifelineUsed && " · called PlannerPal"}
                </p>
              </div>
              {pitch.kind === "scam" ? (
                <ul className="mt-3 space-y-1 text-sm">
                  {[...flagsCaught.map((f) => ({ f, caught: true })), ...flagsMissed.map((f) => ({ f, caught: false }))].map(({ f, caught }) => (
                    <li key={f.id}>
                      {caught ? "🚩 Spotted:" : "🙈 Missed:"} <b>{f.label}</b>. {f.why}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                  {pitch.whyItHoldsUp.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>

        <div className="flex flex-col items-center gap-3 pb-6">
          <Wordmark className="text-5xl" />
          <button
            onClick={onPlayAgain}
            className="rounded-full border-2 border-teal bg-ink px-8 py-3 font-display text-xl font-bold tracking-widest text-teal uppercase neon-box hover:bg-teal hover:text-ink"
          >
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}
