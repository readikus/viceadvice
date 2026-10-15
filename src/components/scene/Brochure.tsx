"use client";

import Image from "next/image";
import { useState } from "react";
import { ASSETS } from "@/game/assets";
import type { BrochureId } from "@/game/types";
import type { BrochureProps } from "@/game/ui-props";

const HEADING: Record<BrochureId, string> = {
  fund: "Investment opportunity",
  "vip-club": "You are invited",
  "pension-transfer": "Transfer form",
  statement: "Pension review",
};

/** Kenny's paperwork, slid across the desk. Click to read it up close. */
export function Brochure({ brochure, pitch, onDismiss }: BrochureProps) {
  const [zoomed, setZoomed] = useState(false);
  if (!brochure || !pitch) return null;
  const asset = ASSETS.brochures[brochure];
  const firm = pitch.firm;
  const rows: [string, string][] = [
    ...(pitch.brochureFacts ?? []),
    ["Firm", firm.name],
    ["FCA number", firm.frn ?? "Applied for"],
    ["Phone", firm.phone],
    ["Web", firm.website],
  ];

  const paper = (
    <div className="relative aspect-[3/4] w-full text-ink">
      <Image src={asset.path} alt="" fill sizes="30vw" className="object-cover shadow-2xl" />
      {/* A clean printed panel over the template's empty boxes. */}
      <div className="absolute inset-x-[6%] top-[31%] bottom-[5%] flex flex-col gap-[3%] overflow-hidden rounded-[0.3em] bg-paper px-[5%] py-[4%] shadow-[0_0_0_0.08em_rgba(29,16,48,0.25)]">
        <p className="text-center font-display text-[0.7em] font-bold tracking-[0.2em] text-magenta uppercase">{HEADING[brochure]}</p>
        <p className="text-center font-display text-[1.25em] leading-tight font-bold uppercase">{pitch.title}</p>
        <dl className="mt-[2%] flex flex-col gap-[0.25em] text-[0.62em] leading-tight">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-[0.6em] border-b border-ink/25 pb-[0.15em]">
              <dt className="shrink-0 text-ink/70">{label}</dt>
              <dd className="text-right font-semibold break-all">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );

  return (
    <>
      <button
        key={brochure}
        onClick={() => setZoomed(true)}
        className="block w-full rotate-[3deg] text-[1.1cqw] [animation:slide-in_0.6s_ease-out] hover:scale-[1.03]"
        title="Read it up close"
      >
        {paper}
      </button>
      {zoomed && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60" onClick={() => setZoomed(false)}>
          <div className="w-[30cqw] text-[1.94cqw]" onClick={(e) => e.stopPropagation()}>
            {paper}
            <div className="mt-[1cqw] flex justify-center gap-[1cqw] text-[1.1cqw]">
              <button onClick={() => setZoomed(false)} className="rounded-full bg-paper px-[1.5cqw] py-[0.5cqw] font-display font-bold text-ink uppercase">
                Back to the desk
              </button>
              <button
                onClick={() => {
                  setZoomed(false);
                  onDismiss();
                }}
                className="rounded-full border border-paper/60 px-[1.5cqw] py-[0.5cqw] font-display font-bold text-paper uppercase"
              >
                Push it back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
