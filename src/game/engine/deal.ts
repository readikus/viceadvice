import type { PitchBrief } from "../types";
import { MIN_PER_KIND, PITCHES_PER_NIGHT } from "../content/scoring";

export type Rng = () => number;

function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Deals tonight's pitches: PITCHES_PER_NIGHT from the deck, with at least
 * MIN_PER_KIND of each kind, in a random order.
 */
export function dealNight(deck: PitchBrief[], rng: Rng = Math.random): PitchBrief[] {
  const legit = shuffle(
    deck.filter((p) => p.kind === "legit"),
    rng,
  );
  const scams = shuffle(
    deck.filter((p) => p.kind === "scam"),
    rng,
  );
  if (legit.length < MIN_PER_KIND || scams.length < MIN_PER_KIND) {
    throw new Error(`The deck needs at least ${MIN_PER_KIND} pitches of each kind.`);
  }

  const picked = [...legit.splice(0, MIN_PER_KIND), ...scams.splice(0, MIN_PER_KIND)];
  const rest = shuffle([...legit, ...scams], rng);
  picked.push(...rest.slice(0, PITCHES_PER_NIGHT - picked.length));
  return shuffle(picked, rng);
}
