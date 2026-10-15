# Vice Advice: product decisions

This is the single source of truth for what the game is. If you're changing behaviour, tone or tech, update this file in the same PR. People and AI agents both read it before making changes.

Owners: Ian (`readikus`), Tom (`hellocrossmanwild`).

## The pitch

A speech-based web game. You phone **Kenny Valentine**, a relentlessly bullish "wealth guru", and talk to him out loud. He gives terrible financial advice with total confidence and keeps leading you on. The comedy is in how bad, and how persuasive, he is.

## Decisions

| # | Decision | Date | By |
|---|----------|------|----|
| 1 | It's a web app, played by voice: speaking and listening, not typing. | 2026-10-15 | Ian |
| 2 | There's no login, accounts or saved state. You open the page and play. | 2026-10-15 | Ian |
| 3 | The advisor is called **Kenny Valentine** (previously "Vince"). | 2026-10-15 | Tom |
| 4 | Kenny is bullish and leads the player on: flattery, fake urgency, escalating schemes, everything tied back to their dream retirement. | 2026-10-15 | Ian |
| 5 | Kenny opens the call and asks what the player's dream retirement looks like. | 2026-10-15 | Ian |
| 6 | Voice dialogue uses OpenAI Realtime (`gpt-realtime`) over WebRTC, straight from the browser. | 2026-10-15 | Ian |
| 7 | The OpenAI API key stays on the server. The browser only gets a short-lived session key from `/api/session`. | 2026-10-15 | Ian |

## Kenny Valentine: the character

- **Voice:** smug, charismatic and theatrical. He talks in short, punchy spoken turns of one to three sentences.
- **Moves:** he flatters the player, invents urgency ("the window is closing"), raises the stakes whenever they hesitate, and never admits he's wrong.
- **Advice:** absurd and obviously wrong, like the pension on a horse called Lucky Steve or a timeshare on the moon.
- **Lore:** a "guy in Monaco", imaginary yachts, and three failed crypto exchanges he insists were "ahead of their time".
- The prompt lives in `src/lib/persona.ts`.

## Guardrails

These stay in place whatever the tone:

- Kenny never asks for real personal or banking details.
- Kenny never names or pushes a real product, stock or scheme.
- He stays cartoonish, so nobody could mistake it for real advice. The header says "Not financial advice. Obviously."

## Tech

- **Framework:** Next.js 16 (App Router), TypeScript and Tailwind.
- **Speech:** `src/lib/useRealtimeDialogue.ts` handles the mic, Kenny's audio and the live transcript.
- **Models:** they're set in `.env.local` and default to `gpt-realtime` with the `cedar` voice.

## Paused / parked

- **Dream images:** an AI-generated picture of the player's dream retirement, such as a chalet in the Alps. `/api/dream` works using `gpt-image-2` and takes about 30 seconds per image. Kenny can't trigger it yet, and nothing in the UI shows it. It was paused on 2026-10-15.

## Open questions

- How does a round end? Is there a score, a "you got scammed" meter or a win state?
- Is it one call per game, or several calls that escalate?
- Is "Kenny Valentine" OK to use? It's also the name of a Fast Show character.
- Which browsers and phones have we actually tested a full call on?
