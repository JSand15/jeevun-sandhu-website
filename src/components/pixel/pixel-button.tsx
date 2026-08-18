"use client";

import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "gold" | "cyan" | "magenta" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  gold: "bg-arcade text-arcade-foreground border-arcade shadow-[4px_4px_0_0_var(--foreground)] hover:brightness-110",
  cyan: "bg-arcade-cyan text-arcade-foreground border-arcade-cyan shadow-[4px_4px_0_0_var(--foreground)] hover:brightness-110",
  magenta:
    "bg-arcade-magenta text-arcade-foreground border-arcade-magenta shadow-[4px_4px_0_0_var(--foreground)] hover:brightness-110",
  ghost:
    "bg-transparent text-foreground border-foreground shadow-[4px_4px_0_0_var(--arcade)] hover:bg-foreground/5",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-[8px] gap-1.5",
  md: "px-4 py-3 text-[10px] gap-2",
  lg: "px-6 py-4 text-xs gap-2.5",
};

interface PixelButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function PixelButton({
  variant = "gold",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: PixelButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "font-pixel inline-flex items-center justify-center rounded-none border-2 uppercase leading-none tracking-[0.12em]",
        // The button physically presses into the page on click.
        "transition-[transform,box-shadow,filter] duration-75 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        "focus-visible:outline-arcade focus-visible:outline-2 focus-visible:outline-offset-4",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
