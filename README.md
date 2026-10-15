# Vice Advice

A speech-based web game: call Vince, a supremely confident "wealth guru", and talk to him out loud. His financial advice is terrible.

Built with Next.js and the OpenAI Realtime API (speech-to-speech over WebRTC).

## Run locally

```bash
npm install
cp .env.example .env.local   # then add your OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000, click **Call Vince**, allow the microphone and start talking.

## How it works

- `src/app/api/session/route.ts` uses your server-side `OPENAI_API_KEY` to mint a short-lived Realtime client secret. The browser never sees the real key.
- `src/lib/useRealtimeDialogue.ts` opens a WebRTC connection straight to OpenAI. It sends your mic audio, plays Vince's voice and builds the transcript from data-channel events.
- `src/lib/persona.ts` holds Vince's character prompt. Tweak it to change the game.
