export type AchievementId =
  | "first-contact"
  | "scroll-master"
  | "explorer"
  | "completionist"
  | "code-peeker"
  | "konami"
  | "night-owl"
  | "gamer"
  | "high-scorer"
  | "recruiter"
  | "speedrun"
  | "collector"
  | "tycoon";

export type SfxName =
  | "blip"
  | "coin"
  | "levelup"
  | "achievement"
  | "start"
  | "error"
  | "select";

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  xp: number;
  secret?: boolean;
}

export interface ArcadeState {
  xp: number;
  unlocked: AchievementId[];
  soundEnabled: boolean;
  visited: string[];
  highScore: number;
  konami: boolean;
  /** Ids of the mini-games the visitor has actually played a round of. */
  gamesPlayed: string[];
}
