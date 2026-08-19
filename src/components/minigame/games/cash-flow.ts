/**
 * CASH FLOW — a business-themed catcher.
 *
 * Slide a cash tray along the bottom of the screen: catch falling revenue
 * (coins, banknotes, the rare invoice) and dodge falling expenses. Framework
 * free on purpose — no React, no DOM beyond the 2D context handed to init().
 * Renders at the shared 320x180 internal resolution; the host component
 * scales it up with smoothing disabled for the 8-bit look.
 *
 * Physics run on a fixed timestep accumulator so the game behaves
 * identically at 60Hz, 120Hz and 144Hz.
 */

import {
  GAME_HEIGHT,
  GAME_WIDTH,
  loadHighScore,
  saveHighScore,
  PALETTE,
  type GameInput,
  type GameState,
  type MiniGame,
  type MiniGameEvent,
} from "../types";

const STEP = 1 / 60;
/** Never simulate more than this in one frame (guards against tab-restore jumps). */
const MAX_FRAME_TIME = 0.25;

const HIGH_SCORE_KEY = "jeevun-cashflow-highscore";

// --- Tray (player) ---------------------------------------------------------

const TRAY_W = 34;
const TRAY_H = 12;
const TRAY_MARGIN = 4;
const TRAY_ACCEL = 900; // px/s^2 while a direction is held
const TRAY_FRICTION = 1100; // px/s^2 once released
const TRAY_MAX_SPEED = 190; // px/s

// --- Floor / catch line ------------------------------------------------------

const FLOOR_H = 16;
const FLOOR_Y = GAME_HEIGHT - FLOOR_H;
const TRAY_Y = FLOOR_Y - TRAY_H;

// --- Falling items -----------------------------------------------------------

const START_FALL_SPEED = 48;
const MAX_FALL_SPEED = 132;
/** Fall speed ramps on a curve that flattens, so it stays playable. */
const FALL_RAMP = 6.5;
const INVOICE_SPEED_MULT = 1.3;

const SPAWN_INTERVAL_START = 0.95;
const SPAWN_INTERVAL_MIN = 0.46;

const EXPENSE_SPACING_ATTEMPTS = 6;
/** Centre-to-centre minimum spacing between two live expenses. See fairness comment below. */
const MIN_GAP_X = 70;
const MAX_ACTIVE_EXPENSES = 3;

const START_LIVES = 3;
const HIT_INVULN = 1.1;
const TRAY_FLASH_TIME = 0.3;

/*
 * FAIRNESS GUARANTEE — why a single expense can never be an unavoidable hit:
 *
 * An item spawns just above the screen (y = -h) and can only touch the tray
 * once its bottom edge reaches the tray's top edge, TRAY_Y px below. So every
 * item gets exactly TRAY_Y (152px) of fall before it's a threat. At the
 * fastest ramp tier (MAX_FALL_SPEED = 132px/s) that's a worst case of:
 *   t_fall = 152 / 132 ≈ 1.15s
 *
 * The tray accelerates from a dead stop at TRAY_ACCEL and caps at
 * TRAY_MAX_SPEED, so in the worst case — starting completely at rest right
 * as the item spawns — the furthest it can travel in that time is:
 *   t_accel = 190 / 900        ≈ 0.21s   (time to reach max speed)
 *   d_accel = 0.5 * 900 * 0.21^2 ≈ 20px  (distance covered while accelerating)
 *   d_max   = 20 + 190 * (1.15 - 0.21)  ≈ 199px  (plus cruising the rest of the way)
 *
 * The player only needs to clear a footprint of about
 * (TRAY_W + widest item) / 2 + a small margin — roughly 35px for the 16px
 * expense — to stop overlapping it. 199px of reachable travel against a
 * 35px requirement is a ~5.7x margin, which comfortably absorbs human
 * reaction time and even a worst case where the tray starts by drifting the
 * wrong way first. So one expense, on its own, is always dodgeable no
 * matter where the tray currently sits or how it's currently moving.
 *
 * That leaves the other way to cheat the player: walling off the whole
 * playfield with several expenses at once so no safe gap exists anywhere.
 * isExpenseSpacingOk() refuses to place a new expense within MIN_GAP_X
 * (70px) of another still-falling expense, and spawn() caps how many
 * expenses can be alive at once (MAX_ACTIVE_EXPENSES). With items spaced at
 * least 70px apart and each only 16px wide, every gap between two expenses
 * is at least 70 - 16 = 54px — comfortably more than the tray's 34px width —
 * so a fully safe lane always exists. If no legal spot can be found after a
 * few tries, the spawner falls back to a revenue item instead of ever
 * forcing an unfair board.
 */

