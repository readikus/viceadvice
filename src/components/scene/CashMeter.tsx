import type { CashMeterProps } from "@/game/ui-props";
import { formatDelta, formatPounds } from "./format";

export function CashMeter({ pot, startingPot, lastDelta }: CashMeterProps) {
  const up = pot >= startingPot;
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-widest opacity-60">Your pot</p>
      <p className={`text-3xl font-black tabular-nums ${up ? "text-teal-500" : "text-red-500"}`}>{formatPounds(pot)}</p>
      {lastDelta !== null && (
        <p className={`text-sm font-semibold ${lastDelta >= 0 ? "text-teal-500" : "text-red-500"}`}>{formatDelta(lastDelta)}</p>
      )}
    </div>
  );
}
