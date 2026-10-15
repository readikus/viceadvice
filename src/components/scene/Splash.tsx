import type { SplashProps } from "@/game/ui-props";

export function Splash({ onStart }: SplashProps) {
  return (
    <section className="m-auto flex max-w-xl flex-col items-center gap-6 py-16 text-center">
      <h2 className="text-5xl font-black tracking-tight">VICE ADVICE</h2>
      <p className="text-lg opacity-80">
        Miami, 1986. Kenny Valentine is the most charming financial adviser you&apos;ll ever meet. Some of his
        pitches are scams. Some are genuinely good advice. He sounds exactly the same either way.
      </p>
      <p className="text-sm opacity-60">You&apos;ll need a microphone. Hold SPACE (or the talk button) to speak to Kenny.</p>
      <button onClick={onStart} className="rounded-full bg-amber-400 px-8 py-4 text-lg font-bold text-black hover:bg-amber-300">
        Walk into the office
      </button>
    </section>
  );
}
