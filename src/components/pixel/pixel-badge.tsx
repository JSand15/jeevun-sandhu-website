import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type BadgeColor = "gold" | "cyan" | "magenta" | "green" | "red" | "muted";

const COLORS: Record<BadgeColor, string> = {
  gold: "border-arcade text-arcade",
  cyan: "border-arcade-cyan text-arcade-cyan",
  magenta: "border-arcade-magenta text-arcade-magenta",
  green: "border-arcade-green text-arcade-green",
  red: "border-arcade-red text-arcade-red",
  muted: "border-border text-muted-foreground",
};

interface PixelBadgeProps extends ComponentPropsWithoutRef<"span"> {
  color?: BadgeColor;
}

export function PixelBadge({
  color = "gold",
  className,
  children,
  ...props
}: PixelBadgeProps) {
  return (
    <span
      className={cn(
        "font-pixel inline-flex items-center gap-1.5 rounded-none border-2 px-2 py-1 text-[8px] leading-none tracking-[0.14em] uppercase",
        COLORS[color],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
