import type { TalkButtonProps } from "@/game/ui-props";

function Mic() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.8cqw] w-[1.8cqw]" fill="currentColor" aria-hidden>
      <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z" />
    </svg>
  );
}

export function TalkButton({ disabled, talking, onPress, onRelease, hint }: TalkButtonProps) {
  return (
    <button
      disabled={disabled}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        onPress();
      }}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      onContextMenu={(e) => e.preventDefault()}
      className={`flex w-[22cqw] touch-none items-center justify-center gap-[1cqw] rounded-full border-[0.2cqw] py-[0.9cqw] font-display text-[1.6cqw] font-bold tracking-wider uppercase neon-box transition-colors disabled:opacity-40 ${
        talking ? "border-magenta bg-magenta text-ink" : "border-teal bg-ink/90 text-teal"
      }`}
    >
      <Mic />
      {talking ? "Listening… let go" : hint}
    </button>
  );
}
