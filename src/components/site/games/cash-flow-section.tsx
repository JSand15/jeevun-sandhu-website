"use client";

import { useCallback } from "react";

import { CashFlowGame } from "@/components/minigame/games/cash-flow";
import { GameSection } from "@/components/site/game-section";

/** CASH FLOW — the catcher, on the About page. */
export function CashFlowSection() {
  const create = useCallback(() => new CashFlowGame(), []);

  return (
    <GameSection
      gameId="cash-flow"
      anchorId="cash-flow"
      eyebrow="Bonus stage"
      heading="Run my cash flow"
      blurb="Catch the revenue, dodge the bills. This is basically what bootstrapping feels like, except the real version has no extra lives."
      cabinetTitle="CASH FLOW"
      leftSprite="coin"
      rightSprite="chest"
      create={create}
      label="Cash Flow, a catching game. Use the left and right arrow keys to move the tray."
      hint={{
        desktop: "← → or A/D to move. Space to start. P to pause.",
        touch: "Tap the left or right half of the screen to move.",
      }}
      usesArrows
      accent="gold"
      className="border-border/60 border-t"
    />
  );
}
