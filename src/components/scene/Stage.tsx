import Image from "next/image";
import type { ReactNode } from "react";

/**
 * The 16:9 stage everything is drawn on. It scales to fit the window, and the
 * scene components size themselves in container units (cqw) so they scale with it.
 */
export function Stage({ background, dim = false, children }: { background?: string; dim?: boolean; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background">
      <div className="@container relative aspect-video w-[min(100vw,calc(100dvh*16/9))] overflow-hidden bg-purple text-[1.15cqw] select-none">
        {background && (
          <Image src={background} alt="" fill sizes="100vw" loading="eager" className={`object-cover ${dim ? "brightness-[0.45] blur-[0.3cqw]" : ""}`} />
        )}
        {children}
      </div>
    </div>
  );
}

/** The VICE ADVICE wordmark, in code so it stays crisp. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-block -rotate-6 font-script text-magenta neon-text ${className}`} aria-label="Vice Advice">
      Vice Advice
    </span>
  );
}
