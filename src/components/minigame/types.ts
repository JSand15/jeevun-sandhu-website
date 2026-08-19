/**
 * Shared contract for every mini-game on the site.
 *
 * Engines are pure logic: no React, no DOM beyond the 2D context handed to
 * `init`. They render at a fixed low internal resolution which the host
 * component scales up with smoothing disabled — that is what produces the
 * 8-bit look.
 */

export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 180;

export type GameState = "title" | "playing" | "paused" | "gameover";

export type GameInput =
  /** Space / Enter / tap — the one-button action. */
  | { type: "primary" }
  | { type: "start" }
  | { type: "pause" }
  | { type: "resume" }
  /** Held direction for games driven by arrow keys. */
  | { type: "move"; dir: -1 | 0 | 1 }
  /** A click or tap, in game coordinates (0..GAME_WIDTH, 0..GAME_HEIGHT). */
  | { type: "point"; x: number; y: number };

export type MiniGameEvent =
  | { type: "score"; value: number }
  | { type: "gameover"; score: number; isHighScore: boolean }
  | { type: "good" }
  | { type: "bad" };

export interface MiniGame {
  init(ctx: CanvasRenderingContext2D): void;
  /** Advance by real elapsed seconds. Implementations use a fixed timestep. */
  update(dt: number): void;
  render(): void;
  input(action: GameInput): void;
  reset(): void;
  pause(): void;
  resume(): void;
  onEvent: ((event: MiniGameEvent) => void) | null;
  readonly state: GameState;
  readonly score: number;
  readonly highScore: number;
}

/** Shared 8-bit palette so every game looks like it came from one console. */
export const PALETTE = {
  sky: "#0d1220",
  skyLow: "#1a2338",
  ground: "#0a0e18",
  gold: "#f5c542",
  goldDark: "#7a4f10",
  white: "#e8edf7",
  grey: "#8a93a8",
  greyDark: "#3a4560",
  red: "#d23c4a",
  green: "#4ade80",
  cyan: "#3fd8e8",
  purple: "#a855f7",
  blue: "#3b82f6",
  ink: "#2b2f3a",
} as const;

/** Reads a persisted high score, tolerating private mode and corrupt values. */
export function loadHighScore(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(key);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(key: string, score: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, String(score));
  } catch {
    /* private mode — the score just won't persist */
  }
}
