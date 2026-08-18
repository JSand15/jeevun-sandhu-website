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
  | "collector";

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
}
