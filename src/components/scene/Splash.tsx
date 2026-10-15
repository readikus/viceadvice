import { ASSETS } from "@/game/assets";
import type { SplashProps } from "@/game/ui-props";
import { Stage, Wordmark } from "./Stage";

export function Splash({ onStart }: SplashProps) {
  return (
    <Stage background={ASSETS.splash.path}>
      <div className="absolute inset-y-0 left-0 w-[52%] bg-gradient-to-r from-purple/90 via-purple/60 to-transparent" />
      <div className="absolute top-[12%] left-[6%] flex w-[42%] flex-col items-start gap-[2.2cqw]">
        <Wordmark className="text-[7.5cqw] leading-none" />
        <p className="font-display text-[1.6cqw] tracking-[0.3em] text-teal uppercase neon-text">Miami · 1986</p>
        <p className="text-[1.45cqw] leading-snug text-paper">
          Kenny Valentine is the most charming financial adviser you&apos;ll ever meet. Some of his pitches are scams.
          Some are genuinely good advice. He sounds exactly the same either way.
        </p>
        <p className="font-display text-[1.8cqw] font-bold text-orange uppercase">Judge the advice, not the suit.</p>
        <button
          onClick={onStart}
          className="mt-[1cqw] rounded-full border-[0.2cqw] border-teal bg-purple/80 px-[3cqw] py-[1.2cqw] font-display text-[1.8cqw] font-bold tracking-widest text-teal uppercase neon-box hover:bg-teal hover:text-ink"
        >
          Walk into the office
        </button>
        <p className="text-[1cqw] text-paper/70">You&apos;ll need a microphone. Headphones help.</p>
      </div>
    </Stage>
  );
}