type ItemKind = "coin" | "banknote" | "expense" | "invoice";

interface ItemDef {
  w: number;
  h: number;
  color: string;
  value: number;
}

// All dimensions kept even so pixel-art fill rects land on whole pixels.
const ITEM_DEFS: Record<ItemKind, ItemDef> = {
  coin: { w: 10, h: 10, color: PALETTE.gold, value: 10 },
  banknote: { w: 14, h: 10, color: PALETTE.green, value: 25 },
  expense: { w: 16, h: 10, color: PALETTE.red, value: 0 },
  invoice: { w: 10, h: 14, color: PALETTE.cyan, value: 50 },
};

interface FallingItem {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  kind: ItemKind;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Popup {
  x: number;
  y: number;
  vy: number;
  life: number;
  text: string;
  color: string;
}

function moveToward(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

export class CashFlowGame implements MiniGame {
  private ctx: CanvasRenderingContext2D | null = null;
  private accumulator = 0;

  state: GameState = "title";
  score = 0;
  highScore = 0;

  onEvent: ((event: MiniGameEvent) => void) | null = null;

  private lives = START_LIVES;
  private runTime = 0;
  /** Advances every frame regardless of state so the background always breathes. */
  private scrollTime = 0;

  private trayX = (GAME_WIDTH - TRAY_W) / 2;
  private trayVX = 0;
  private inputDir: -1 | 0 | 1 = 0;
  private invuln = 0;
  private trayFlash = 0;

  private items: FallingItem[] = [];
  private particles: Particle[] = [];
  private popups: Popup[] = [];

  private spawnTimer = 0.6;
  private shake = 0;

  init(ctx: CanvasRenderingContext2D): void {
    this.ctx = ctx;
    this.highScore = loadHighScore(HIGH_SCORE_KEY);
    this.reset();
  }

  reset(): void {
    this.score = 0;
    this.lives = START_LIVES;
    this.runTime = 0;
    this.trayX = (GAME_WIDTH - TRAY_W) / 2;
    this.trayVX = 0;
    this.inputDir = 0;
    this.invuln = 0;
    this.trayFlash = 0;
    this.items = [];
    this.particles = [];
    this.popups = [];
    this.spawnTimer = 0.6;
    this.shake = 0;
    this.accumulator = 0;
  }

  input(action: GameInput): void {
    switch (action.type) {
      case "start":
        if (this.state === "title" || this.state === "gameover") {
          this.reset();
          this.state = "playing";
        } else if (this.state === "paused") {
          this.state = "playing";
        }
        break;
      case "primary":
        if (this.state === "title" || this.state === "gameover") {
          this.reset();
          this.state = "playing";
        }
        // Steered by arrows while playing — primary does nothing mid-run.
        break;
      case "pause":
        if (this.state === "playing") this.state = "paused";
        break;
      case "resume":
        if (this.state === "paused") this.state = "playing";
        break;
      case "move":
        this.inputDir = action.dir;
        break;
      case "point":
        if (this.state === "title" || this.state === "gameover") {
          this.reset();
          this.state = "playing";
        }
        break;
    }
  }

  pause(): void {
    this.input({ type: "pause" });
  }

  resume(): void {
    this.input({ type: "resume" });
  }

  /** Advance by real elapsed seconds, stepping the sim at a fixed rate. */
  update(dt: number): void {
    const clamped = Math.min(dt, MAX_FRAME_TIME);
    this.accumulator += clamped;
    while (this.accumulator >= STEP) {
      this.step(STEP);
      this.accumulator -= STEP;
    }
  }

  private step(dt: number): void {
    this.scrollTime += dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 60);
    if (this.trayFlash > 0) this.trayFlash = Math.max(0, this.trayFlash - dt);
    if (this.invuln > 0) this.invuln = Math.max(0, this.invuln - dt);
    this.stepParticles(dt);
    this.stepPopups(dt);

    if (this.state !== "playing") return;

    this.runTime += dt;
    this.stepTray(dt);

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) this.spawn();

    this.stepItems(dt);
    this.handleCollisions();
  }

