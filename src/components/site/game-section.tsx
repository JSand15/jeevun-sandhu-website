"use client";

import { useCallback, useRef } from "react";

import { useArcade } from "@/components/arcade";
import { Cabinet } from "@/components/minigame/cabinet";
import { GameCanvas } from "@/components/minigame/game-canvas";
import type { MiniGame } from "@/components/minigame/types";
import type { PixelSpriteName } from "@/components/pixel/pixel-sprite";
import { PixelHeading } from "@/components/pixel/pixel-heading";
import { Reveal } from "@/components/scroll";

interface GameSectionProps {
  /** Stable id used to track which games the visitor has played. */
  gameId: string;
  /** Anchor id for the section element. */
  anchorId: string;
  eyebrow: string;
  heading: string;
  blurb: string;
  cabinetTitle: string;
  leftSprite?: PixelSpriteName;
  rightSprite?: PixelSpriteName;
  footerRight?: string;
  create: () => MiniGame;
  label: string;
  hint: { desktop: string; touch: string };
  usesArrows?: boolean;
  usesPointer?: boolean;
  /** XP is granted per this many points, capped so it can't be farmed. */
  xpPerPoints?: number;
  accent?: "gold" | "cyan" | "magenta";
  className?: string;
}

const MAX_XP_MILESTONES = 8;
const XP_PER_MILESTONE = 15;

/**
 * A playable section. Handles the arcade framing and feeds scores back into
 * the site-wide XP and trophy system.
 */
export function GameSection({
  gameId,
  anchorId,
  eyebrow,
  heading,
  blurb,
  cabinetTitle,
  leftSprite,
  rightSprite,
  footerRight,
  create,
  label,
  hint,
  usesArrows,
  usesPointer,
  xpPerPoints = 250,
  accent = "cyan",
  className,
}: GameSectionProps) {
  const { awardXp, unlock, markGamePlayed, play } = useArcade();
  const lastMilestone = useRef(0);

  const handleScore = useCallback(
    (score: number) => {
      const milestone = Math.floor(score / xpPerPoints);
      if (milestone > lastMilestone.current && milestone <= MAX_XP_MILESTONES) {
        lastMilestone.current = milestone;
        awardXp(XP_PER_MILESTONE);
      }
    },
    [awardXp, xpPerPoints],
  );

  const handleGameOver = useCallback(
    (score: number, isHighScore: boolean) => {
      lastMilestone.current = 0;
      markGamePlayed(gameId);
      if (isHighScore && score > 0) unlock("high-scorer");
      else play("error");
    },
    [gameId, markGamePlayed, unlock, play],
  );

  return (
    <section id={anchorId} className={className}>
      <div className="container-wide py-20 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <PixelHeading as="p" className="text-[9px]" accent={accent}>
            {eyebrow}
          </PixelHeading>
          <h2 className="text-foreground font-display mt-3 text-4xl tracking-tight sm:text-5xl">
            {heading}
          </h2>
          <p className="text-muted-foreground mt-4 text-balance">{blurb}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <Cabinet
            title={cabinetTitle}
            leftSprite={leftSprite}
            rightSprite={rightSprite}
            footerRight={footerRight ?? "BEAT MY SCORE"}
          >
            <GameCanvas
              create={create}
              onScore={handleScore}
              onGameOver={handleGameOver}
              label={label}
              hint={hint}
              usesArrows={usesArrows}
              usesPointer={usesPointer}
            />
          </Cabinet>
        </Reveal>
      </div>
    </section>
  );
}
