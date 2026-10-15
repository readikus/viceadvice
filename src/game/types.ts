/**
 * Shared contracts for VICE ADVICE.
 *
 * Every stream builds against these types. Change them in a small PR of their own,
 * and tell the other streams, rather than editing them inside a feature PR.
 *
 * Rule from the spec: the truth (legit or scam, the register, the scoring) is always
 * code. The AI only does the talking.
 */

// ---------------------------------------------------------------------------
// Pitches
// ---------------------------------------------------------------------------

export type PitchKind = "legit" | "scam";

/** What happens when the player looks up the firm number Kenny gave. */
export type RegisterResult =
  | "match" // number is listed and every contact detail matches what Kenny said
  | "clone" // number is listed, but Kenny's phone or website differs from the register
  | "not_listed" // number is not on the register at all
  | "none_given"; // Kenny dodges and never gives a number

export type BrochureId = "fund" | "vip-club" | "pension-transfer" | "statement";

export interface RedFlag {
  id: string;
  /** Short label shown in the debrief, e.g. "Guaranteed high returns". */
  label: string;
  /** One sentence on why it matters, shown in the debrief. */
  why: string;
}

/** The details Kenny claims for the firm behind this pitch. */
export interface ClaimedFirm {
  name: string;
  /** Firm reference number Kenny gives. null means he dodges. */
  frn: string | null;
  phone: string;
  website: string;
}

/**
 * One pitch, as dealt by the engine and briefed to Kenny.
 * Only the brief for the pitch in play is ever sent to the voice session.
 */
export interface PitchBrief {
  id: string;
  /** Internal title, for the debrief and dev tools. */
  title: string;
  kind: PitchKind;
  /** Kenny's opening hook, in his voice. */
  openingLine: string;
  /** What he is selling, in plain words, for the prompt. */
  product: string;
  /** Talking points Kenny draws on. For legit pitches these are the sound advice. */
  talkingPoints: string[];
  /** Scam tells baked into this pitch. Empty for legit pitches. */
  redFlags: RedFlag[];
  /** For legit pitches, what makes it sound advice. Shown in the debrief. */
  whyItHoldsUp: string[];
  firm: ClaimedFirm;
  /** What the register lookup returns for firm.frn. Must agree with register.ts. */
  registerResult: RegisterResult;
  /** Scam-only pressure line, e.g. "the boat leaves at midnight". */
  pressureLine: string | null;
  /** Brochure Kenny can slide across the desk, if any. */
  brochure: BrochureId | null;
  /** What's printed on the brochure, as label and value rows. The firm's details are added from `firm`. */
  brochureFacts?: [label: string, value: string][];
  /** Change to the pot, in pounds, if the player SIGNs. Positive for legit, negative for scams. */
  signDelta: number;
}

// ---------------------------------------------------------------------------
// FCA register (fictional)
// ---------------------------------------------------------------------------

export interface RegisterEntry {
  frn: string;
  name: string;
  status: "Authorised" | "No longer authorised";
  phone: string;
  website: string;
  address: string;
  /** Shown in red on the register, e.g. a clone-firm warning. */
  warning?: string;
}

// ---------------------------------------------------------------------------
// Player situation
// ---------------------------------------------------------------------------

export interface Situation {
  headline: string;
  age: number;
  /** Starting pot in pounds. The final pot is the score. */
  startingPot: number;
  facts: string[];
}

// ---------------------------------------------------------------------------
// Decisions and scoring
// ---------------------------------------------------------------------------

export type Decision = "SIGN" | "WALK" | "REPORT";

export interface PitchResult {
  pitchId: string;
  kind: PitchKind;
  decision: Decision;
  /** Change to the pot in pounds. */
  delta: number;
  registerChecked: boolean;
  lifelineUsed: boolean;
  /** True when the decision was right: SIGN a legit pitch, or WALK or REPORT a scam. */
  correct: boolean;
}

/** yacht: a perfect night. comfortable: you kept your pot. bedsit: you lost money. */
export type Ending = "yacht" | "comfortable" | "bedsit";

// ---------------------------------------------------------------------------
// Night state (owned by the engine, read by the UI)
// ---------------------------------------------------------------------------

export type NightPhase =
  | "splash"
  | "situation"
  | "pitch" // a pitch is live: Kenny is talking, the player can check, call, decide
  | "consequence" // the pot moves after a stamp
  | "debrief";

export interface NightState {
  phase: NightPhase;
  situation: Situation;
  /** The five pitches dealt for tonight, in order. */
  deck: PitchBrief[];
  /** Index into deck of the current pitch. */
  pitchIndex: number;
  pot: number;
  results: PitchResult[];
  lifelinesLeft: number;
  /** FRNs the player has looked up during the current pitch. */
  lookups: string[];
}

// ---------------------------------------------------------------------------
// Dialogue (owned by the realtime stream, read by the engine and UI)
// ---------------------------------------------------------------------------

export type Speaker = "player" | "kenny";

export interface TranscriptLine {
  id: string;
  speaker: Speaker;
  text: string;
  done: boolean;
  /** ms since epoch when the line started. PlannerPal reads the last 60 seconds. */
  at: number;
}

/** Events Kenny can fire at the page through tool calls. */
export type KennyEvent = { type: "show_brochure"; brochure: BrochureId };

export type VoiceStatus = "idle" | "connecting" | "live" | "error";

/** What the realtime layer hands to the rest of the game. */
export interface KennyVoice {
  status: VoiceStatus;
  error: string | null;
  lines: TranscriptLine[];
  kennySpeaking: boolean;
  /** True while the player holds the talk button. */
  playerTalking: boolean;
  /** Start a fresh session for one pitch. Ends any previous session first. */
  startPitch(pitchId: string): Promise<void>;
  endPitch(): void;
  /** Push-to-talk: hold to talk, release to hand over to Kenny. */
  pressTalk(): void;
  releaseTalk(): void;
  /** Kenny's current output volume, 0 to 1. Polled every frame for the lip-sync. */
  getKennyLevel(): number;
  /** Subscribe to tool-call events. Returns an unsubscribe function. */
  onEvent(handler: (event: KennyEvent) => void): () => void;
}

// ---------------------------------------------------------------------------
// Server routes
// ---------------------------------------------------------------------------

/** POST /api/session */
export interface SessionRequest {
  pitchId: string;
}
export interface SessionResponse {
  clientSecret: string;
  expiresAt: number;
}

/** POST /api/plannerpal */
export interface PlannerPalRequest {
  pitchId: string;
  /** Transcript lines from the last 60 seconds. */
  lines: Pick<TranscriptLine, "speaker" | "text">[];
  registerChecked: boolean;
}
export interface PlannerPalResponse {
  /** Two short lines, e.g. "He promised guaranteed returns. Firm number not checked yet." */
  lines: [string, string];
}

/** POST /api/frontpage */
export interface FrontPageRequest {
  finalPot: number;
  startingPot: number;
  results: PitchResult[];
}
export interface FrontPageResponse {
  ending: Ending;
  headline: string;
  story: [string, string, string];
}
