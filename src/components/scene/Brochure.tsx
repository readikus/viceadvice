import type { BrochureProps } from "@/game/ui-props";
import type { BrochureId } from "@/game/types";

const LABEL: Record<BrochureId, string> = {
  fund: "Glossy fund brochure",
  "vip-club": "VIP club invitation",
  "pension-transfer": "Pension transfer form",
  statement: "Pension statement",
};

export function Brochure({ brochure, onDismiss }: BrochureProps) {
  if (!brochure) return <div className="h-40 w-32" aria-hidden />;
  return (
    <button
      onClick={onDismiss}
      className="flex h-40 w-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-amber-400 p-2 text-center text-xs"
      title="Push it back across the desk"
    >
      <span className="text-3xl">📄</span>
      {LABEL[brochure]}
    </button>
  );
}