  private currentFallSpeed(): number {
    return (
      START_FALL_SPEED +
      (MAX_FALL_SPEED - START_FALL_SPEED) * (1 - Math.exp(-this.runTime / FALL_RAMP))
    );
  }

  private stepTray(dt: number): void {
    const target = this.inputDir * TRAY_MAX_SPEED;
    this.trayVX =
      this.inputDir !== 0
        ? moveToward(this.trayVX, target, TRAY_ACCEL * dt)
        : moveToward(this.trayVX, 0, TRAY_FRICTION * dt);

    this.trayX += this.trayVX * dt;

    const minX = TRAY_MARGIN;
    const maxX = GAME_WIDTH - TRAY_MARGIN - TRAY_W;
    if (this.trayX < minX) {
      this.trayX = minX;
      this.trayVX = 0;
    } else if (this.trayX > maxX) {
      this.trayX = maxX;
      this.trayVX = 0;
    }
  }

  private randomX(w: number): number {
    const margin = 8;
    return margin + Math.random() * (GAME_WIDTH - 2 * margin - w);
  }

  private activeExpenseCount(): number {
    return this.items.reduce((n, it) => n + (it.kind === "expense" ? 1 : 0), 0);
  }

  /** See the fairness comment near the top of the file. */
  private isExpenseSpacingOk(x: number, w: number): boolean {
    const center = x + w / 2;
    for (const it of this.items) {
      if (it.kind !== "expense") continue;
      if (it.y > TRAY_Y) continue; // already past the catch line, no longer a hazard
      const otherCenter = it.x + it.w / 2;
      if (Math.abs(center - otherCenter) < MIN_GAP_X) return false;
    }
    return true;
  }

  private spawn(): void {
    const roll = Math.random();
    let kind: ItemKind;
    if (roll < 0.05) kind = "invoice";
    else if (roll < 0.3) kind = "expense";
    else if (roll < 0.55) kind = "banknote";
    else kind = "coin";

    let x = this.randomX(ITEM_DEFS[kind].w);

    if (kind === "expense") {
      if (this.activeExpenseCount() >= MAX_ACTIVE_EXPENSES) {
        // Board's already busy with hazards — spawn revenue instead.
        kind = "coin";
        x = this.randomX(ITEM_DEFS[kind].w);
      } else {
        let placed = false;
        for (let attempt = 0; attempt < EXPENSE_SPACING_ATTEMPTS; attempt += 1) {
          const candidate = this.randomX(ITEM_DEFS.expense.w);
          if (this.isExpenseSpacingOk(candidate, ITEM_DEFS.expense.w)) {
            x = candidate;
            placed = true;
            break;
          }
        }
        if (!placed) {
          // No fair spot right now — never force an unfair board.
          kind = "coin";
          x = this.randomX(ITEM_DEFS[kind].w);
        }
      }
    }

    const def = ITEM_DEFS[kind];
    const fallSpeed = this.currentFallSpeed();
    const vy = kind === "invoice" ? fallSpeed * INVOICE_SPEED_MULT : fallSpeed;

    this.items.push({ x, y: -def.h, w: def.w, h: def.h, vy, kind });

    const t = Math.min(1, this.runTime / FALL_RAMP);
    const interval = SPAWN_INTERVAL_MIN + (SPAWN_INTERVAL_START - SPAWN_INTERVAL_MIN) * (1 - t);
    this.spawnTimer = interval * (0.75 + Math.random() * 0.5);
  }

  private stepItems(dt: number): void {
    for (const it of this.items) it.y += it.vy * dt;
  }

