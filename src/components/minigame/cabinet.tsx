import type { ReactNode } from "react";

import { PixelSprite, type PixelSpriteName } from "@/components/pixel/pixel-sprite";
import { Scanlines } from "@/components/pixel/scanlines";
import { cn } from "@/lib/utils";

interface CabinetProps {
  title: string;
  children: ReactNode;
  leftSprite?: PixelSpriteName;
  rightSprite?: PixelSpriteName;
  footerLeft?: string;
  footerRight?: string;
  className?: string;
}

/**
 * The physical arcade cabinet every game sits in: gold marquee, CRT screen,
 * control panel. Hard edges throughout, no rounded corners.
 */
export function Cabinet({
  title,
  children,
  leftSprite = "coin",
  rightSprite = "coin",
  footerLeft = "1 PLAYER · NO QUARTERS REQUIRED",
  footerRight = "BEAT MY SCORE",
  className,
}: CabinetProps) {
  return (
    <div
      className={cn(
        "border-arcade bg-card mx-auto w-full max-w-2xl rounded-none border-2 shadow-[8px_8px_0_0_var(--arcade)]",
        className,
      )}
    >
      <div className="border-arcade bg-arcade text-arcade-foreground flex items-center justify-center gap-3 border-b-2 py-3">
        <PixelSprite name={leftSprite} size={16} />
        <span className="font-pixel text-[11px] leading-none tracking-[0.24em]">
          {title}
        </span>
        <PixelSprite name={rightSprite} size={16} />
      </div>

      <div className="relative bg-[#0d1220] p-3 sm:p-5">
        {children}
        <Scanlines intensity="medium" className="z-10" />
      </div>

      <div className="border-arcade/40 flex flex-wrap items-center justify-between gap-3 border-t-2 px-4 py-3">
        <span className="font-pixel text-muted-foreground text-[7px] leading-relaxed tracking-[0.12em]">
          {footerLeft}
        </span>
        <span className="font-pixel text-arcade text-[7px] leading-relaxed tracking-[0.12em]">
          {footerRight}
        </span>
      </div>
    </div>
  );
}
