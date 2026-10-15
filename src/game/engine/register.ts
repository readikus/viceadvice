import type { RegisterEntry } from "../types";
import { REGISTER } from "../content/register";

/** Strips spaces and anything that isn't a digit, so "614 207" finds "614207". */
export function normaliseFrn(input: string): string {
  return input.replace(/\D/g, "");
}

/** What the register book shows when the player types a firm reference number. */
export function lookupFrn(
  input: string,
  register: RegisterEntry[] = REGISTER,
): RegisterEntry | "not_found" {
  const frn = normaliseFrn(input);
  return register.find((e) => e.frn === frn) ?? "not_found";
}
