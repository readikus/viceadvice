# Vice Advice: product decisions

This is the single source of truth for what the game is. If you're changing behaviour, tone or tech, update this file in the same PR. People and AI agents both read it before making changes.

Owners: Ian (`readikus`), Tom (`hellocrossmanwild`).

## The pitch

A speech-based web game for PlannerPal that teaches people to spot pension scams. You're the client, 58 with £180,000 in three old pensions. Across the desk sits **Kenny Valentine**, Miami 1986, the most charming financial adviser you'll ever meet. Over one night he makes five pitches. Some are scams and some are genuinely good advice, and he sounds exactly as smooth either way. For each one you stamp SIGN, WALK or REPORT. Judge the advice, not the suit.

The build plan and who owns what is in [`docs/PLAN.md`](docs/PLAN.md).

## Decisions

| # | Decision | Date | By |
|---|----------|------|----|
| 1 | It's a web app, played by voice: speaking and listening, not typing. | 2026-10-15 | Ian |
| 2 | There's no login, accounts or saved state. You open the page and play. | 2026-10-15 | Ian |
| 3 | The advisor is called **Kenny Valentine** (previously "Vince"). | 2026-10-15 | Tom |
| 4 | ~~Kenny is bullish and leads the player on: flattery, fake urgency, escalating schemes, everything tied back to their dream retirement.~~ Superseded by 8. | 2026-10-15 | Ian |
| 5 | ~~Kenny opens the call and asks what the player's dream retirement looks like.~~ Superseded by 10. | 2026-10-15 | Ian |
| 6 | Voice dialogue uses OpenAI Realtime (`gpt-realtime`) over WebRTC, straight from the browser. | 2026-10-15 | Ian |
| 7 | The OpenAI API key stays on the server. The browser only gets a short-lived session key from `/api/session`. | 2026-10-15 | Ian |
| 8 | It's a scam-spotting game for PlannerPal. Some of Kenny's pitches are scams and some are sound advice, and his style never gives away which. | 2026-10-15 | Tom |
| 9 | The truth is code. Whether a pitch is a scam, the FCA register and the scoring live in `src/game/`, never in the AI. The browser only sends a pitch id; Kenny's brief is built on the server. | 2026-10-15 | Tom |
| 10 | One night is five pitches dealt from eight, at least two of each kind. Each pitch is a fresh voice session of about two minutes, and Kenny opens it with his hook. | 2026-10-15 | Tom |
| 11 | Push-to-talk: hold SPACE or the talk button to speak, release to hand over to Kenny. Talking over him cuts him off. | 2026-10-15 | Tom |
| 12 | The player can check Kenny's firm number in a fictional FCA register, and has two PlannerPal lifelines a night. | 2026-10-15 | Tom |
| 13 | The PlannerPal lifeline and the end-of-night front page are written by Claude (Anthropic API). The ending, yacht or bedsit, is decided in code: finish with at least the pot you started with and it's the yacht. | 2026-10-15 | Tom |

## Kenny Valentine: the character

- **Look:** white suit, pastel shirt, gold chain, a nightclub office with a speedboat in the harbour outside.
- **Voice:** warm, flattering and always selling. He calls you "my friend" or "amigo" and talks in short spoken turns of one to three sentences.
- **Moves:** when cornered he changes the subject, laughs, or gets wounded: "You don't trust Kenny?" He never gets angry.
- **Two modes, one style:** on a scam he uses the pressure line and never admits anything is wrong; on good advice he answers straight and never rushes you. He sounds equally sleazy in both.
- **Lore:** the club, the boat, his guy in the Caymans.
- His prompt is built per pitch in `src/lib/persona.ts` from the brief in `src/game/content/pitches.ts`.

## Guardrails

These stay in place whatever the tone:

- Kenny never asks for real personal or banking details.
- Kenny never names a real company, person or product. Every firm, number and website in the game is fictional; phone numbers use Ofcom's drama ranges.
- Kenny never gives real-world instructions for committing fraud, and his crimes are financial only.
- He never breaks character or confirms a pitch is a scam, even if asked directly.
- The legit pitches must be sense-checked by someone with compliance knowledge before the game is shown beyond the offsite.

## Tech

- **Framework:** Next.js 16 (App Router), TypeScript and Tailwind.
- **Speech:** `src/lib/realtime/useKennyVoice.ts` handles the mic, push-to-talk, Kenny's audio and lip-sync level, the live transcript and the `show_brochure` tool.
- **Game engine:** `src/game/engine/` holds the deal, register lookup, night reducer, scoring and debrief, with unit tests (`npm test`).
- **Models:** set in `.env.local`. Voice defaults to `gpt-realtime` with the `cedar` voice; PlannerPal and the front page default to `claude-opus-5-5`. Both Claude routes fall back to fixed text if `ANTHROPIC_API_KEY` is missing.

## Paused / parked

- **Dream images:** an AI-generated picture of the player's dream retirement, such as a chalet in the Alps. `/api/dream` works using `gpt-image-2` and takes about 30 seconds per image. Kenny can't trigger it yet, and nothing in the UI shows it. It was paused on 2026-10-15.

## Open questions

- Is "Kenny Valentine" OK to use? It's also the name of a Fast Show character.
- Sign-off on the three scoring values the spec didn't set (see `src/game/content/scoring.ts`), and on the yacht/bedsit threshold.
- Does Kenny paint the player's dream retirement (`/api/dream`) as part of a pitch?
- Which browsers and phones have we actually tested a full call on?