  private handleCollisions(): void {
    const trayLeft = this.trayX;
    const trayRight = this.trayX + TRAY_W;
    const trayTop = TRAY_Y;
    const trayBottom = TRAY_Y + TRAY_H;

    const remaining: FallingItem[] = [];
    for (const it of this.items) {
      if (it.y > GAME_HEIGHT) continue; // fell past the floor — culled, no penalty

      const overlap =
        it.x < trayRight && it.x + it.w > trayLeft && it.y + it.h > trayTop && it.y < trayBottom;

      if (overlap) {
        if (it.kind === "expense") {
          if (this.invuln > 0) {
            remaining.push(it); // invulnerable — let it harmlessly pass through
            continue;
          }
          this.onExpenseHit(it);
          continue; // consumed on hit
        }
        this.onRevenueCatch(it);
        continue; // consumed on catch
      }

      remaining.push(it);
    }
    this.items = remaining;
  }

  private onRevenueCatch(it: FallingItem): void {
    const def = ITEM_DEFS[it.kind];
    this.score += def.value;
    this.onEvent?.({ type: "score", value: this.score });
    this.onEvent?.({ type: "good" });

    const cx = it.x + it.w / 2;
    const cy = it.y + it.h / 2;
    this.burst(cx, cy, def.color, it.kind === "invoice" ? 10 : 6);
    this.popups.push({
      x: cx,
      y: it.y,
      vy: -34,
      life: 0.7,
      text: `+${def.value}`,
      color: def.color,
    });
  }

  private onExpenseHit(it: FallingItem): void {
    this.lives -= 1;
    this.invuln = HIT_INVULN;
    this.trayFlash = TRAY_FLASH_TIME;
    this.shake = 8;
    this.burst(it.x + it.w / 2, it.y + it.h / 2, PALETTE.red, 12);
    this.onEvent?.({ type: "bad" });

    if (this.lives <= 0) {
      const isHighScore = this.score > this.highScore;
      if (isHighScore) {
        this.highScore = this.score;
        saveHighScore(HIGH_SCORE_KEY, this.score);
      }
      this.state = "gameover";
      this.onEvent?.({ type: "gameover", score: this.score, isHighScore });
    }
  }

