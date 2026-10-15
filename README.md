# Vice Advice

A speech-based web game for PlannerPal. You're the client; across the desk sits Kenny Valentine, Miami 1986, the most charming financial adviser you'll ever meet. Some of his pitches are scams and some are genuinely good advice, and he sounds exactly as sleazy either way. Judge the advice, not the suit.

See `docs/PLAN.md` for the build plan and who owns what.

Built with Next.js and the OpenAI Realtime API (speech-to-speech over WebRTC).

## Run locally

```bash
npm install
nvm use            # Node 22; Next 16 needs Node 20.9+
cp .env.example .env.local   # then add your OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000, click **Call Kenny Valentine**, allow the microphone and start talking.

## How it works

- `src/app/api/session/route.ts` uses your server-side `OPENAI_API_KEY` to mint a short-lived Realtime client secret. The browser never sees the real key.
- `src/lib/useRealtimeDialogue.ts` opens a WebRTC connection straight to OpenAI. It sends your mic audio, plays Kenny's voice and builds the transcript from data-channel events.
- `src/lib/persona.ts` builds Kenny's prompt for one pitch from its brief in `src/game/content/pitches.ts`.
- The truth of each pitch, the register and the scoring live in `src/game/`, never in the AI.
