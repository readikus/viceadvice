# Vice Advice

A speech-based web game for PlannerPal. You're the client; across the desk sits Kenny Valentine, Miami 1986, the most charming financial adviser you'll ever meet. Some of his pitches are scams and some are genuinely good advice, and he sounds exactly as sleazy either way. Judge the advice, not the suit.

See `docs/PLAN.md` for the build plan and who owns what.

Built with Next.js and the OpenAI Realtime API (speech-to-speech over WebRTC).

## Run locally

```bash
npm install
nvm use            # Node 22; Next 16 needs Node 20.9+
cp .env.example .env.local   # then add OPENAI_API_KEY and ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000, click **Call Kenny Valentine**, allow the microphone and start talking.

## How it works

- `src/app/api/session/route.ts` uses your server-side `OPENAI_API_KEY` to mint a short-lived Realtime client secret. The browser never sees the real key.
- `src/lib/realtime/useKennyVoice.ts` opens one WebRTC connection to OpenAI per pitch. Hold SPACE (or the talk button) to talk; releasing it hands the turn to Kenny. It plays his voice, measures its level for the lip-sync and builds the transcript.
- `src/game/engine/` runs the night: dealing, the register, the reducer and scoring. `npm test` runs its unit tests.
- `/api/plannerpal` and `/api/frontpage` use Claude (`ANTHROPIC_API_KEY`). Without a key they fall back to fixed text, so the game still plays.
- `src/components/scene/` draws the game on a 16:9 stage from the art in `public/assets/` (listed in `src/game/assets.ts`). Kenny's lip-sync uses the 3x4 sprite sheet: mouth columns, expression rows.
- `src/lib/persona.ts` builds Kenny's prompt for one pitch from its brief in `src/game/content/pitches.ts`.
- The truth of each pitch, the register and the scoring live in `src/game/`, never in the AI.
