import type { BrochureId, Ending } from "./types";

/**
 * The game's art, served from public/assets/. These are web exports (WebP) of the
 * approved masters; the masters themselves live with the graphics team.
 * In-game text, controls, the wordmark and the newspaper layout are drawn in code.
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

/**
 * Kenny's sprite sheet: 3 columns by 4 rows of 362px cells.
 * Columns are the mouth (closed, half, open); rows are the expression.
 */
export const KENNY_ATLAS = {
  ...a("kenny-atlas.webp", 1086, 1448, "Kenny waist-up behind the desk, 3 mouths x 4 expressions. Transparent"),
  columns: 3,
  rows: 4,
  mouth: { closed: 0, half: 1, open: 2 },
  expression: { neutral: 0, grin: 1, wounded: 2, eyesClosed: 3 },
} as const;

export const ASSETS = {
  splash: a("splash.webp", 1672, 941, "Kenny leaning on a white sports car on the Miami waterfront at sunset"),
  office: a("office-background.webp", 1672, 941, "Kenny's office from the client's chair: blinds, harbour at sunset, neon palm"),
  desk: a("desk-foreground.webp", 1672, 941, "The desk's front edge, drawn over Kenny. Transparent above the desk"),
  kennyPortrait: a("kenny-portrait.webp", 800, 800, "Kenny, single portrait. Transparent"),
  props: {
    register: a("prop-register.webp", 600, 262, "The FCA register: leather binder with a gold plate. Transparent"),
    telephone: a("prop-telephone.webp", 600, 367, "Cream push-button telephone for PlannerPal. Transparent"),
  },
  brochures: {
    fund: a("document-fund.webp", 800, 1067, "Fund brochure template: sunset header, blank boxes"),
    "vip-club": a("document-vip.webp", 800, 1067, "VIP club invitation template"),
    "pension-transfer": a("document-pension.webp", 800, 1067, "Pension transfer form template"),
    statement: a("document-statement.webp", 800, 1067, "Pension statement template with a table"),
  } satisfies Record<BrochureId, AssetSpec>,
  endings: {
    yacht: a("ending-yacht.webp", 1672, 941, "Yacht deck at sunset"),
    comfortable: a("ending-comfortable.webp", 1672, 941, "Sunny conservatory with a sea view"),
    bedsit: a("ending-bedsit.webp", 1672, 941, "Dingy bedsit with a two-bar heater"),
  } satisfies Record<Ending, AssetSpec>,
} as const;

/** Palette from the spec. Use these tokens, not raw hex, in components. */
export const PALETTE = {
  magenta: "#FF2E88", // neon, Kenny's tie
  teal: "#19D3C5", // UI accents, cash meter
  orange: "#FF8A3D", // sky, warm highlights
  purple: "#2A1240", // background, shadows
  paper: "#F6E9D7", // Kenny's suit, paper
} as const;
