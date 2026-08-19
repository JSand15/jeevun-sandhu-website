import type { Metadata } from "next";
import Link from "next/link";

import { PixelPanel } from "@/components/pixel/pixel-panel";
import { PixelSprite } from "@/components/pixel/pixel-sprite";
import { Scanlines } from "@/components/pixel/scanlines";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="container-wide flex min-h-[70svh] flex-col items-center justify-center py-24">
      <PixelPanel
        variant="danger"
        className="relative w-full max-w-xl overflow-hidden bg-[#0d1220] px-8 py-14 text-center"
      >
        <Scanlines intensity="medium" />

        <div className="relative z-20">
          <p className="font-pixel text-arcade-red text-2xl leading-relaxed tracking-[0.18em] sm:text-3xl">
            GAME
            <br />
            OVER
          </p>

          <div
            aria-hidden
            className="mt-8 flex items-center justify-center gap-3 opacity-60"
          >
            <PixelSprite name="heart" size={18} className="grayscale" />
            <PixelSprite name="heart" size={18} className="grayscale" />
            <PixelSprite name="heart" size={18} className="grayscale" />
          </div>

          <p className="font-pixel mt-8 text-[10px] leading-relaxed tracking-[0.14em] text-[#e8edf7]">
            ERROR 404
          </p>
          <p className="mt-4 text-sm text-balance text-[#8a93a8]">
            This page was moved, deleted, or never existed in the first place.
            Happens to the best of us.
          </p>

          <Link
            href="/"
            className="border-arcade bg-arcade text-arcade-foreground font-pixel mt-10 inline-flex items-center gap-2 rounded-none border-2 px-5 py-3.5 text-[10px] tracking-[0.14em] uppercase shadow-[4px_4px_0_0_#e8edf7] transition-transform active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            <PixelSprite name="coin" size={12} />
            Continue
          </Link>

          <p
            aria-hidden
            className="font-pixel pixel-blink mt-6 text-[8px] tracking-[0.2em] text-[#8a93a8]"
          >
            INSERT COIN
          </p>
        </div>
      </PixelPanel>
    </div>
  );
}
