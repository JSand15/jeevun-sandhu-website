import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PixelHeadingProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "p";
  className?: string;
  /** Appends a blinking block cursor, like a terminal waiting for input. */
  cursor?: boolean;
  accent?: "gold" | "cyan" | "magenta" | "foreground";
}

const ACCENTS = {
  gold: "text-arcade",
  cyan: "text-arcade-cyan",
  magenta: "text-arcade-magenta",
  foreground: "text-foreground",
} as const;

export function PixelHeading({
  children,
  as: Tag = "h2",
  className,
  cursor = false,
  accent = "gold",
}: PixelHeadingProps) {
  return (
    <Tag
      className={cn(
        "font-pixel leading-[1.6] tracking-[0.1em] uppercase",
        ACCENTS[accent],
        className,
      )}
    >
      {children}
      {cursor && (
        <span aria-hidden className="pixel-blink ml-2 inline-block">
          ▮
        </span>
      )}
    </Tag>
  );
}
