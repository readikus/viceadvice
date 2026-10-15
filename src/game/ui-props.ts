import type {
  BrochureId,
  Decision,
  FrontPageResponse,
  PitchBrief,
  PitchResult,
  RegisterEntry,
  Situation,
  TranscriptLine,
} from "./types";

/**
 * Props for the scene components. Graphics builds components to these shapes;
 * the engine renders them. Components are presentational: no game logic, no fetches.
 */

export interface SplashProps {
  onStart(): void;
}

export interface SituationCardProps {
  situation: Situation;
  /** Compact = pinned in the corner during pitches; full = the intro card. */
  variant: "full" | "compact";
  onContinue?(): void;
}

export interface CashMeterProps {
  pot: number;
  startingPot: number;
  /** Last change, for the up or down flash. null when nothing just happened. */
  lastDelta: number | null;
}

export type KennyMood = "neutral" | "grin" | "wounded";

export interface KennyProps {
  /** Polled every animation frame; 0 is silent, 1 is loud. Drives the mouth swap. */
  getLevel(): number;
  mood: KennyMood;
  speaking: boolean;
}

export interface RegisterBookProps {
  open: boolean;
  onToggle(): void;
  /** The engine does the lookup; the book only shows the result. */
  onLookup(frn: string): void;
  /** Result of the last lookup: an entry, "not_found", or null before any lookup. */
  result: RegisterEntry | "not_found" | null;
  lastQuery: string | null;
}

export interface BrochureProps {
  brochure: BrochureId | null;
  onDismiss(): void;
}

export interface StampBarProps {
  disabled: boolean;
  onStamp(decision: Decision): void;
  /** The stamp just used, for the slam animation. */
  stamped: Decision | null;
}

export interface TalkButtonProps {
  /** Disabled while connecting, or when the pitch is over. */
  disabled: boolean;
  talking: boolean;
  onPress(): void;
  onRelease(): void;
  /** Hint text, e.g. "Hold SPACE to talk". */
  hint: string;
}

export interface LifelineProps {
  left: number;
  loading: boolean;
  /** PlannerPal's two lines, shown until dismissed. */
  advice: [string, string] | null;
  onCall(): void;
  onDismiss(): void;
}

export interface TranscriptProps {
  lines: TranscriptLine[];
}

export interface PitchTimerProps {
  secondsLeft: number;
  totalSeconds: number;
}

export interface DebriefProps {
  frontPage: FrontPageResponse | null;
  startingPot: number;
  finalPot: number;
  results: PitchResult[];
  /** Briefs for the pitches played, so the debrief can list red flags caught and missed. */
  pitches: PitchBrief[];
  onPlayAgain(): void;
}
