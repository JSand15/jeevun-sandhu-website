"use client";

import { useCallback } from "react";

import { BugSquashGame } from "@/components/minigame/games/bug-squash";
import { GameSection } from "@/components/site/game-section";

/** BUG SQUASH — whack-a-mole, on the Projects page. */
export function BugSquashSection() {
  const create = useCallback(() => new BugSquashGame(), []);

  return (
    <GameSection
      gameId="bug-squash"
      anchorId="bug-squash"
      eyebrow="Bonus stage"
      heading="Squash my bugs"
      blurb="Click the bugs before they get away. Leave the features alone. Ship a regression and it costs you."
      cabinetTitle="BUG SQUASH"
      leftSprite="skull"
      rightSprite="star"
      create={create}
      label="Bug Squash, a whack-a-mole game. Click the bugs, avoid clicking features."
      hint={{
        desktop: "Click the bugs. Space to start. P to pause.",
        touch: "Tap the bugs. Tap to start.",
      }}
      usesPointer
      accent="magenta"
      className="border-border/60 border-t"
    />
  );
}
