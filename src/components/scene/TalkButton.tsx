import type { TalkButtonProps } from "@/game/ui-props";

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
      className={`touch-none select-none rounded-full px-8 py-4 font-bold disabled:opacity-40 ${
        talking ? "bg-red-600 text-white" : "bg-amber-400 text-black hover:bg-amber-300"
      }`}
    >
      {talking ? "Listening… let go to hand over" : hint}
    </button>
  );
}
