import type { CashMeterProps } from "@/game/ui-props";
import { formatDelta, formatPounds } from "./format";

export function CashMeter({ pot, startingPot, lastDelta }: CashMeterProps) {
  const down = pot < startingPot;
  return (
    <div className="relative flex items-baseline gap-[1cqw]">
      <span className="font-display text-[1.1cqw] font-bold tracking-[0.15em] text-paper uppercase">Retirement pot</span>
      <span className={`font-display text-[2.7cqw] font-bold tabular-nums neon-text ${down ? "text-magenta" : "text-teal"}`}>{formatPounds(pot)}</span>
      {lastDelta !== null && (
        <span
          key={`${pot}-${lastDelta}`}
          className={`absolute top-full right-0 font-display text-[1.6cqw] font-bold neon-text [animation:delta-flash_2.4s_ease-out_forwards] ${
            lastDelta >= 0 ? "text-teal" : "text-magenta"
          }`}
        >
          {formatDelta(lastDelta)}
        </span>
      )}
    </div>
  );
}
