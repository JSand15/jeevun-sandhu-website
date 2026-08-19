/**
 * BUG SQUASH — a whack-a-mole game themed on shipping software.
 *
 * Framework-free on purpose: no React, no DOM beyond the 2D context handed
 * to `init`. Renders at the shared 320x180 internal resolution (see
 * ../types) which the host scales up with smoothing disabled for the 8-bit
 * look. Physics/timers run on a fixed timestep accumulator, matching the
 * house style set by ../engine.ts, so behaviour is identical at 60Hz,
 * 120Hz and 144Hz.
 *
 * Pointer-driven: the host must pass `usesPointer` to its canvas host so
 * clicks/taps arrive as `{ type: "point", x, y }` in game space.
 */

import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PALETTE,
  loadHighScore,
  saveHighScore,
  type MiniGame,
  type GameState,
  type GameInput,
  type MiniGameEvent,
} from "../types";

const STEP = 1 / 60;
/** Never simulate more than this in one frame (guards against tab-restore jumps). */
const MAX_FRAME_TIME = 0.25;

const HIGH_SCORE_KEY = "jeevun-bugsquash-highscore";

const START_LIVES = 3;

// ---------------------------------------------------------------- grid

const COLS = 3;
const ROWS = 3;
const CELL_W = 96;
const CELL_H = 46;
const GAP_X = 8;
const GAP_Y = 6;
const GRID_LEFT = Math.round((GAME_WIDTH - (COLS * CELL_W + (COLS - 1) * GAP_X)) / 2);
const GRID_TOP = 22;
const HEADER_H = 7;

// ---------------------------------------------------------------- difficulty
//
// Spawn interval and up-time both decay from a BASE toward a MIN on an
// exponential-approach curve (same shape as SHIP IT's speed ramp in
// ../engine.ts), so the game gets harder quickly at first and then
// plateaus — it never becomes unwinnable, only tighter.

const BASE_SPAWN_INTERVAL = 1.05;
const MIN_SPAWN_INTERVAL = 0.55;
const SPAWN_RAMP = 22;

const BASE_UPTIME = 1.75;
const MIN_UPTIME = 1.0;
const UPTIME_RAMP = 22;

/** Criticals are always faster than a plain bug — that's their risk. */
const CRITICAL_UPTIME_FACTOR = 0.65;
/** Features linger a little longer, since correctly ignoring one is free. */
const FEATURE_UPTIME_FACTOR = 1.05;

/** A second concurrent pop-up only unlocks once the pace has mostly settled. */
const TWO_UP_SCORE = 150;

/*
 * Winnability guarantee: the tightest single case is a CRITICAL bug at the
 * difficulty floor — up for MIN_UPTIME * CRITICAL_UPTIME_FACTOR = 1.0 * 0.65
 * = 0.65s, opening animation included, and hit-testing covers the *whole*
 * ~96x46px cell rather than the sprite. That's comfortably more than a
 * human reaction (~0.2-0.3s) plus a tap. Two pop-ups are only ever live at
 * once (never more, and never two in the same cell — spawns only pick
 * empty cells), and the spawn-interval floor (0.55s) keeps them from
 * bunching at their uptime floor simultaneously in practice. Because a
 * miss only costs a life rather than ending the run outright, a player
 * never *needs* to sustain more than roughly 1.5 required clicks/second to
 * keep surviving.
 */

type PopKind = "bug" | "critical" | "feature";
type PopPhase = "opening" | "up" | "closing";

