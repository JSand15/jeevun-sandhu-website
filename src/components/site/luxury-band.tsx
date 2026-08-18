import type { ReactNode } from "react";

import { ParallaxImage, Reveal } from "@/components/scroll";
import { cn } from "@/lib/utils";
import type { LuxuryImage } from "@/lib/data/luxury-images";

interface LuxuryBandProps {
  image: LuxuryImage;
  children: ReactNode;
  /** Signed parallax multiplier. Keep it small; this should feel weighty. */
  speed?: number;
  className?: string;
  height?: string;
  /**
   * Scrim strength, 0-100. Bright source photos need a heavier one to keep
   * the copy legible. The scrim is painted in --background, so it darkens in
   * dark mode and lightens in light mode, and text contrast holds either way.
   */
  scrim?: number;
}

/**
 * A full-bleed cinematic band. Deliberately quiet: one line of serif copy over
 * a slow-drifting photograph, with nothing else competing for attention.
 */
export function LuxuryBand({
  image,
  children,
  speed = 0.25,
  className,
  height = "min-h-[70svh]",
  scrim = 68,
}: LuxuryBandProps) {
  return (
    <section className={cn("relative isolate overflow-hidden", height, className)}>
      <ParallaxImage
        src={image.src}
        alt={image.alt}
        speed={speed}
        className="absolute inset-0"
        imageClassName="object-cover"
      />
      {/* Flat scrim sets the floor for contrast... */}
      <div
        aria-hidden
        className="bg-background absolute inset-0"
        style={{ opacity: scrim / 100 }}
      />
      {/* ...and the gradient feathers the band into the sections around it. */}
      <div
        aria-hidden
        className="from-background via-background/20 to-background absolute inset-0 bg-gradient-to-b"
      />
      <div className={cn("container-wide relative flex items-center", height)}>
        <Reveal distance={28} className="w-full py-24">
          {children}
        </Reveal>
      </div>
    </section>
  );
}
