import type { BrochureId, Decision } from "./types";

/**
 * Agreed art filenames and sizes. Files live in public/assets/.
 * Adam's generated art drops in with exactly these names; until then the graphics
 * stream ships placeholders at the same paths and sizes, so swapping is a file copy.
 */
export interface AssetSpec {
  path: string;
  width: number;
  height: number;
  note: string;
}

const a = (path: string, width: number, height: number, note: string): AssetSpec => ({
  path: `/assets/${path}`,
  width,
  height,
  note,
});

export const ASSETS = {
  splash: a("splash.png", 1920, 1080, "VICE ADVICE in neon over a palm-lined sunset, Kenny leaning on a sports car"),
  office: a("office.png", 1920, 1080, "Kenny's nightclub office from the client's chair: desk, blinds, harbour view with a speedboat"),
  kenny: {
    mouthClosed: a("kenny-mouth-closed.png", 800, 800, "Waist-up behind the desk, mouth closed. Transparent background"),
    mouthHalf: a("kenny-mouth-half.png", 800, 800, "Same frame, mouth half open"),
    mouthOpen: a("kenny-mouth-open.png", 800, 800, "Same frame, mouth open"),
    grin: a("kenny-grin.png", 800, 800, "Mood: grinning"),
    wounded: a("kenny-wounded.png", 800, 800, "Mood: wounded, 'You don't trust Kenny?'"),
  },
  brochures: {
    fund: a("brochure-fund.png", 600, 800, "Glossy fund brochure"),
    "vip-club": a("brochure-vip-club.png", 600, 800, "VIP club membership card or invite"),
    "pension-transfer": a("brochure-pension-transfer.png", 600, 800, "Pension transfer form"),
    statement: a("brochure-statement.png", 600, 800, "Pension statement"),
  } satisfies Record<BrochureId, AssetSpec>,
  stamps: {
    SIGN: a("stamp-sign.png", 300, 150, "SIGN stamp"),
    WALK: a("stamp-walk.png", 300, 150, "WALK stamp"),
    REPORT: a("stamp-report.png", 300, 150, "REPORT stamp"),
  } satisfies Record<Decision, AssetSpec>,
  frontPages: {
    yacht: a("frontpage-yacht.png", 1080, 1350, "Newspaper template, yacht ending"),
    bedsit: a("frontpage-bedsit.png", 1080, 1350, "Newspaper template, bedsit ending"),
  },
} as const;

/** Palette from the spec. Use these tokens, not raw hex, in components. */
export const PALETTE = {
  magenta: "#FF2E88", // neon, Kenny's tie
  teal: "#19D3C5", // UI accents, cash meter
  orange: "#FF8A3D", // sky, warm highlights
  purple: "#2A1240", // background, shadows
  paper: "#F6E9D7", // Kenny's suit, paper
} as const;
