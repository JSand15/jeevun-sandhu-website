import { cn } from "@/lib/utils";

interface AmbientBackdropProps {
  /** How loud the texture is. Content sections want "subtle". */
  intensity?: "subtle" | "medium";
  /** Adds the retro dither banding over the wash. */
  dither?: boolean;
  className?: string;
}

/**
 * Ambient texture for otherwise empty sections: a faint 8-bit graph-paper grid
 * that fades out toward the edges, plus a soft arcade-gold wash.
 *
 * Purely decorative and pointer-transparent. Sits at -z-10, so any section
 * using it needs `relative isolate`.
 */
export function AmbientBackdrop({
  intensity = "subtle",
  dither = false,
  className,
}: AmbientBackdropProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {/* Graph-paper grid, masked so it never reaches a hard edge. */}
      <div
        className={cn(
          "pixel-grid-bg absolute inset-0",
          intensity === "subtle" ? "opacity-[0.35]" : "opacity-60",
        )}
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 75%)",
        }}
      />

      {/* Warm arcade glow, off-centre so it doesn't read as a vignette. */}
      <div
        className={cn(
          "bg-arcade absolute -top-32 -right-24 h-[420px] w-[420px] rounded-full blur-[120px]",
          intensity === "subtle" ? "opacity-[0.05]" : "opacity-[0.09]",
        )}
      />
      <div
        className={cn(
          "bg-arcade-cyan absolute -bottom-40 -left-32 h-[380px] w-[380px] rounded-full blur-[120px]",
          intensity === "subtle" ? "opacity-[0.04]" : "opacity-[0.07]",
        )}
      />

      {dither && <div className="dither absolute inset-0 opacity-50" />}
    </div>
  );
}
