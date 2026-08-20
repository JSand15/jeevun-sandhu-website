import type { ReactNode } from "react";

import { PixelHeading } from "@/components/pixel/pixel-heading";
import {
  PixelSprite,
  type PixelSpriteName,
} from "@/components/pixel/pixel-sprite";
import { Scanlines } from "@/components/pixel/scanlines";
import { ParallaxImage, Reveal } from "@/components/scroll";
import { AmbientBackdrop } from "@/components/site/ambient-backdrop";
import type { LuxuryImage } from "@/lib/data/luxury-images";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Optional 8-bit ornament shown beside the eyebrow. */
  sprite?: PixelSpriteName;
  accent?: "gold" | "cyan" | "magenta";
  /**
   * Full-bleed photograph behind the header. Without one the header still gets
   * the ambient grid so no page is left flat.
   */
  image?: LuxuryImage;
  /** Scrim strength over the photo, 0-100. Bright sources need more. */
  scrim?: number;

  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  sprite,
  accent = "gold",
  image,
  scrim = 55,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "relative isolate overflow-hidden",
        image
          ? "pt-24 pb-16 sm:pt-36 sm:pb-24"
          : "pt-16 pb-12 sm:pt-24 sm:pb-16",
        className,
      )}
    >
      {image ? (
        <>
          <ParallaxImage
            src={image.src}
            alt={image.alt}
            speed={0.16}
            priority
            className="absolute inset-0 -z-10"
            imageClassName="object-cover"
          />
          {/* Same overlay formula as LuxuryBand on the home page: one flat
              scrim plus a single vertical gradient. Painted in --background, so
              it darkens in dark mode and lightens in light mode and the copy
              reads in both. Kept deliberately simple — stacking more layers
              here compounds into a flat black wash and buries the photograph. */}
          <div
            aria-hidden
            className="bg-background absolute inset-0 -z-10"
            style={{ opacity: scrim / 100 }}
          />
          <div
            aria-hidden
            className="from-background via-background/20 to-background absolute inset-0 -z-10 bg-gradient-to-b"
          />
          <Scanlines intensity="subtle" className="-z-10" />
        </>
      ) : (
        <AmbientBackdrop />
      )}

      <div className="container-wide">
        <Reveal>
          {eyebrow && (
            <div className="mb-4 flex items-center gap-2.5">
              {sprite && <PixelSprite name={sprite} size={18} />}
              <PixelHeading as="p" accent={accent} className="text-[9px]">
                {eyebrow}
              </PixelHeading>
            </div>
          )}
          <h1 className="text-foreground font-display text-5xl tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-5 max-w-2xl text-lg text-balance">
              {description}
            </p>
          )}
          {children}
        </Reveal>
      </div>
    </header>
  );
}
