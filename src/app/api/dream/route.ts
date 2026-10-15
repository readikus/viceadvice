// Paints the player's dream retirement as a glossy "brochure" image.
export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OPENAI_API_KEY is not set." }, { status: 500 });
  }

  const { scene } = (await request.json().catch(() => ({}))) as { scene?: unknown };
  if (typeof scene !== "string" || !scene.trim()) {
    return Response.json({ error: "Missing scene" }, { status: 400 });
  }

  const prompt = [
    "A glossy, aspirational luxury retirement brochure photograph.",
    `Scene: ${scene.trim().slice(0, 500)}.`,
    "Golden-hour light, cinematic, slightly too perfect to be true, rich saturated colours.",
    "No text, no logos, no watermarks.",
  ].join(" ");

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2",
      prompt,
      size: "1536x1024",
      quality: "medium",
      n: 1,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return Response.json(
      { error: data?.error?.message ?? "Image generation failed" },
      { status: res.status },
    );
  }

  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) return Response.json({ error: "No image returned" }, { status: 502 });

  return Response.json({ image: `data:image/png;base64,${b64}` });
}
