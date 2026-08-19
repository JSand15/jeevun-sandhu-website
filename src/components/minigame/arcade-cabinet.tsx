"use client";

import { Cabinet } from "./cabinet";
import { ShipItGame } from "./ship-it-game";

interface ArcadeCabinetProps {
  onScore?: (score: number) => void;
  onGameOver?: (score: number, isHighScore: boolean) => void;
  className?: string;
  autoFocus?: boolean;
}

/** SHIP IT in its cabinet. */
export function ArcadeCabinet({
  onScore,
  onGameOver,
  className,
  autoFocus,
}: ArcadeCabinetProps) {
  return (
    <Cabinet
      title="SHIP IT"
      leftSprite="rocket"
      rightSprite="coin"
      footerRight="BEAT MY SCORE"
      className={className}
    >
      <ShipItGame
        onScore={onScore}
        onGameOver={onGameOver}
        autoFocus={autoFocus}
      />
    </Cabinet>
  );
}
