import type { ReactNode } from "react";

import { PixelHeading } from "@/components/pixel/pixel-heading";
import { PixelSprite, type PixelSpriteName } from "@/components/pixel/pixel-sprite";
import { Reveal } from "@/components/scroll";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Optional 8-bit ornament shown beside the eyebrow. */
  sprite?: PixelSpriteName;
  accent?: "gold" | "cyan" | "magenta";
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  sprite,
  accent = "gold",
}: PageHeaderProps) {
  return (
    <div className="container-wide pt-16 pb-12 sm:pt-24 sm:pb-16">
      <Reveal>
        {eyebrow && (
          <div className="mb-4 flex items-center gap-2.5">
            {sprite && <PixelSprite name={sprite} size={18} />}
            <PixelHeading as="p" accent={accent} className="text-[9px]">
              {eyebrow}
            </PixelHeading>
          </div>
        )}
        <h1 className="text-foreground font-display text-5xl tracking-tight text-balance sm:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg text-balance">
            {description}
          </p>
        )}
        {children}
      </Reveal>
    </div>
  );
}
