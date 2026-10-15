"use client";

import Image from "next/image";
import { useState } from "react";
import { ASSETS } from "@/game/assets";
import type { RegisterBookProps } from "@/game/ui-props";

/** The register binder on Kenny's desk. Click it to open the book and look up a firm number. */
export function RegisterBook({ open, onToggle, onLookup, result, lastQuery }: RegisterBookProps) {
  const [frn, setFrn] = useState("");
  const { width, height } = ASSETS.props.register;
  return (
    <div className="relative h-full w-full">
      <button onClick={onToggle} aria-expanded={open} className="group relative block w-full transition-transform hover:-translate-y-[0.3cqw]">
        <Image src={ASSETS.props.register.path} alt="" width={width} height={height} className="h-auto w-full drop-shadow-xl" />
        {/* Engraved on the gold plate. */}
        <span className="absolute top-[68%] left-[61%] -translate-x-1/2 -translate-y-1/2 -rotate-[2deg] font-display text-[0.8cqw] font-bold tracking-wider whitespace-nowrap text-ink/85 uppercase group-hover:text-magenta">
          Check register
        </span>
      </button>

      {open && (
        <div className="absolute bottom-[105%] left-0 z-30 w-[24cqw] rounded-[0.8cqw] border-[0.25cqw] border-[#3a2a1a] bg-paper p-[1.2cqw] text-ink shadow-2xl">
          <div className="flex items-baseline justify-between border-b-[0.12cqw] border-ink/60 pb-[0.4cqw]">
            <p className="font-display text-[1.4cqw] font-bold uppercase">FCA register</p>
            <button onClick={onToggle} className="text-[1cqw] text-ink/60 hover:text-ink" aria-label="Close the register">
              Close ✕
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (frn.trim()) onLookup(frn);
            }}
            className="mt-[0.8cqw] flex gap-[0.5cqw]"
          >
            <input
              value={frn}
              onChange={(e) => setFrn(e.target.value)}
              inputMode="numeric"
              autoFocus
              placeholder="Firm reference number"
              className="min-w-0 flex-1 rounded-[0.4cqw] border-[0.12cqw] border-ink/30 bg-white/70 px-[0.6cqw] py-[0.3cqw] text-[1.15cqw]"
            />
            <button className="rounded-[0.4cqw] bg-ink px-[0.9cqw] font-display text-[1.05cqw] font-bold tracking-wide text-paper uppercase hover:bg-purple">
              Look up
            </button>
          </form>
          {result === "not_found" && (
            <p className="mt-[0.8cqw] text-[1.1cqw] font-semibold text-[#c0123f]">No firm numbered {lastQuery} is on the register.</p>
          )}
          {result && result !== "not_found" && (
            <dl className="mt-[0.8cqw] grid grid-cols-[auto_1fr] gap-x-[0.8cqw] gap-y-[0.2cqw] text-[1.02cqw]">
              <dt className="text-ink/60">Firm</dt>
              <dd className="font-bold">{result.name}</dd>
              <dt className="text-ink/60">Number</dt>
              <dd>{result.frn}</dd>
              <dt className="text-ink/60">Status</dt>
              <dd className={result.status === "Authorised" ? "" : "font-bold text-[#c0123f]"}>{result.status}</dd>
              <dt className="text-ink/60">Phone</dt>
              <dd>{result.phone}</dd>
              <dt className="text-ink/60">Website</dt>
              <dd className="break-all">{result.website}</dd>
              <dt className="text-ink/60">Address</dt>
              <dd>{result.address}</dd>
              {result.warning && <dd className="col-span-2 mt-[0.3cqw] font-bold text-[#c0123f]">⚠ {result.warning}</dd>}
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
