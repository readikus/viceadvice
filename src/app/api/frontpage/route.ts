import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { getPitch } from "@/game/content/pitches";
import { decideEnding, summariseNight, type Ending } from "@/game/engine/ending";
import type { FrontPageRequest, FrontPageResponse } from "@/game/types";
import { CLAUDE_MODEL, getClaude } from "@/lib/claude";

const Page = z.object({
  headline: z.string().describe("Tabloid headline, under 9 words."),
  story: z.array(z.string()).describe("Exactly three short sentences."),
});

const SYSTEM = `You write the front page of a 1986 Miami tabloid for the end of an educational game about spotting pension scams. The player spent the night across the desk from Kenny Valentine, a charming financial adviser whose pitches were sometimes scams and sometimes good advice.

Write a punchy headline and a three-sentence story about how the player's night went, in the voice of a cheeky 80s tabloid.
- The ending is already decided and given to you. Match it: "yacht" means they protected their pension and did well; "bedsit" means they lost money.
- Mention one or two specific pitches from the results by name.
- Keep it fun and kind to the player. No real people, firms or products.`;

const fmt = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;

function fallback(ending: Ending, finalPot: number, startingPot: number): FrontPageResponse {
  return ending === "yacht"
    ? {
        ending,
        headline: "LOCAL HERO SEES THROUGH THE SUIT",
        story: [
          `Kenny Valentine turned on the charm all night, but our reader wasn't buying the bad deals.`,
          `They walked out with ${fmt(finalPot)}, up from ${fmt(startingPot)}.`,
          `Kenny was last seen sulking on his speedboat.`,
        ],
      }
    : {
        ending,
        headline: "SMOOTH TALKER SINKS PENSION",
        story: [
          `One handshake too many with Kenny Valentine, and the dream retirement is on hold.`,
          `A pension pot of ${fmt(startingPot)} is down to ${fmt(finalPot)}.`,
          `Experts say: check the register, take your time, and never sign on the night.`,
        ],
      };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<FrontPageRequest>;
  const { finalPot, startingPot } = body;
  if (typeof finalPot !== "number" || typeof startingPot !== "number" || !Array.isArray(body.results)) {
    return Response.json({ error: "finalPot, startingPot and results are required." }, { status: 400 });
  }

  // Decided in code, never by the model.
  const ending = decideEnding(finalPot, startingPot);
  const claude = getClaude();
  if (!claude) return Response.json(fallback(ending, finalPot, startingPot));

  const summary = summariseNight(body.results);
  const pitches = body.results
    .map((r) => {
      const p = getPitch(r.pitchId);
      return p ? `- "${p.title}" (${p.kind}): player chose ${r.decision}, pot change ${fmt(r.delta)}` : null;
    })
    .filter(Boolean)
    .join("\n");

  try {
    const response = await claude.beta.messages.parse({
      model: CLAUDE_MODEL,
      // If Claude declines, the API retries on a fallback model inside the same call.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      max_tokens: 4000,
      output_config: { effort: "low", format: betaZodOutputFormat(Page) },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Ending: ${ending}\nStarting pot: ${fmt(startingPot)}\nFinal pot: ${fmt(finalPot)}\nRight calls: ${summary.correct} of ${summary.total}\nScams signed: ${summary.scamsSigned}\nScams reported: ${summary.scamsReported}\n\nPitches:\n${pitches}`,
        },
      ],
    });
    const out = response.parsed_output;
    if (response.stop_reason === "refusal" || !out || out.story.length < 3) {
      return Response.json(fallback(ending, finalPot, startingPot));
    }
    const page: FrontPageResponse = { ending, headline: out.headline, story: [out.story[0], out.story[1], out.story[2]] };
    return Response.json(page);
  } catch (err) {
    console.error("Front page failed", err);
    return Response.json(fallback(ending, finalPot, startingPot));
  }
}
