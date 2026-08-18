import {
  Coins,
  Crown,
  Diamond,
  Gamepad2,
  Ghost,
  Heart,
  Key,
  type LucideIcon,
  Rocket,
  Save,
  Skull,
  Star,
  Trophy,
} from "lucide-react";

/**
 * Maps the short icon keys used in the achievements catalog
 * (src/lib/arcade/achievements.ts) to a concrete lucide-react icon.
 */
export const ARCADE_ICON_MAP: Record<string, LucideIcon> = {
  coin: Coins,
  trophy: Trophy,
  star: Star,
  heart: Heart,
  ghost: Ghost,
  controller: Gamepad2,
  floppy: Save,
  crown: Crown,
  rocket: Rocket,
  key: Key,
  skull: Skull,
  diamond: Diamond,
};

export function getArcadeIcon(key: string): LucideIcon {
  return ARCADE_ICON_MAP[key] ?? Trophy;
}
