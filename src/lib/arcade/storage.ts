import type { AchievementId, ArcadeState } from "./types";

const STORAGE_KEY = "jeevun-arcade-v1";

export const DEFAULT_STATE: ArcadeState = {
  xp: 0,
  unlocked: [],
  soundEnabled: false,
  visited: [],
  highScore: 0,
  konami: false,
  gamesPlayed: [],
};

function isAchievementIdArray(value: unknown): value is AchievementId[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function sanitize(raw: unknown): ArcadeState {
  if (typeof raw !== "object" || raw === null) {
    return { ...DEFAULT_STATE };
  }

  const parsed = raw as Partial<ArcadeState>;

  return {
    xp: typeof parsed.xp === "number" && Number.isFinite(parsed.xp) ? parsed.xp : DEFAULT_STATE.xp,
    unlocked: isAchievementIdArray(parsed.unlocked) ? parsed.unlocked : DEFAULT_STATE.unlocked,
    soundEnabled:
      typeof parsed.soundEnabled === "boolean" ? parsed.soundEnabled : DEFAULT_STATE.soundEnabled,
    visited: isStringArray(parsed.visited) ? parsed.visited : DEFAULT_STATE.visited,
    highScore:
      typeof parsed.highScore === "number" && Number.isFinite(parsed.highScore)
        ? parsed.highScore
        : DEFAULT_STATE.highScore,
    konami: typeof parsed.konami === "boolean" ? parsed.konami : DEFAULT_STATE.konami,
    gamesPlayed: isStringArray(parsed.gamesPlayed)
      ? parsed.gamesPlayed
      : DEFAULT_STATE.gamesPlayed,
  };
}

export function loadState(): ArcadeState {
  if (typeof window === "undefined") {
    return { ...DEFAULT_STATE };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return sanitize(parsed);
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: ArcadeState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // private browsing / storage disabled — fail silently
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
