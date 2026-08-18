import { cn } from "@/lib/utils";

type ProgressColor = "gold" | "cyan" | "magenta" | "green" | "red";

const FILL: Record<ProgressColor, string> = {
  gold: "bg-arcade border-arcade",
  cyan: "bg-arcade-cyan border-arcade-cyan",
  magenta: "bg-arcade-magenta border-arcade-magenta",
  green: "bg-arcade-green border-arcade-green",
  red: "bg-arcade-red border-arcade-red",
};

const EMPTY: Record<ProgressColor, string> = {
  gold: "border-arcade/35",
  cyan: "border-arcade-cyan/35",
  magenta: "border-arcade-magenta/35",
  green: "border-arcade-green/35",
  red: "border-arcade-red/35",
};

interface PixelProgressProps {
  value: number;
  max?: number;
  /** Number of discrete segments. This is a blocky bar, never a smooth one. */
  blocks?: number;
  color?: ProgressColor;
  className?: string;
  label?: string;
}

export function PixelProgress({
  value,
  max = 100,
  blocks = 16,
  color = "gold",
  className,
  label,
}: PixelProgressProps) {
  const safeMax = max > 0 ? max : 1;
  const ratio = Math.min(1, Math.max(0, value / safeMax));
  const filled = Math.round(ratio * blocks);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={Math.round(safeMax)}
      aria-label={label}
      className={cn("flex items-center gap-[3px]", className)}
    >
      {Array.from({ length: blocks }, (_, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "h-3 flex-1 rounded-none border-2",
            i < filled ? FILL[color] : EMPTY[color],
          )}
        />
      ))}
    </div>
  );
}
