"use client";

import { useCallback, useRef } from "react";

import { useArcade } from "@/components/arcade";
import { PixelHeading } from "@/components/pixel/pixel-heading";
import { Reveal } from "@/components/scroll";
import { ArcadeCabinet } from "@/components/minigame";

/** The playable section. Scores feed back into the site-wide XP system. */
export function ArcadeSection() {
  const { awardXp, unlock, setHighScore, highScore, markGamePlayed, play } =
    useArcade();
  const lastMilestone = useRef(0);

  const handleScore = useCallback(
    (score: number) => {
      // Award XP once per 250 points, capped so it can't be farmed forever.
      const milestone = Math.floor(score / 250);
      if (milestone > lastMilestone.current && milestone <= 8) {
        lastMilestone.current = milestone;
        awardXp(15);
      }
    },
    [awardXp],
  );

  const handleGameOver = useCallback(
    (score: number, isHighScore: boolean) => {
      lastMilestone.current = 0;
      markGamePlayed("ship-it");
      if (score > highScore) setHighScore(score);
      if (isHighScore && score > 0) {
        unlock("high-scorer");
      } else {
        play("error");
      }
    },
    [highScore, setHighScore, unlock, markGamePlayed, play],
  );

  return (
    <section id="arcade" className="border-border/60 border-t">
      <div className="container-wide py-20 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <PixelHeading as="p" className="text-[9px]" accent="cyan">
            Bonus stage
          </PixelHeading>
          <h2 className="text-foreground font-display mt-3 text-4xl tracking-tight sm:text-5xl">
            I built you a game
          </h2>
          <p className="text-muted-foreground mt-4 text-balance">
            Jump the bugs, dodge the scope creep, collect the coins. Beating my
            high score unlocks a trophy. Nobody said a portfolio has to be
            boring.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <ArcadeCabinet onScore={handleScore} onGameOver={handleGameOver} />
        </Reveal>
      </div>
    </section>
  );
}
