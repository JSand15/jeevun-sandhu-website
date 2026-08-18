"use client";

import { PixelSprite } from "@/components/pixel/pixel-sprite";
import { Scanlines } from "@/components/pixel/scanlines";
import { cn } from "@/lib/utils";

import { ShipItGame } from "./ship-it-game";

interface ArcadeCabinetProps {
  onScore?: (score: number) => void;
  onGameOver?: (score: number, isHighScore: boolean) => void;
  className?: string;
  autoFocus?: boolean;
}

/** Frames the game as a physical arcade cabinet. */
export function ArcadeCabinet({
  onScore,
  onGameOver,
  className,
  autoFocus,
}: ArcadeCabinetProps) {
  return (
    <div
      className={cn(
        "border-arcade bg-card mx-auto w-full max-w-2xl rounded-none border-2 shadow-[8px_8px_0_0_var(--arcade)]",
        className,
      )}
    >
      {/* Marquee */}
      <div className="border-arcade bg-arcade text-arcade-foreground flex items-center justify-center gap-3 border-b-2 py-3">
        <PixelSprite name="rocket" size={16} />
        <span className="font-pixel text-[11px] leading-none tracking-[0.24em]">
          SHIP IT
        </span>
        <PixelSprite name="coin" size={16} />
      </div>

      {/* Screen */}
      <div className="relative bg-[#0d1220] p-3 sm:p-5">
        <ShipItGame
          onScore={onScore}
          onGameOver={onGameOver}
          autoFocus={autoFocus}
        />
        <Scanlines intensity="medium" className="z-10" />
      </div>

      {/* Control panel */}
      <div className="border-arcade/40 flex flex-wrap items-center justify-between gap-3 border-t-2 px-4 py-3">
        <span className="font-pixel text-muted-foreground text-[7px] leading-relaxed tracking-[0.12em]">
          1 PLAYER · NO QUARTERS REQUIRED
        </span>
        <span className="font-pixel text-arcade text-[7px] leading-relaxed tracking-[0.12em]">
          BEAT MY SCORE
        </span>
      </div>
    </div>
  );
}
