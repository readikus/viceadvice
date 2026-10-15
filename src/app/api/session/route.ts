import { getPitch } from "@/game/content/pitches";
import type { SessionRequest } from "@/game/types";
import { buildKennyInstructions } from "@/lib/persona";

// Mints a short-lived Realtime client secret for one pitch, so the browser never sees
// OPENAI_API_KEY. The page sends only a pitch id; Kenny's brief, including whether the
// pitch is a scam, is looked up and built into his instructions here on the server.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<SessionRequest>;
  const pitch = body.pitchId ? getPitch(body.pitchId) : undefined;
  if (!pitch) {
    return Response.json({ error: "Unknown or missing pitchId." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY is not set. Add it to .env.local." },
      { status: 500 },
    );
  }

  const res = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime",
        instructions: buildKennyInstructions(pitch),
        audio: {
          input: {
            transcription: { model: "gpt-4o-mini-transcribe" },
            turn_detection: { type: "server_vad" },
          },
          output: { voice: process.env.OPENAI_REALTIME_VOICE ?? "cedar" },
        },
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return Response.json(
      { error: data?.error?.message ?? "Failed to create realtime session" },
      { status: res.status },
    );
  }

  return Response.json({ clientSecret: data.value, expiresAt: data.expires_at });
}
