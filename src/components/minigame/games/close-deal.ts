/**
 * CLOSE THE DEAL — a one-button timing game about landing a sale.
 *
 * The easiest game on the site: one action (`primary`), no steering. A
 * marker sweeps across a negotiation meter; stop it in the gold SIGNED core
 * for a big score, the green INTERESTED band for a modest one, or miss
 * entirely and burn one of three pitches.
 *
 * Framework-free on purpose: no React, no DOM beyond the 2D context handed
 * to `init`. Renders at the shared 320x180 internal resolution on a fixed
 * timestep accumulator, so behaviour is identical at 60Hz and 144Hz.
 */

import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PALETTE,
  loadHighScore,
  saveHighScore,
  type GameState,
  type GameInput,
  type MiniGameEvent,
  type MiniGame,
} from "../types";

const STEP = 1 / 60;
/** Never simulate more than this in one frame (guards against tab-restore jumps). */
const MAX_FRAME_TIME = 0.25;

const HIGH_SCORE_KEY = "jeevun-closedeal-highscore";

const START_PITCHES = 3;

// ---------------------------------------------------------------- the meter

const BAR_X = 40;
const BAR_Y = 122;
const BAR_W = 240;
const BAR_H = 10;

const BASE_SPEED = 95; // px/s at level 0
const MAX_SPEED = 230; // px/s asymptote
/** Speed ramps on a curve that flattens, so it never becomes pure luck. */
const SPEED_RAMP = 4.5;

const BASE_ZONE_W = 76; // INTERESTED band width at level 0
const MIN_ZONE_W = 34; // INTERESTED band width asymptote
const ZONE_RAMP = 3.5;
const CORE_FRACTION = 0.34; // SIGNED core as a fraction of the current zone
const MIN_CORE_W = 10;

/**
 * FAIRNESS GUARANTEE: the outer INTERESTED zone never shrinks below
 * MIN_ZONE_W (34px) and the sweep speed never exceeds MAX_SPEED
 * (230px/s), so the marker is always inside the zone for at least
 * 34 / 230 ≈ 0.148s ≈ 8.9 physics frames at 60Hz (STEP = 1/60 ≈ 16.7ms).
 * That's comfortably above one fixed step, so the zone can never be
 * "skipped" between frames, and ~150ms of visually-telegraphed window is a
 * reliably hittable target for a player timing an anticipated sweep (as
 * opposed to reacting cold to a stimulus). The tighter SIGNED core asymptotes
 * to MIN_ZONE_W * CORE_FRACTION ≈ 11.6px (well above the MIN_CORE_W floor),
 * giving ≈ 50ms (~3 frames) for a perfect hit at max difficulty — tight, but
 * the wider INTERESTED band around it always offers a forgiving fallback.
 */

const INTRO_TIME = 0.5; // prospect name slide-in, input locked
const RESULT_TIME = 0.65; // pause after a close before the next prospect
const MISS_RESULT_TIME = 0.8; // slightly longer so a miss reads clearly
const START_LOCK = 0.2; // ignore `primary` briefly after a run-starting press
/**
 * Grace window at the start of each sweep.
 *
 * The marker resets to position 0 every round and the target zone never starts
 * below ~22px, so a press landing in the first instants of a sweep could not
 * possibly be inside the zone. Without this, a visitor who simply mashes the
 * button burns all three pitches before the marker has visibly moved and gets
 * an instant, baffling GAME OVER. Swallowing those presses costs a deliberate
 * player nothing and makes the game behave the way a newcomer expects.
 */
const SWEEP_GRACE = 0.28;

const BASE_SIGNED = 320;
const BASE_INTERESTED = 110;
const STREAK_MULT_STEP = 0.2;
const STREAK_MULT_MAX = 3.0;

const MAX_HISTORY = 10;
const MAX_PARTICLES = 160;

interface Prospect {
  name: string;
  value: number;
}

/** The ladder tells a story: escalating deal size. Cycles with rising value after WHALE. */
const PROSPECTS: Prospect[] = [
  { name: "LOCAL SHOP", value: 1 },
  { name: "STARTUP", value: 1.5 },
  { name: "AGENCY", value: 2 },
  { name: "SERIES A", value: 3 },
  { name: "ENTERPRISE", value: 4.5 },
  { name: "WHALE", value: 7 },
];

type Phase = "intro" | "sweep" | "result";
type ResultKind = "signed" | "interested" | "passed" | null;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface HistoryBar {
  cur: number;
  target: number;
  color: string;
}

