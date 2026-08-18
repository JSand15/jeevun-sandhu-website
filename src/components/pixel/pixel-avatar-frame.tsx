import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PixelAvatarFrameProps {
  children: ReactNode;
  /** Rendered on the nameplate below the portrait. */
  name?: string;
  subtitle?: string;
  className?: string;
}

/** A character-select frame: corner brackets plus a nameplate. */
export function PixelAvatarFrame({
  children,
  name,
  subtitle,
  className,
}: PixelAvatarFrameProps) {
  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      <div className="border-arcade relative rounded-none border-2 p-2">
        {/* Corner brackets */}
        <span aria-hidden className="border-arcade absolute -top-1 -left-1 size-3 border-t-4 border-l-4" />
        <span aria-hidden className="border-arcade absolute -top-1 -right-1 size-3 border-t-4 border-r-4" />
        <span aria-hidden className="border-arcade absolute -bottom-1 -left-1 size-3 border-b-4 border-l-4" />
        <span aria-hidden className="border-arcade absolute -right-1 -bottom-1 size-3 border-r-4 border-b-4" />
        {children}
      </div>

      {name && (
        <div className="border-arcade bg-arcade text-arcade-foreground -mt-px border-2 px-3 py-1.5 text-center">
          <p className="font-pixel text-[9px] leading-none tracking-[0.16em] uppercase">
            {name}
          </p>
          {subtitle && (
            <p className="font-pixel mt-1.5 text-[7px] leading-none tracking-[0.12em] opacity-80">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
