"use client";

import { useCallback } from "react";

import { CloseDealGame } from "@/components/minigame/games/close-deal";
import { GameSection } from "@/components/site/game-section";

/** CLOSE THE DEAL — one-button timing, on the Contact page. */
export function CloseDealSection() {
  const create = useCallback(() => new CloseDealGame(), []);

  return (
    <GameSection
      gameId="close-deal"
      anchorId="close-deal"
      eyebrow="Bonus stage"
      heading="Close a deal with me"
      blurb="One button. Stop the meter in the green and you've got a yes. This is the stat I'm grinding in real life, so go easy on me."
      cabinetTitle="CLOSE THE DEAL"
      leftSprite="diamond"
      rightSprite="crown"
      create={create}
      label="Close The Deal, a timing game. Press space to stop the meter in the target zone."
      hint={{
        desktop: "Space to stop the meter. P to pause.",
        touch: "Tap to stop the meter.",
      }}
      accent="cyan"
      className="border-border/60 border-t"
    />
  );
}