interface PopUp {
  cell: number;
  kind: PopKind;
  phase: PopPhase;
  t: number;
  openDur: number;
  upDur: number;
  closeDur: number;
  /** Player already acted on this one (squashed it or clicked a feature). */
  resolved: boolean;
  /** True only for a successful squash — controls the splat vs. plain retreat. */
  hitGood: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Floater {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

interface Marker {
  x: number;
  y: number;
  life: number;
  hit: boolean;
}

interface Led {
  x: number;
  y: number;
  phase: number;
  color: string;
}

export class BugSquashGame implements MiniGame {
  private ctx: CanvasRenderingContext2D | null = null;
  private accumulator = 0;

  state: GameState = "title";
  score = 0;
  highScore = 0;
  onEvent: ((event: MiniGameEvent) => void) | null = null;

  private lives = START_LIVES;
  private runTime = 0;
  private spawnTimer = 0.6;

  // Bounded working sets — every one of these is filtered/culled every step
  // (see stepPopups/stepParticles/stepFloaters/stepMarkers), so none of
  // them grows without bound over a long run.
  private popups: PopUp[] = [];
  private particles: Particle[] = [];
  private floaters: Floater[] = [];
  private markers: Marker[] = [];
  private leds: Led[] = [];

  private shake = 0;
  /** Free-running clock for blink/wiggle animation, independent of runTime. */
  private clock = 0;

  init(ctx: CanvasRenderingContext2D): void {
    this.ctx = ctx;
    this.highScore = loadHighScore(HIGH_SCORE_KEY);
    this.leds = Array.from({ length: 16 }, (_, i) => ({
      x: 4 + ((i * 37) % (GAME_WIDTH - 8)),
      y: 4 + Math.floor(i / 4) * 3,
      phase: (i * 0.37) % 1,
      color: i % 5 === 0 ? PALETTE.red : i % 3 === 0 ? PALETTE.gold : PALETTE.cyan,
    }));
    this.reset();
  }

  reset(): void {
    this.score = 0;
    this.lives = START_LIVES;
    this.runTime = 0;
    this.spawnTimer = 0.6;
    this.popups = [];
    this.particles = [];
    this.floaters = [];
    this.markers = [];
    this.shake = 0;
    this.accumulator = 0;
  }

  input(action: GameInput): void {
    switch (action.type) {
      case "primary":
      case "start":
        if (this.state === "title" || this.state === "gameover") {
          this.reset();
          this.state = "playing";
        } else if (this.state === "paused") {
          this.state = "playing";
        }
        break;
      case "pause":
        if (this.state === "playing") this.state = "paused";
        break;
      case "resume":
        if (this.state === "paused") this.state = "playing";
        break;
      case "point":
        this.handlePoint(action.x, action.y);
        break;
      case "move":
        // BUG SQUASH is pointer-driven only.
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
    this.clock += dt;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 60);
    this.stepParticles(dt);
    this.stepFloaters(dt);
    this.stepMarkers(dt);

    if (this.state !== "playing") return;

    this.runTime += dt;
    this.stepSpawner(dt);
    this.stepPopups(dt);
  }

  // ---------------------------------------------------------- difficulty

  private spawnInterval(): number {
    return (
      MIN_SPAWN_INTERVAL +
      (BASE_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) * Math.exp(-this.runTime / SPAWN_RAMP)
    );
  }

  private baseUptime(): number {
    return MIN_UPTIME + (BASE_UPTIME - MIN_UPTIME) * Math.exp(-this.runTime / UPTIME_RAMP);
  }

  private maxConcurrent(): number {
    return this.score >= TWO_UP_SCORE ? 2 : 1;
  }

  // ------------------------------------------------------------ spawning

  private stepSpawner(dt: number): void {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;

    if (this.popups.length >= this.maxConcurrent()) {
      // At capacity — retry shortly rather than losing pace entirely.
      this.spawnTimer = 0.15;
      return;
    }

    const occupied = new Set(this.popups.map((p) => p.cell));
    const free: number[] = [];
    for (let i = 0; i < COLS * ROWS; i += 1) if (!occupied.has(i)) free.push(i);
    if (free.length === 0) {
      this.spawnTimer = 0.15;
      return;
    }

    const cell = free[Math.floor(Math.random() * free.length)];
    const roll = Math.random();
    const kind: PopKind = roll < 0.16 ? "feature" : roll < 0.36 ? "critical" : "bug";

    const base = this.baseUptime();
    const upDur =
      kind === "critical"
        ? base * CRITICAL_UPTIME_FACTOR
        : kind === "feature"
          ? base * FEATURE_UPTIME_FACTOR
          : base;

    this.popups.push({
      cell,
      kind,
      phase: "opening",
      t: 0,
      openDur: 0.14,
      upDur,
      closeDur: 0.16,
      resolved: false,
      hitGood: false,
    });

    this.spawnTimer = this.spawnInterval();
  }

  // ----------------------------------------------------------- pop-up sim

  private stepPopups(dt: number): void {
    for (const p of this.popups) {
      p.t += dt;
      if (p.phase === "opening" && p.t >= p.openDur) {
        p.phase = "up";
        p.t = 0;
      } else if (p.phase === "up" && !p.resolved && p.t >= p.upDur) {
        // Timed out unclicked. Bugs (and criticals) that escape cost a
        // life; a feature nobody touched is a correct call, no penalty.
        if (p.kind !== "feature") {
          this.loseLife();
          this.addFloater(p.cell, "MISSED!", PALETTE.red);
        }
        p.resolved = true;
        p.phase = "closing";
        p.t = 0;
      }
    }
    // Cull anything that has finished retreating — this is what keeps the
    // pop-up list bounded (at most `maxConcurrent()` entries at any time).
    this.popups = this.popups.filter((p) => !(p.phase === "closing" && p.t >= p.closeDur));
  }

  private handlePoint(x: number, y: number): void {
    if (this.state !== "playing") return;

    let hitAny = false;

    for (const p of this.popups) {
      if (p.resolved) continue;
      const rect = this.cellRect(p.cell);
      // Generous hit-test: the whole cell counts, not the sprite.
      if (x < rect.x - 2 || x > rect.x + rect.w + 2 || y < rect.y - 2 || y > rect.y + rect.h + 2) {
        continue;
      }

      hitAny = true;
      p.resolved = true;
      p.phase = "closing";
      p.t = 0;
      p.closeDur = 0.12;

      const cx = rect.x + rect.w / 2;
      const cy = rect.y + HEADER_H + (rect.h - HEADER_H) / 2;

      if (p.kind === "bug") {
        p.hitGood = true;
        this.score += 10;
        this.onEvent?.({ type: "score", value: this.score });
        this.onEvent?.({ type: "good" });
        this.burst(cx, cy, PALETTE.red, 10);
        this.addFloater(p.cell, "+10", PALETTE.gold);
      } else if (p.kind === "critical") {
        p.hitGood = true;
        this.score += 30;
        this.onEvent?.({ type: "score", value: this.score });
        this.onEvent?.({ type: "good" });
        this.burst(cx, cy, PALETTE.purple, 14);
        this.addFloater(p.cell, "+30", PALETTE.purple);
      } else {
        p.hitGood = false;
        this.onEvent?.({ type: "bad" });
        this.burst(cx, cy, PALETTE.red, 10);
        this.addFloater(p.cell, "REGRESSION!", PALETTE.red);
        this.loseLife();
      }
      break;
    }

    this.markers.push({ x, y, life: 0.22, hit: hitAny });
  }

  private loseLife(): void {
    this.lives -= 1;
    this.shake = 7;
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

  // ------------------------------------------------------------- effects

  private burst(x: number, y: number, color: string, n: number): void {
    for (let i = 0; i < n; i += 1) {
      const a = (Math.PI * 2 * i) / n;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * (24 + Math.random() * 36),
        vy: Math.sin(a) * (24 + Math.random() * 36) - 16,
        life: 0.45,
        maxLife: 0.45,
        color,
      });
    }
  }

  private addFloater(cell: number, text: string, color: string): void {
    const rect = this.cellRect(cell);
    this.floaters.push({
      x: rect.x + rect.w / 2,
      y: rect.y + HEADER_H + 4,
      text,
      color,
      life: 0.7,
      maxLife: 0.7,
    });
    // Belt-and-suspenders cap — life-based filtering already bounds this,
    // but a burst of simultaneous events should never be able to grow it.
    if (this.floaters.length > 12) this.floaters.shift();
  }

  private stepParticles(dt: number): void {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 260 * dt;
      p.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private stepFloaters(dt: number): void {
    for (const f of this.floaters) {
      f.y -= dt * 18;
      f.life -= dt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
  }

  private stepMarkers(dt: number): void {
    for (const m of this.markers) m.life -= dt;
    this.markers = this.markers.filter((m) => m.life > 0);
  }

  // ------------------------------------------------------------ geometry

  private cellRect(index: number): { x: number; y: number; w: number; h: number } {
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    return {
      x: GRID_LEFT + col * (CELL_W + GAP_X),
      y: GRID_TOP + row * (CELL_H + GAP_Y),
      w: CELL_W,
      h: CELL_H,
    };
  }

  // ------------------------------------------------------------ rendering

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

    this.drawBackground(ctx);
    this.drawGrid(ctx);
    this.drawFloaters(ctx);
    this.drawParticles(ctx);
    this.drawMarkers(ctx);

    ctx.restore();

    this.drawHud(ctx);
    this.drawOverlay(ctx);
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = PALETTE.sky;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = PALETTE.skyLow;
    ctx.fillRect(0, GRID_TOP - 6, GAME_WIDTH, GAME_HEIGHT - (GRID_TOP - 6));

    for (const led of this.leds) {
      const on = Math.sin((this.clock * 1.4 + led.phase) * Math.PI * 2) > 0.4;
      ctx.fillStyle = on ? led.color : PALETTE.greyDark;
      ctx.fillRect(Math.floor(led.x), led.y, 2, 2);
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D): void {
    for (let i = 0; i < COLS * ROWS; i += 1) {
      this.drawPanel(ctx, this.cellRect(i));
    }
    for (const p of this.popups) this.drawPopup(ctx, p);
  }

  private drawPanel(
    ctx: CanvasRenderingContext2D,
    rect: { x: number; y: number; w: number; h: number },
  ): void {
    const { x, y, w, h } = rect;

    ctx.fillStyle = PALETTE.greyDark;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = PALETTE.ink;
    ctx.fillRect(x + 1, y + HEADER_H + 1, w - 2, h - HEADER_H - 2);

    // Header bar with traffic-light dots, terminal-window style.
    ctx.fillStyle = PALETTE.red;
    ctx.fillRect(x + 3, y + 3, 2, 2);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(x + 7, y + 3, 2, 2);
    ctx.fillStyle = PALETTE.green;
    ctx.fillRect(x + 11, y + 3, 2, 2);

    // Hatch slot at the interior floor — what things pop up out of.
    const slotW = 26;
    const slotX = x + w / 2 - slotW / 2;
    const slotY = y + h - 3;
    ctx.fillStyle = PALETTE.ink;
    ctx.fillRect(Math.floor(slotX), Math.floor(slotY), slotW, 2);
    ctx.fillStyle = PALETTE.grey;
    ctx.fillRect(Math.floor(slotX), Math.floor(slotY), slotW, 1);
  }

  private drawPopup(ctx: CanvasRenderingContext2D, p: PopUp): void {
    const rect = this.cellRect(p.cell);
    let progress: number;
    if (p.phase === "opening") progress = p.t / p.openDur;
    else if (p.phase === "up") progress = 1;
    else progress = 1 - p.t / p.closeDur;
    progress = Math.min(1, Math.max(0, progress));

    // The interior "screen" is where the sprite is allowed to be visible —
    // clipping to it is what sells the lid-opening reveal without needing
    // separate hatch-door sprites.
    const interiorTop = rect.y + HEADER_H + 2;
    const interiorBottom = rect.y + rect.h - 2;
    const restY = interiorBottom;
    const upY = interiorTop + (interiorBottom - interiorTop) * 0.5;
    const cy = restY + (upY - restY) * progress;
    const cx = rect.x + rect.w / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x + 3, interiorTop - 2, rect.w - 6, interiorBottom - interiorTop + 2);
    ctx.clip();

    if (p.phase === "closing" && p.resolved && p.hitGood) {
      this.drawSplat(ctx, cx, cy, progress);
    } else {
      this.drawSprite(ctx, p.kind, cx, cy);
    }

    ctx.restore();
  }

  private drawSprite(ctx: CanvasRenderingContext2D, kind: PopKind, cx: number, cy: number): void {
    const x = Math.floor(cx - 7);
    const y = Math.floor(cy - 7);

    if (kind === "bug") {
      const wiggle = Math.floor(Math.sin(this.clock * 20) * 1);
      ctx.fillStyle = PALETTE.red;
      ctx.fillRect(x + 3, y + 4, 8, 7);
      ctx.fillStyle = PALETTE.ink;
      ctx.fillRect(x + 4, y + 6, 2, 2);
      ctx.fillRect(x + 8, y + 6, 2, 2);
      ctx.fillRect(x + 1 + wiggle, y + 5, 2, 1);
      ctx.fillRect(x + 1 - wiggle, y + 9, 2, 1);
      ctx.fillRect(x + 11 - wiggle, y + 5, 2, 1);
      ctx.fillRect(x + 11 + wiggle, y + 9, 2, 1);
    } else if (kind === "critical") {
      const flash = Math.floor(this.clock * 14) % 2 === 0;
      const bodyColor = flash ? PALETTE.purple : PALETTE.red;
      ctx.fillStyle = bodyColor;
      ctx.fillRect(x + 3, y + 4, 8, 7);
      ctx.fillStyle = PALETTE.white;
      ctx.fillRect(x + 4, y + 6, 2, 2);
      ctx.fillRect(x + 8, y + 6, 2, 2);
      ctx.fillStyle = bodyColor;
      ctx.fillRect(x + 1, y + 5, 2, 1);
      ctx.fillRect(x + 1, y + 9, 2, 1);
      ctx.fillRect(x + 11, y + 5, 2, 1);
      ctx.fillRect(x + 11, y + 9, 2, 1);
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(x + 6, y - 3, 2, 5);
      ctx.fillRect(x + 6, y + 3, 2, 1);
    } else {
      ctx.fillStyle = PALETTE.green;
      ctx.fillRect(x + 1, y + 2, 12, 10);
      ctx.fillStyle = PALETTE.ink;
      ctx.fillRect(x + 3, y + 6, 2, 2);
      ctx.fillRect(x + 5, y + 8, 2, 2);
      ctx.fillRect(x + 7, y + 4, 2, 2);
      ctx.fillRect(x + 9, y + 2, 2, 2);
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(x + 5, y - 4, 2, 2);
      ctx.fillRect(x + 3, y - 2, 2, 2);
      ctx.fillRect(x + 7, y - 2, 2, 2);
    }
  }

  private drawSplat(ctx: CanvasRenderingContext2D, cx: number, cy: number, progress: number): void {
    const s = 3 + (1 - progress) * 6;
    ctx.fillStyle = PALETTE.red;
    ctx.fillRect(Math.floor(cx - s / 2), Math.floor(cy - s / 2), Math.ceil(s), Math.ceil(s));
    ctx.fillRect(Math.floor(cx - s), Math.floor(cy - 1), 2, 2);
    ctx.fillRect(Math.floor(cx + s - 2), Math.floor(cy - 1), 2, 2);
    ctx.fillRect(Math.floor(cx - 1), Math.floor(cy - s), 2, 2);
    ctx.fillRect(Math.floor(cx - 1), Math.floor(cy + s - 2), 2, 2);
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      const s = p.life > p.maxLife * 0.5 ? 2 : 1;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), s, s);
    }
  }

  private drawFloaters(ctx: CanvasRenderingContext2D): void {
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    for (const f of this.floaters) {
      ctx.globalAlpha = Math.max(0, f.life / f.maxLife);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, Math.floor(f.x), Math.floor(f.y));
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
  }

  private drawMarkers(ctx: CanvasRenderingContext2D): void {
    for (const m of this.markers) {
      const t = m.life / 0.22;
      ctx.fillStyle = m.hit ? PALETTE.gold : PALETTE.grey;
      const s = 1 + Math.floor((1 - t) * 3);
      ctx.fillRect(Math.floor(m.x) - s, Math.floor(m.y), s * 2, 1);
      ctx.fillRect(Math.floor(m.x), Math.floor(m.y) - s, 1, s * 2);
    }
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
      const hx = GAME_WIDTH / 2 - (START_LIVES * 10) / 2 + i * 10;
      ctx.fillRect(hx, 4, 2, 2);
      ctx.fillRect(hx + 4, 4, 2, 2);
      ctx.fillRect(hx, 6, 6, 2);
      ctx.fillRect(hx + 1, 8, 4, 1);
      ctx.fillRect(hx + 2, 9, 2, 1);
    }
  }

  private drawOverlay(ctx: CanvasRenderingContext2D): void {
    if (this.state === "playing") return;

    ctx.fillStyle = "rgba(5,8,15,0.82)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.textAlign = "center";
    const cx = GAME_WIDTH / 2;

    if (this.state === "title") {
      ctx.fillStyle = PALETTE.gold;
      ctx.font = "16px monospace";
      ctx.fillText("BUG SQUASH", cx, 42);
      ctx.fillStyle = PALETTE.white;
      ctx.font = "8px monospace";
      ctx.fillText("SQUASH BUGS. DON'T SHIP REGRESSIONS.", cx, 68);
      if (Math.floor(this.clock * 2) % 2 === 0) {
        ctx.fillStyle = PALETTE.cyan;
        ctx.fillText("PRESS SPACE", cx, 88);
      }
    } else if (this.state === "paused") {
      ctx.fillStyle = PALETTE.gold;
      ctx.font = "12px monospace";
      ctx.fillText("PAUSED", cx, 80);
    } else if (this.state === "gameover") {
      ctx.fillStyle = PALETTE.red;
      ctx.font = "14px monospace";
      ctx.fillText("GAME OVER", cx, 46);
      ctx.fillStyle = PALETTE.white;
      ctx.font = "8px monospace";
      ctx.fillText(`SCORE ${this.score}`, cx, 72);
      ctx.fillText(`BEST  ${this.highScore}`, cx, 84);
      if (this.score >= this.highScore && this.score > 0 && Math.floor(this.clock * 2.5) % 2 === 0) {
        ctx.fillStyle = PALETTE.gold;
        ctx.fillText("NEW HIGH SCORE!", cx, 100);
      }
      if (Math.floor(this.clock * 2) % 2 === 0) {
        ctx.fillStyle = PALETTE.cyan;
        ctx.fillText("PRESS SPACE TO RETRY", cx, 118);
      }
    }

    ctx.textAlign = "left";
  }
}