export class CloseDealGame implements MiniGame {
  private ctx: CanvasRenderingContext2D | null = null;
  private accumulator = 0;
  private runTime = 0;

  state: GameState = "title";
  score = 0;
  highScore = 0;

  private pitches = START_PITCHES;
  private dealsClosed = 0;
  private streak = 0;

  private phase: Phase = "intro";
  private phaseTimer = INTRO_TIME;
  private inputLock = 0;

  private markerPos = 0;
  private markerDir: 1 | -1 = 1;
  private speed = BASE_SPEED;
  private zoneWidth = BASE_ZONE_W;
  private coreWidth = BASE_ZONE_W * CORE_FRACTION;
  private zoneCenter = BAR_W / 2;

  private lastResult: ResultKind = null;
  private shake = 0;
  private flash = 0;

  private particles: Particle[] = [];
  private history: HistoryBar[] = [];

  onEvent: ((event: MiniGameEvent) => void) | null = null;

  // -------------------------------------------------------------- lifecycle

  init(ctx: CanvasRenderingContext2D): void {
    this.ctx = ctx;
    this.highScore = loadHighScore(HIGH_SCORE_KEY);
    this.reset();
  }

  reset(): void {
    this.score = 0;
    this.pitches = START_PITCHES;
    this.dealsClosed = 0;
    this.streak = 0;
    this.lastResult = null;
    this.shake = 0;
    this.flash = 0;
    this.particles = [];
    this.history = [];
    this.accumulator = 0;
    this.inputLock = 0;
    this.setupProspectRound();
  }

  input(action: GameInput): void {
    switch (action.type) {
      case "start":
        this.handleStart();
        break;
      case "primary":
        this.handlePrimary();
        break;
      case "pause":
        if (this.state === "playing") this.state = "paused";
        break;
      case "resume":
        if (this.state === "paused") this.state = "playing";
        break;
      case "move":
      case "point":
        break;
    }
  }

  private handleStart(): void {
    if (this.state === "title" || this.state === "gameover") {
      this.beginRun();
    } else if (this.state === "paused") {
      this.state = "playing";
    }
  }

  private handlePrimary(): void {
    if (this.state === "title" || this.state === "gameover") {
      this.beginRun();
      return;
    }
    if (this.state !== "playing") return;
    // Ignore the very press that started the run, and ignore input during
    // the intro slide / result pause so only a deliberate press during the
    // "sweep" phase can stop the marker.
    if (this.inputLock > 0) return;
    if (this.phase !== "sweep") return;
    this.resolveSweep();
  }

  private beginRun(): void {
    this.reset();
    this.state = "playing";
    this.inputLock = START_LOCK;
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

  // ------------------------------------------------------------------ step

  private step(dt: number): void {
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 60);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt);
    if (this.inputLock > 0) this.inputLock = Math.max(0, this.inputLock - dt);

    this.stepParticles(dt);
    this.stepHistory(dt);
    this.runTime += dt;

    if (this.state !== "playing") return;

