import type { PitchBrief, RegisterEntry, RegisterResult } from "../types";
import { PITCHES } from "./pitches";
import { REGISTER } from "./register";
import { MIN_PER_KIND, PITCHES_PER_NIGHT } from "./scoring";

/** What the register says about the firm a pitch claims. The register is the truth. */
export function lookUp(brief: PitchBrief, register: RegisterEntry[] = REGISTER): RegisterResult {
  if (!brief.firm.frn) return "none_given";
  const entry = register.find((e) => e.frn === brief.firm.frn);
  if (!entry) return "not_listed";
  const same = entry.phone === brief.firm.phone && entry.website === brief.firm.website;
  return same ? "match" : "clone";
}

/** Returns a list of problems with the content. Empty means the deck is consistent. */
export function validateContent(pitches = PITCHES, register = REGISTER): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const p of pitches) {
    if (ids.has(p.id)) problems.push(`Duplicate pitch id ${p.id}`);
    ids.add(p.id);
    const actual = lookUp(p, register);
    if (actual !== p.registerResult) problems.push(`${p.id}: registerResult says ${p.registerResult} but the register gives ${actual}`);
    if (p.kind === "legit") {
      if (p.registerResult !== "match") problems.push(`${p.id}: legit pitches must match the register`);
      if (p.signDelta <= 0) problems.push(`${p.id}: legit signDelta should be positive`);
      if (p.redFlags.length) problems.push(`${p.id}: legit pitches have no red flags`);
      if (p.pressureLine) problems.push(`${p.id}: legit pitches never pressure`);
    } else {
      if (p.registerResult === "match") problems.push(`${p.id}: scams must not match the register`);
      if (p.signDelta >= 0) problems.push(`${p.id}: scam signDelta should be negative`);
      if (p.redFlags.length < 2) problems.push(`${p.id}: scams need at least two red flags`);
    }
  }
  for (const kind of ["legit", "scam"] as const) {
    const n = pitches.filter((p) => p.kind === kind).length;
    if (n < MIN_PER_KIND) problems.push(`Need at least ${MIN_PER_KIND} ${kind} pitches, have ${n}`);
  }
  if (pitches.length < PITCHES_PER_NIGHT) problems.push(`Deck has fewer than ${PITCHES_PER_NIGHT} pitches`);
  return problems;
}
