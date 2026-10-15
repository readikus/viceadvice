import Image from "next/image";
import { ASSETS } from "@/game/assets";
import type { SituationCardProps } from "@/game/ui-props";
import { formatPounds } from "./format";
import { Stage } from "./Stage";

export function SituationCard({ situation, variant, onContinue }: SituationCardProps) {
  if (variant === "compact") {
    return (
      <div className="rounded-[0.6cqw] bg-paper px-[1.3cqw] py-[1cqw] text-ink shadow-xl">
        <p className="border-b-[0.12cqw] border-ink/70 pb-[0.4cqw] font-display text-[1.55cqw] font-bold uppercase">Your situation</p>
        <ul className="mt-[0.5cqw] space-y-[0.15cqw] text-[1.2cqw] leading-snug">
          <li>Age {situation.age}</li>
          <li>3 pension pots · {formatPounds(situation.startingPot)}</li>
          {situation.facts.map((f) => (
            <li key={f} className="text-[1cqw] text-ink/75">
              {f}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <Stage background={ASSETS.office.path} dim>
      <div className="absolute top-[8%] right-[3%] aspect-square w-[44%]">
        <Image src={ASSETS.kennyPortrait.path} alt="Kenny Valentine" fill sizes="44vw" className="object-contain drop-shadow-2xl" />
      </div>
      <section className="absolute top-[14%] left-[7%] flex w-[44%] flex-col gap-[1.4cqw] rounded-[1cqw] bg-paper p-[2.5cqw] text-ink shadow-2xl">
        <p className="font-display text-[1.2cqw] font-bold tracking-[0.3em] text-magenta uppercase">Your situation</p>
        <h2 className="font-display text-[2.6cqw] leading-tight font-bold">{situation.headline}</h2>
        <ul className="list-disc space-y-[0.3cqw] pl-[1.6cqw] text-[1.35cqw]">
          {situation.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <p className="text-[1.2cqw] leading-snug text-ink/80">
          Kenny has five pitches for you tonight. For each one, stamp <b>SIGN</b>, <b>WALK</b> or <b>REPORT</b>. Check
          his firm number in the register, and call PlannerPal if you need a second opinion.
        </p>
        {onContinue && (
          <button
            onClick={onContinue}
            className="self-start rounded-full bg-ink px-[2.4cqw] py-[1cqw] font-display text-[1.5cqw] font-bold tracking-widest text-teal uppercase hover:bg-purple"
          >
            Sit down with Kenny
          </button>
        )}
      </section>
    </Stage>
  );
}
