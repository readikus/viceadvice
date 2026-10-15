# VICE ADVICE: build plan

How we get from the scaffold to the spec. Three streams work in parallel on top of
one foundation PR, then an integration PR joins them up.

## The rules every stream follows

- **Contracts live in `src/game/`.** `types.ts`, `ui-props.ts` and `assets.ts` are shared.
  Don't change them inside a feature PR. If one needs to change, open a tiny PR for it
  and tell the other streams.
- **The truth is code.** Legit or scam, the register and the score are never decided by AI.
  The browser only ever sends a pitch id; Kenny's brief is built on the server.
- **Stay in your lane.** Each stream owns its files (below). Touching another stream's
  files means a merge conflict later.
- **Small PRs into `main`.** Each numbered item below is one PR. Rebase on `main` often.
- **Node 22.** Next 16 needs Node 20.9 or later. See `.nvmrc`.

## Voice decision

We stay on OpenAI Realtime, not ElevenLabs. It already works in the scaffold, takes a
per-session prompt, and supports function calls for the brochure. The PlannerPal and
front-page routes use Claude through the Anthropic SDK, as the spec says.

## PR 0: Foundation (this PR)

- Kenny replaces Vince. His prompt is built per pitch from a brief (`src/lib/persona.ts`).
- `/api/session` takes `{ pitchId }` and builds Kenny's instructions server-side.
- Shared contracts: `src/game/types.ts`, `src/game/ui-props.ts`, `src/game/assets.ts`.
- Draft content: eight pitch briefs, the fictional register, the situation card,
  the scoring table, and a validator that checks the deck against the register.

## Stream A: Realtime and chat

Owns: `src/lib/realtime/`, `src/app/api/`, `src/lib/persona.ts`.

1. **A1 Push-to-talk, one session per pitch.** A `useKennyVoice()` hook that implements
   the `KennyVoice` contract. Turn detection off; hold to talk, release to commit the
   audio and ask for a reply. `startPitch(id)` closes any old session and opens a fresh
   one. Transcript lines carry timestamps. Target: Kenny speaking within 1.5 seconds of release.
2. **A2 Brochure tool and voice level.** A `show_brochure` function tool that Kenny calls
   when he slides paperwork over, surfaced through `onEvent`. `getKennyLevel()` reads
   Kenny's output volume through an analyser node, for the lip-sync.
3. **A3 PlannerPal lifeline.** `POST /api/plannerpal` with Claude. Reads the last 60 seconds
   of transcript and the pitch's red flags from the server-side deck, and replies in two
   short lines. Never says outright "it's a scam"; it points at what to check.
4. **A4 Front page.** `POST /api/frontpage` with Claude. Writes the headline and a
   three-line story from the night's results. The ending (yacht or bedsit) is decided in
   code from the final pot, not by the model.
5. **A5 Kenny tuning.** Playtest the prompt so he's hard to read in both modes.
6. **Fallback (only if the voice fights us):** typed chat with Kenny's reply spoken aloud.

## Stream B: Graphics

Owns: `src/components/scene/`, `public/assets/`, `src/app/globals.css`, `src/app/layout.tsx`,
`src/app/dev/`.

1. **B1 Look and feel.** Palette tokens, neon title font (Monoton or Yellowtail), a chunky
   condensed sans for UI, and a full-bleed 16:9 stage that scales to the screen.
2. **B2 Placeholder art.** Generated placeholders at every path and size in `assets.ts`,
   so Adam's art drops in as a file copy. A `/dev/gallery` page showing every asset and
   component.
3. **B3 Office scene components,** built to `ui-props.ts`: Kenny with the three-mouth
   lip-sync and mood frames, cash meter, register book, brochure, stamp bar, talk button,
   lifeline, situation card, pitch timer, transcript drawer.
4. **B4 Splash, debrief and front page.**
5. **B5 Ambience.** Cigar smoke loop, blinking neon sign, venetian-blind shadows.
6. **B6 Real art swap** when Adam delivers.

## Stream C: Game engine

Owns: `src/game/engine/`, `src/components/Game.tsx`, `src/app/page.tsx`, tests.

1. **C1 Engine core.** Pure functions with unit tests (add Vitest): deal five from eight with
   at least two of each kind, register lookup, the night reducer (phases, pot, results,
   lifelines, lookups), and scoring from `content/scoring.ts`. Run `validateContent()` in a test.
2. **C2 `useNight()` hook.** Wraps the reducer, runs the two-minute pitch timer, and
   applies the timeout decision.
3. **C3 The night loop on plain boxes.** Rewrite `Game.tsx` to run splash, situation, five
   pitches and debrief, using `KennyVoice` and rendering components through the
   `ui-props.ts` shapes. Use simple placeholder boxes until Stream B's components land.
4. **C4 Debrief data.** Red flags caught and missed per pitch, register checks and
   lifelines used.
5. **C5 Leaderboard** (optional, only if the offsite wants it).

## Integration PR

Swap C's placeholder boxes for B's components, connect A's hook for real, then play it
through twice and tune. This is the 50-minute checkpoint in the spec.

## Screen layout

```
+------------------------------------------------------------+
| SITUATION (compact)        CASH METER          TIMER       |
|                                                            |
|  REGISTER BOOK            KENNY (lip-sync)       BROCHURE  |
|  (flip open, type FRN)    behind the desk        (slides in)|
|                                                            |
|  LIFELINE (2 left)     [ HOLD SPACE TO TALK ]              |
|                     SIGN     WALK     REPORT               |
+------------------------------------------------------------+
                  transcript drawer (toggle)
```

## Open items for people, not code

- An OpenAI key with Realtime access, and an Anthropic key. Both go in Vercel env vars.
- Adam's art at the sizes in `assets.ts`.
- A compliance sense-check of the four legit pitches and the red-flag wording.
- Confirm none of the fictional firm numbers, names or websites belong to real firms.
- Sign-off on the three scoring values the spec didn't set (see `content/scoring.ts`).
- A headset, a mic-permission test on the deployed site, and a recorded backup run.
