import { ADVISOR_INSTRUCTIONS } from "@/lib/persona";

// Mints a short-lived Realtime client secret so the browser never sees OPENAI_API_KEY.
export async function POST() {
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
        instructions: ADVISOR_INSTRUCTIONS,
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
