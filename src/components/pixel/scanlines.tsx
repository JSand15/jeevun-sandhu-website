import { cn } from "@/lib/utils";

interface ScanlinesProps {
  className?: string;
  intensity?: "subtle" | "medium" | "strong";
}

const INTENSITY = {
  subtle: "opacity-20",
  medium: "opacity-40",
  strong: "opacity-70",
} as const;

/** A CRT overlay. Absolutely positioned, never intercepts pointer events. */
export function Scanlines({ className, intensity = "medium" }: ScanlinesProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "scanlines crt-vignette pointer-events-none absolute inset-0 z-10",
        INTENSITY[intensity],
        className,
      )}
    />
  );
}
