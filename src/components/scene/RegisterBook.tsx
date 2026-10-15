"use client";

import { useState } from "react";
import type { RegisterBookProps } from "@/game/ui-props";

export function RegisterBook({ open, onToggle, onLookup, result, lastQuery }: RegisterBookProps) {
  const [frn, setFrn] = useState("");
  return (
    <div className="rounded-xl border border-current/15 p-3">
      <button onClick={onToggle} className="w-full text-left text-sm font-semibold">
        📕 FCA register {open ? "▾" : "▸"}
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (frn.trim()) onLookup(frn);
            }}
            className="flex gap-2"
          >
            <input
              value={frn}
              onChange={(e) => setFrn(e.target.value)}
              inputMode="numeric"
              placeholder="Firm number"
              className="w-full min-w-0 rounded-lg border border-current/20 bg-transparent px-2 py-1 text-sm"
            />
            <button className="rounded-lg bg-foreground/10 px-3 py-1 text-sm font-semibold hover:bg-foreground/20">Look up</button>
          </form>
          {result === "not_found" && (
            <p className="text-sm text-red-500">No firm with number {lastQuery} on the register.</p>
          )}
          {result && result !== "not_found" && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs">
              <dt className="opacity-60">Firm</dt>
              <dd className="font-semibold">{result.name}</dd>
              <dt className="opacity-60">Number</dt>
              <dd>{result.frn}</dd>
              <dt className="opacity-60">Status</dt>
              <dd className={result.status === "Authorised" ? "" : "text-red-500"}>{result.status}</dd>
              <dt className="opacity-60">Phone</dt>
              <dd>{result.phone}</dd>
              <dt className="opacity-60">Website</dt>
              <dd className="break-all">{result.website}</dd>
              <dt className="opacity-60">Address</dt>
              <dd>{result.address}</dd>
              {result.warning && <dd className="col-span-2 font-semibold text-red-500">{result.warning}</dd>}
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