    switch (this.phase) {
      case "intro":
        this.phaseTimer -= dt;
        if (this.phaseTimer <= 0) {
          this.phase = "sweep";
          this.inputLock = Math.max(this.inputLock, SWEEP_GRACE);
        }
        break;
      case "sweep":
        this.stepMarker(dt);
        break;
      case "result":
        this.phaseTimer -= dt;
        if (this.phaseTimer <= 0) this.setupProspectRound();
        break;
    }
  }

  private stepMarker(dt: number): void {
    this.markerPos += this.markerDir * this.speed * dt;
    if (this.markerPos <= 0) {
      this.markerPos = 0;
      this.markerDir = 1;
    } else if (this.markerPos >= BAR_W) {
      this.markerPos = BAR_W;
      this.markerDir = -1;
    }
  }

  /** Sets up (or re-sets-up, on a retry) the current prospect's round. */
  private setupProspectRound(): void {
    this.speed = this.speedForLevel(this.dealsClosed);
    this.zoneWidth = this.zoneWidthForLevel(this.dealsClosed);
    this.coreWidth = Math.max(MIN_CORE_W, this.zoneWidth * CORE_FRACTION);

    const margin = this.zoneWidth / 2 + 6;
    const lo = Math.min(margin, BAR_W / 2);
    const hi = Math.max(BAR_W - margin, BAR_W / 2);
    this.zoneCenter = lo + Math.random() * (hi - lo);

    this.markerPos = 0;
    this.markerDir = 1;
    this.phase = "intro";
    this.phaseTimer = INTRO_TIME;
    this.lastResult = null;
  }

  private speedForLevel(level: number): number {
    return BASE_SPEED + (MAX_SPEED - BASE_SPEED) * (1 - Math.exp(-level / SPEED_RAMP));
  }

  private zoneWidthForLevel(level: number): number {
    return MIN_ZONE_W + (BASE_ZONE_W - MIN_ZONE_W) * Math.exp(-level / ZONE_RAMP);
  }

  private currentProspect(): Prospect {
    return PROSPECTS[this.dealsClosed % PROSPECTS.length];
  }

  private currentProspectValue(): number {
    const cycle = Math.floor(this.dealsClosed / PROSPECTS.length);
    return this.currentProspect().value * (1 + cycle * 0.5);
  }

  private currentMultiplier(): number {
    return Math.min(STREAK_MULT_MAX, 1 + this.streak * STREAK_MULT_STEP);
  }

  private resolveSweep(): void {
    const pos = this.markerPos;
    const coreStart = this.zoneCenter - this.coreWidth / 2;
    const coreEnd = this.zoneCenter + this.coreWidth / 2;
    const zoneStart = this.zoneCenter - this.zoneWidth / 2;
    const zoneEnd = this.zoneCenter + this.zoneWidth / 2;

    if (pos >= coreStart && pos <= coreEnd) {
      this.landDeal("signed");
    } else if (pos >= zoneStart && pos <= zoneEnd) {
      this.landDeal("interested");
    } else {
      this.missDeal();
    }
  }

  private landDeal(kind: "signed" | "interested"): void {
    this.streak += 1;
    const mult = this.currentMultiplier();
    const value = this.currentProspectValue();
    const base = kind === "signed" ? BASE_SIGNED : BASE_INTERESTED;
    const pts = Math.round(base * value * mult);

    this.addScore(pts);
    this.dealsClosed += 1;
    this.lastResult = kind;

    const barX = BAR_X + this.markerPos;
    if (kind === "signed") {
      this.flash = 0.4;
      this.shake = 3;
      this.burst(barX, BAR_Y, PALETTE.gold, 22, 90);
      this.burst(barX, BAR_Y, PALETTE.cyan, 10, 70);
      this.pushHistory(58, PALETTE.gold);
    } else {
      this.burst(barX, BAR_Y, PALETTE.green, 12, 60);
      this.pushHistory(32, PALETTE.green);
    }

    this.onEvent?.({ type: "good" });
    this.phase = "result";
    this.phaseTimer = RESULT_TIME;
  }

  private missDeal(): void {
    this.streak = 0;
    this.pitches -= 1;
    this.shake = 8;
    this.lastResult = "passed";
    this.burst(BAR_X + this.markerPos, BAR_Y, PALETTE.red, 10, 55);
    this.onEvent?.({ type: "bad" });

    if (this.pitches <= 0) {
      this.endGame();
      return;
    }

    this.phase = "result";
    this.phaseTimer = MISS_RESULT_TIME;
  }

  private addScore(pts: number): void {
    this.score += pts;
    this.onEvent?.({ type: "score", value: this.score });
  }

  private endGame(): void {
    const isHighScore = this.score > this.highScore;
    if (isHighScore) {
      this.highScore = this.score;
      saveHighScore(HIGH_SCORE_KEY, this.score);
    }
    this.state = "gameover";
    this.onEvent?.({ type: "gameover", score: this.score, isHighScore });
  }

  // --------------------------------------------------------------- effects

  private burst(x: number, y: number, color: string, n: number, power: number): void {
    for (let i = 0; i < n; i += 1) {
      if (this.particles.length >= MAX_PARTICLES) break;
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const speed = power * (0.5 + Math.random() * 0.7);
      const life = 0.4 + Math.random() * 0.35;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 40,
        life,
        maxLife: life,
        color,
        size: Math.random() < 0.5 ? 1 : 2,
      });
    }
  }

  private stepParticles(dt: number): void {
    for (const p of this.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 260 * dt;
      p.life -= dt;
    }
    if (this.particles.length > 0) {
      this.particles = this.particles.filter((p) => p.life > 0);
    }
  }

  private pushHistory(targetH: number, color: string): void {
    this.history.push({ cur: 0, target: targetH, color });
    if (this.history.length > MAX_HISTORY) this.history.shift();
  }

  private stepHistory(dt: number): void {
    for (const h of this.history) {
      h.cur += (h.target - h.cur) * Math.min(1, dt * 6);
    }
  }

  // ---------------------------------------------------------------- render

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
    this.drawChart(ctx);
    this.drawProspectBanner(ctx);
    this.drawMeter(ctx);
    this.drawParticles(ctx);

    ctx.restore();

    this.drawHud(ctx);
    this.drawOverlay(ctx);
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = PALETTE.sky;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = PALETTE.skyLow;
    ctx.fillRect(0, 96, GAME_WIDTH, GAME_HEIGHT - 96);

    // Office window grid, top band.
    ctx.strokeStyle = PALETTE.greyDark;
    ctx.lineWidth = 1;
    for (let x = 10; x < GAME_WIDTH - 10; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, 6);
      ctx.lineTo(x, 40);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(10, 6);
    ctx.lineTo(GAME_WIDTH - 10, 6);
    ctx.moveTo(10, 40);
    ctx.lineTo(GAME_WIDTH - 10, 40);
    ctx.stroke();

    // City lights through the window.
    ctx.fillStyle = PALETTE.gold;
    for (let x = 14; x < GAME_WIDTH - 14; x += 8) {
      const n = Math.abs(Math.sin(x * 12.9898) * 10000) % 1;
      if (n < 0.35) ctx.fillRect(x, 10 + Math.floor(n * 22), 2, 2);
    }

    // Desk / ground.
    ctx.fillStyle = PALETTE.ground;
    ctx.fillRect(0, 156, GAME_WIDTH, GAME_HEIGHT - 156);
    ctx.fillStyle = PALETTE.goldDark;
    ctx.fillRect(0, 156, GAME_WIDTH, 2);
  }

  /** A rising revenue chart in the corner — grows a bar with each close. */
  private drawChart(ctx: CanvasRenderingContext2D): void {
    const baseY = 154;
    const x0 = 8;
    const barW = 6;
    const gap = 3;

    ctx.fillStyle = PALETTE.greyDark;
    ctx.fillRect(x0 - 3, baseY, MAX_HISTORY * (barW + gap) + 2, 1);

    this.history.forEach((h, i) => {
      const x = x0 + i * (barW + gap);
      const h2 = Math.max(1, Math.round(h.cur));
      ctx.fillStyle = h.color;
      ctx.fillRect(x, baseY - h2, barW, h2);
    });
  }

  private drawProspectBanner(ctx: CanvasRenderingContext2D): void {
    const cx = GAME_WIDTH / 2;
    let slide = 0;
    if (this.phase === "intro") {
      const progress = 1 - Math.max(0, this.phaseTimer) / INTRO_TIME;
      const eased = 1 - Math.pow(1 - Math.min(1, progress), 3);
      slide = (1 - eased) * 140;
    }

    ctx.textAlign = "center";
    ctx.font = "8px monospace";
    ctx.fillStyle = PALETTE.grey;
    ctx.fillText("PITCHING", cx + slide, 52);
    ctx.font = "12px monospace";
    ctx.fillStyle = PALETTE.white;
    ctx.fillText(this.currentProspect().name, cx + slide, 64);

    if (this.phase === "result" && this.lastResult) {
      const labels: Record<Exclude<ResultKind, null>, string> = {
        signed: "SIGNED!",
        interested: "INTERESTED",
        passed: "PASSED",
      };
      const colors: Record<Exclude<ResultKind, null>, string> = {
        signed: PALETTE.gold,
        interested: PALETTE.green,
        passed: PALETTE.red,
      };
      ctx.font = "14px monospace";
      ctx.fillStyle = colors[this.lastResult];
      ctx.fillText(labels[this.lastResult], cx, 86);
    }

    ctx.textAlign = "left";
  }

  private drawMeter(ctx: CanvasRenderingContext2D): void {
    const zoneStart = BAR_X + this.zoneCenter - this.zoneWidth / 2;
    const coreStart = BAR_X + this.zoneCenter - this.coreWidth / 2;

    // Flash the whole bar gold briefly after a perfect close.
    if (this.flash > 0 && Math.floor(this.flash * 20) % 2 === 0) {
      ctx.fillStyle = PALETTE.gold;
      ctx.fillRect(BAR_X - 3, BAR_Y - 3, BAR_W + 6, BAR_H + 6);
    }

    ctx.fillStyle = PALETTE.greyDark;
    ctx.fillRect(BAR_X, BAR_Y, BAR_W, BAR_H);

    ctx.fillStyle = PALETTE.green;
    ctx.fillRect(Math.floor(zoneStart), BAR_Y, Math.ceil(this.zoneWidth), BAR_H);

    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(Math.floor(coreStart), BAR_Y, Math.ceil(this.coreWidth), BAR_H);

    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1;
    ctx.strokeRect(BAR_X + 0.5, BAR_Y + 0.5, BAR_W - 1, BAR_H - 1);

    // Marker: judders in place on a miss result, otherwise tracks its position.
    const judder =
      this.phase === "result" && this.lastResult === "passed" ? (Math.random() - 0.5) * 5 : 0;
    const mx = Math.round(BAR_X + this.markerPos + judder);

    ctx.fillStyle = this.lastResult === "passed" && this.phase === "result" ? PALETTE.red : PALETTE.white;
    ctx.fillRect(mx - 1, BAR_Y - 6, 2, BAR_H + 12);
    ctx.beginPath();
    ctx.moveTo(mx - 3, BAR_Y - 6);
    ctx.lineTo(mx + 3, BAR_Y - 6);
    ctx.lineTo(mx, BAR_Y - 1);
    ctx.closePath();
    ctx.fill();
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      const s = p.life > p.maxLife * 0.4 ? p.size : 1;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), s, s);
    }
  }

  private drawHud(ctx: CanvasRenderingContext2D): void {
    ctx.font = "8px monospace";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    ctx.fillStyle = PALETTE.gold;
    ctx.fillText(`SCORE ${this.score}`, 6, 6);

    ctx.fillStyle = PALETTE.grey;
    const hi = `HI ${Math.max(this.highScore, this.score)}`;
    ctx.fillText(hi, GAME_WIDTH - 6 - ctx.measureText(hi).width, 6);

    // Pitches remaining, drawn as small briefcases.
    for (let i = 0; i < START_PITCHES; i += 1) {
      const have = i < this.pitches;
      const bx = GAME_WIDTH - 6 - (START_PITCHES - i) * 12;
      ctx.fillStyle = have ? PALETTE.cyan : PALETTE.greyDark;
      ctx.fillRect(bx, 16, 8, 6);
      ctx.fillRect(bx + 3, 14, 2, 2);
    }

    // Streak multiplier, prominent, near the meter.
    if (this.streak > 0) {
      const mult = this.currentMultiplier();
      const label = `STREAK x${mult.toFixed(1)}`;
      ctx.textAlign = "center";
      ctx.font = "10px monospace";
      ctx.fillStyle = PALETTE.gold;
      ctx.fillText(label, GAME_WIDTH / 2, 100);
      ctx.textAlign = "left";
    }

    ctx.font = "8px monospace";
    ctx.fillStyle = PALETTE.grey;
    ctx.fillText(`DEALS CLOSED ${this.dealsClosed}`, 6, GAME_HEIGHT - 14);
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
      ctx.fillText("CLOSE THE DEAL", cx, 56);
      ctx.fillStyle = PALETTE.white;
      ctx.font = "8px monospace";
      ctx.fillText("TIME IT RIGHT.", cx, 84);
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = PALETTE.cyan;
        ctx.fillText("PRESS SPACE", cx, 100);
      }
    } else if (this.state === "paused") {
      ctx.fillStyle = PALETTE.gold;
      ctx.font = "12px monospace";
      ctx.fillText("PAUSED", cx, 80);
    } else if (this.state === "gameover") {
      ctx.fillStyle = PALETTE.red;
      ctx.font = "14px monospace";
      ctx.fillText("GAME OVER", cx, 44);
      ctx.fillStyle = PALETTE.white;
      ctx.font = "8px monospace";
      ctx.fillText(`SCORE ${this.score}`, cx, 68);
      ctx.fillText(`DEALS CLOSED ${this.dealsClosed}`, cx, 80);
      ctx.fillText(`BEST ${this.highScore}`, cx, 92);
      if (this.score >= this.highScore && this.score > 0 && Math.floor(Date.now() / 400) % 2 === 0) {
        ctx.fillStyle = PALETTE.gold;
        ctx.fillText("NEW HIGH SCORE!", cx, 108);
      }
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = PALETTE.cyan;
        ctx.fillText("PRESS SPACE TO RETRY", cx, 126);
      }
    }

    ctx.textAlign = "left";
  }
}
