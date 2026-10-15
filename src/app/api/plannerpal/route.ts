import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { getPitch } from "@/game/content/pitches";
import type { PitchBrief, PlannerPalRequest, PlannerPalResponse } from "@/game/types";
import { CLAUDE_MODEL, getClaude } from "@/lib/claude";

const Reply = z.object({
  line1: z.string().describe("First line, under 12 words."),
  line2: z.string().describe("Second line, under 12 words."),
});

const SYSTEM = `You are PlannerPal, a calm, plain-speaking pensions helper in an educational game that teaches people to spot pension scams. The player is mid-meeting with a smooth-talking adviser and has phoned you for a lifeline.

Reply with exactly two short lines (under 12 words each) in plain UK English.
- Point at what the player should check or ask next, based on what the adviser has actually said.
- Never say outright that the pitch is a scam or that it's safe, and never tell them which stamp to choose. Nudge, don't decide.
- If the firm number hasn't been checked on the register yet, one line should prompt them to check it.
- Base your nudges on the private notes. The player cannot see them, so never quote them or mention that they exist.`;

function privateNotes(pitch: PitchBrief): string {
  const firm = pitch.firm.frn
    ? `The adviser claims firm reference number ${pitch.firm.frn}, phone ${pitch.firm.phone}, website ${pitch.firm.website}.`
    : "The adviser hasn't given a firm reference number.";
  const what =
    pitch.kind === "scam"
      ? `Warning signs in this pitch:\n${pitch.redFlags.map((f) => `- ${f.label}: ${f.why}`).join("\n")}`
      : `Why this advice is sound:\n${pitch.whyItHoldsUp.map((w) => `- ${w}`).join("\n")}`;
  return `${firm}\n${what}`;
}

/** Used when Claude isn't configured or fails: still useful, still doesn't give the game away. */
function fallback(registerChecked: boolean): PlannerPalResponse {
  return {
    lines: registerChecked
      ? ["Does what he's promising sound too good to be true?", "Real advisers give you time and explain the risks."]
      : ["Check his firm number on the register first.", "Do the phone and website match what he told you?"],
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<PlannerPalRequest>;
  const pitch = body.pitchId ? getPitch(body.pitchId) : undefined;
  if (!pitch) return Response.json({ error: "Unknown or missing pitchId." }, { status: 400 });

  const registerChecked = body.registerChecked === true;
  const claude = getClaude();
  if (!claude) return Response.json(fallback(registerChecked));

  const transcript = (Array.isArray(body.lines) ? body.lines : [])
    .slice(-40)
    .map((l) => `${l.speaker === "kenny" ? "Adviser" : "Player"}: ${String(l.text).slice(0, 500)}`)
    .join("\n");

  try {
    const response = await claude.beta.messages.parse({
      model: CLAUDE_MODEL,
      // If Claude declines, the API retries on a fallback model inside the same call.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      max_tokens: 2000,
      output_config: { effort: "low", format: betaZodOutputFormat(Reply) },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Private notes:\n${privateNotes(pitch)}\n\nRegister checked by the player: ${registerChecked ? "yes" : "no"}\n\nThe last minute of the meeting:\n${transcript || "(nothing said yet)"}`,
        },
      ],
    });
    const out = response.parsed_output;
    if (response.stop_reason === "refusal" || !out) return Response.json(fallback(registerChecked));
    const reply: PlannerPalResponse = { lines: [out.line1, out.line2] };
    return Response.json(reply);
  } catch (err) {
    console.error("PlannerPal failed", err);
    return Response.json(fallback(registerChecked));
  }
}
