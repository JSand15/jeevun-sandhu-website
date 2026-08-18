import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type PanelVariant = "default" | "gold" | "cyan" | "magenta" | "danger";

const VARIANTS: Record<PanelVariant, { border: string; corner: string; shadow: string; glow: string }> = {
  default: {
    border: "border-border",
    corner: "bg-border",
    shadow: "shadow-[4px_4px_0_0_var(--border)]",
    glow: "shadow-[0_0_24px_-2px_var(--border)]",
  },
  gold: {
    border: "border-arcade",
    corner: "bg-arcade",
    shadow: "shadow-[4px_4px_0_0_var(--arcade)]",
    glow: "shadow-[0_0_28px_-2px_var(--arcade)]",
  },
  cyan: {
    border: "border-arcade-cyan",
    corner: "bg-arcade-cyan",
    shadow: "shadow-[4px_4px_0_0_var(--arcade-cyan)]",
    glow: "shadow-[0_0_28px_-2px_var(--arcade-cyan)]",
  },
  magenta: {
    border: "border-arcade-magenta",
    corner: "bg-arcade-magenta",
    shadow: "shadow-[4px_4px_0_0_var(--arcade-magenta)]",
    glow: "shadow-[0_0_28px_-2px_var(--arcade-magenta)]",
  },
  danger: {
    border: "border-arcade-red",
    corner: "bg-arcade-red",
    shadow: "shadow-[4px_4px_0_0_var(--arcade-red)]",
    glow: "shadow-[0_0_28px_-2px_var(--arcade-red)]",
  },
};

interface PixelPanelProps extends ComponentPropsWithoutRef<"div"> {
  variant?: PanelVariant;
  /** Adds a neon halo. The one place this design system permits a blur. */
  glow?: boolean;
  /** Lays CRT scanlines over the panel contents. */
  scanline?: boolean;
}

export function PixelPanel({
  variant = "default",
  glow = false,
  scanline = false,
  className,
  children,
  ...props
}: PixelPanelProps) {
  const v = VARIANTS[variant];

  return (
    <div
      className={cn(
        "bg-card relative rounded-none border-2",
        v.border,
        v.shadow,
        glow && v.glow,
        scanline && "scanlines",
        className,
      )}
      {...props}
    >
      {/* Stepped corners: four pixels that make the frame read as 8-bit. */}
      <span aria-hidden className={cn("absolute -top-2 -left-2 size-2", v.corner)} />
      <span aria-hidden className={cn("absolute -top-2 -right-2 size-2", v.corner)} />
      <span aria-hidden className={cn("absolute -bottom-2 -left-2 size-2", v.corner)} />
      <span aria-hidden className={cn("absolute -right-2 -bottom-2 size-2", v.corner)} />
      {children}
    </div>
  );
}
