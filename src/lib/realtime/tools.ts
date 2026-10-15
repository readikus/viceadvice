import type { BrochureId } from "@/game/types";

export const SHOW_BROCHURE_TOOL = "show_brochure";

/** Realtime function tool Kenny calls when he slides his paperwork across the desk. */
export function showBrochureTool(brochure: BrochureId) {
  return {
    type: "function" as const,
    name: SHOW_BROCHURE_TOOL,
    description:
      "Slide your brochure or paperwork across the desk so the player can see it. Call it once, at the moment you hand it over, and keep talking while they look.",
    parameters: {
      type: "object",
      properties: {
        brochure: { type: "string", enum: [brochure], description: "The paperwork you are handing over." },
      },
      required: ["brochure"],
      additionalProperties: false,
    },
  };
}