  private burst(x: number, y: number, color: string, n: number): void {
    for (let i = 0; i < n; i += 1) {
      const a = (Math.PI * 2 * i) / n;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * (30 + Math.random() * 40),
        vy: Math.sin(a) * (30 + Math.random() * 40) - 20,
        life: 0.5,
        color,
      });
    }
  }

  private stepParticles(dt: number): void {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private stepPopups(dt: number): void {
    for (const p of this.popups) {
      p.y += p.vy * dt;
      p.vy += 40 * dt; // ease off the rise
      p.life -= dt;
    }
    this.popups = this.popups.filter((p) => p.life > 0);
  }

  // ---------------------------------------------------------------- rendering

  render(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.save();

    if (this.shake > 0) {
      ctx.translate(
        Math.round((Math.random() - 0.5) * this.shake),
        Math.round((Math.random() - 0.5) * this.shake),
      );
    }

    this.drawSky(ctx);
    this.drawSkyline(ctx);
    this.drawFloor(ctx);
    this.drawItems(ctx);
    this.drawTray(ctx);
    this.drawParticles(ctx);
    this.drawPopups(ctx);

    ctx.restore();

    this.drawHud(ctx);
    this.drawOverlay(ctx);
  }

  private drawSky(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = PALETTE.sky;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = PALETTE.skyLow;
    ctx.fillRect(0, 92, GAME_WIDTH, FLOOR_Y - 92);
  }

  /** Bank / office skyline: three parallax layers with lit windows. */
  private drawSkyline(ctx: CanvasRenderingContext2D): void {
    const layers = [
      { speed: 3, alpha: 0.35, base: FLOOR_Y - 4, min: 16, max: 44, w: 24, seed: 3 },
      { speed: 7, alpha: 0.55, base: FLOOR_Y - 2, min: 14, max: 34, w: 19, seed: 7 },
      { speed: 13, alpha: 0.85, base: FLOOR_Y, min: 12, max: 26, w: 15, seed: 11 },
    ];

    for (const l of layers) {
      const scroll = this.scrollTime * l.speed;
      const count = Math.ceil(GAME_WIDTH / l.w) + 2;
      for (let i = 0; i < count; i += 1) {
        const idx = Math.floor(scroll / l.w) + i;
        // Deterministic pseudo-random height so buildings don't flicker between frames.
        const n = Math.abs(Math.sin(idx * l.seed) * 10000) % 1;
        const h = l.min + Math.floor(n * (l.max - l.min));
        const x = Math.floor(idx * l.w - scroll);

        ctx.fillStyle = `rgba(58, 69, 96, ${l.alpha})`;
        ctx.fillRect(x, l.base - h, l.w - 3, h);

        ctx.fillStyle = PALETTE.gold;
        for (let wy = l.base - h + 3; wy < l.base - 3; wy += 5) {
          for (let wx = x + 2; wx < x + l.w - 6; wx += 4) {
            if ((wx * 7 + wy * 13 + idx * 5) % 11 < 3) ctx.fillRect(wx, wy, 1, 2);
          }
        }
      }
    }
  }

  /** A ledger-grid floor: subtle scrolling rows and columns like ruled paper. */
  private drawFloor(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = PALETTE.ground;
    ctx.fillRect(0, FLOOR_Y, GAME_WIDTH, GAME_HEIGHT - FLOOR_Y);
    ctx.fillStyle = PALETTE.goldDark;
    ctx.fillRect(0, FLOOR_Y, GAME_WIDTH, 1);

    ctx.fillStyle = PALETTE.greyDark;
    const offset = (this.scrollTime * 14) % 16;
    for (let x = -offset; x < GAME_WIDTH; x += 16) {
      ctx.fillRect(Math.floor(x), FLOOR_Y + 3, 1, GAME_HEIGHT - FLOOR_Y - 5);
    }
    for (let y = FLOOR_Y + 6; y < GAME_HEIGHT; y += 5) {
      ctx.fillRect(0, y, GAME_WIDTH, 1);
    }
  }

  private drawItems(ctx: CanvasRenderingContext2D): void {
    for (const it of this.items) {
      const x = Math.floor(it.x);
      const y = Math.floor(it.y);

      switch (it.kind) {
        case "coin":
          ctx.fillStyle = PALETTE.goldDark;
          ctx.fillRect(x, y, it.w, it.h);
          ctx.fillStyle = PALETTE.gold;
          ctx.fillRect(x + 1, y + 1, it.w - 2, it.h - 2);
          ctx.fillStyle = PALETTE.white;
          ctx.fillRect(x + it.w / 2 - 1, y + it.h / 2 - 1, 2, 2);
          break;
        case "banknote":
          ctx.fillStyle = "#1c6b3f";
          ctx.fillRect(x, y, it.w, it.h);
          ctx.fillStyle = PALETTE.green;
          ctx.fillRect(x + 1, y + 1, it.w - 2, it.h - 2);
          ctx.fillStyle = "#1c6b3f";
          ctx.fillRect(x + it.w / 2 - 1, y + 2, 2, it.h - 4);
          break;
        case "expense":
          ctx.fillStyle = "#7a1420";
          ctx.fillRect(x, y, it.w, it.h);
          ctx.fillStyle = PALETTE.red;
          ctx.fillRect(x + 1, y + 1, it.w - 2, it.h - 2);
          ctx.fillStyle = PALETTE.white;
          ctx.fillRect(x + 3, y + it.h / 2 - 1, it.w - 6, 2);
          break;
        case "invoice":
          ctx.fillStyle = "#1d7a86";
          ctx.fillRect(x, y, it.w, it.h);
          ctx.fillStyle = PALETTE.cyan;
          ctx.fillRect(x + 1, y + 1, it.w - 2, it.h - 2);
          ctx.fillStyle = PALETTE.ink;
          ctx.fillRect(x + 2, y + 3, it.w - 4, 1);
          ctx.fillRect(x + 2, y + 6, it.w - 4, 1);
          ctx.fillRect(x + 2, y + 9, it.w - 6, 1);
          break;
      }
    }
  }

  private drawTray(ctx: CanvasRenderingContext2D): void {
    // Blink while invulnerable.
    if (this.invuln > 0 && Math.floor(this.invuln * 14) % 2 === 0) return;

    const x = Math.floor(this.trayX);
    const y = TRAY_Y;
    const flashing = this.trayFlash > 0 && Math.floor(this.trayFlash * 30) % 2 === 0;

    ctx.fillStyle = flashing ? PALETTE.white : PALETTE.ink;
    ctx.fillRect(x, y + 2, TRAY_W, TRAY_H - 2);
    ctx.fillStyle = flashing ? PALETTE.red : PALETTE.gold;
    ctx.fillRect(x, y, TRAY_W, 3);
    ctx.fillStyle = PALETTE.goldDark;
    ctx.fillRect(x + 2, y + 5, TRAY_W - 4, 2);
    ctx.fillRect(x + 2, y + 8, TRAY_W - 4, 2);
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      const s = p.life > 0.25 ? 2 : 1;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), s, s);
    }
  }

  private drawPopups(ctx: CanvasRenderingContext2D): void {
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    for (const p of this.popups) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.7));
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, Math.floor(p.x), Math.floor(p.y));
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  }

  private drawHud(ctx: CanvasRenderingContext2D): void {
    ctx.font = "8px monospace";
    ctx.textBaseline = "top";

    ctx.fillStyle = PALETTE.gold;
    ctx.fillText(`SCORE ${this.score}`, 6, 6);

    ctx.fillStyle = PALETTE.grey;
    const hi = `HI ${Math.max(this.highScore, this.score)}`;
    ctx.fillText(hi, GAME_WIDTH - 6 - ctx.measureText(hi).width, 6);

    for (let i = 0; i < START_LIVES; i += 1) {
      ctx.fillStyle = i < this.lives ? PALETTE.red : PALETTE.greyDark;
      const hx = 6 + i * 10;
      ctx.fillRect(hx, 18, 2, 2);
      ctx.fillRect(hx + 4, 18, 2, 2);
      ctx.fillRect(hx, 20, 6, 2);
      ctx.fillRect(hx + 1, 22, 4, 1);
      ctx.fillRect(hx + 2, 23, 2, 1);
    }
  }

  private drawOverlay(ctx: CanvasRenderingContext2D): void {
    if (this.state === "playing") return;

    ctx.fillStyle = "rgba(5,8,15,0.78)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.textAlign = "center";

    const cx = GAME_WIDTH / 2;

    if (this.state === "title") {
      ctx.fillStyle = PALETTE.gold;
      ctx.font = "16px monospace";
      ctx.fillText("CASH FLOW", cx, 58);
      ctx.fillStyle = PALETTE.white;
      ctx.font = "8px monospace";
      ctx.fillText("CATCH THE REVENUE, DODGE THE BILLS.", cx, 86);
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = PALETTE.cyan;
        ctx.fillText("PRESS SPACE", cx, 110);
      }
    } else if (this.state === "paused") {
      ctx.fillStyle = PALETTE.gold;
      ctx.font = "12px monospace";
      ctx.fillText("PAUSED", cx, 80);
    } else if (this.state === "gameover") {
      ctx.fillStyle = PALETTE.red;
      ctx.font = "14px monospace";
      ctx.fillText("GAME OVER", cx, 52);
      ctx.fillStyle = PALETTE.white;
      ctx.font = "8px monospace";
      ctx.fillText(`SCORE ${this.score}`, cx, 78);
      ctx.fillText(`BEST  ${this.highScore}`, cx, 90);
      if (
        this.score >= this.highScore &&
        this.score > 0 &&
        Math.floor(Date.now() / 400) % 2 === 0
      ) {
        ctx.fillStyle = PALETTE.gold;
        ctx.fillText("NEW HIGH SCORE!", cx, 106);
      }
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = PALETTE.cyan;
        ctx.fillText("PRESS SPACE TO RETRY", cx, 124);
      }
    }

    ctx.textAlign = "left";
  }
}
