/**
 * SHIP IT — a small endless runner, themed on shipping products.
 *
 * Framework-free on purpose: no React, no DOM beyond the 2D context handed in.
 * Everything renders at a fixed 320x180 internal resolution and is scaled up by
 * the caller with smoothing disabled, which is what gives it the 8-bit look.
 *
 * Physics run on a fixed timestep accumulator so the game behaves identically
 * at 60Hz, 120Hz and 144Hz.
 */

export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 180;

const STEP = 1 / 60;
/** Never simulate more than this in one frame (guards against tab-restore jumps). */
const MAX_FRAME_TIME = 0.25;

const GROUND_Y = 150;
const PLAYER_X = 44;
const PLAYER_W = 12;
const PLAYER_H = 16;

const GRAVITY = 1400;
const JUMP_V = -420; // apex ~63px, airtime ~0.6s
const COYOTE_TIME = 0.09;
const JUMP_BUFFER = 0.12;

const START_SPEED = 130;
const MAX_SPEED = 260;
/** Speed ramps on a curve that flattens, so it stays playable. */
const SPEED_RAMP = 5.5;

const START_LIVES = 3;
const HIT_INVULN = 1.0;
const POWERUP_TIME = 3.0;
const DOUBLE_JUMP_SCORE = 500;

export type GameState = "title" | "playing" | "paused" | "gameover";
export type GameAction = "jump" | "start" | "pause" | "resume";

export type GameEvent =
  | { type: "score"; value: number }
  | { type: "gameover"; score: number; isHighScore: boolean }
  | { type: "coin" }
  | { type: "powerup" }
  | { type: "hit" };

type ObstacleKind = "bug" | "scope" | "meeting";

interface Obstacle {
  x: number;
  w: number;
  h: number;
  kind: ObstacleKind;
}

interface Coin {
  x: number;
  y: number;
  taken: boolean;
  spin: number;
}

interface Powerup {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const OBSTACLES: Record<ObstacleKind, { w: number; h: number; color: string; label: string }> = {
  bug: { w: 14, h: 12, color: "#d23c4a", label: "BUG" },
  scope: { w: 12, h: 30, color: "#a855f7", label: "SCOPE CREEP" },
  meeting: { w: 26, h: 16, color: "#3b82f6", label: "MEETING" },
};

const HIGH_SCORE_KEY = "jeevun-shipit-highscore";

function loadHighScore(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(HIGH_SCORE_KEY);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    /* private mode — score just won't persist */
  }
}

export class ShipItGame {
  private ctx: CanvasRenderingContext2D | null = null;
  private accumulator = 0;

  state: GameState = "title";
  score = 0;
  highScore = 0;

  private lives = START_LIVES;
  private speed = START_SPEED;
  private distance = 0;
  private coinsBanked = 0;

  private playerY = GROUND_Y - PLAYER_H;
  private velocityY = 0;
  private onGround = true;
  private jumpsUsed = 0;
  private coyote = 0;
  private buffer = 0;

  private invuln = 0;
  private powerTime = 0;

  private obstacles: Obstacle[] = [];
  private coins: Coin[] = [];
  private powerups: Powerup[] = [];
  private particles: Particle[] = [];

  private spawnGap = 0;
  private shake = 0;
  private runTime = 0;
  private stars: { x: number; y: number; s: number }[] = [];

  onEvent: ((event: GameEvent) => void) | null = null;

  init(ctx: CanvasRenderingContext2D): void {
    this.ctx = ctx;
    this.highScore = loadHighScore();
    this.stars = Array.from({ length: 34 }, (_, i) => ({
      x: (i * 47) % GAME_WIDTH,
      y: (i * 29) % 90,
      s: i % 3 === 0 ? 2 : 1,
    }));
    this.reset();
  }

  reset(): void {
    this.score = 0;
    this.lives = START_LIVES;
    this.speed = START_SPEED;
    this.distance = 0;
    this.coinsBanked = 0;
    this.playerY = GROUND_Y - PLAYER_H;
    this.velocityY = 0;
    this.onGround = true;
    this.jumpsUsed = 0;
    this.coyote = 0;
    this.buffer = 0;
    this.invuln = 0;
    this.powerTime = 0;
    this.obstacles = [];
    this.coins = [];
    this.powerups = [];
    this.particles = [];
    this.spawnGap = 180;
    this.shake = 0;
    this.runTime = 0;
    this.accumulator = 0;
  }

  input(action: GameAction): void {
    switch (action) {
      case "start":
        if (this.state === "title" || this.state === "gameover") {
          this.reset();
          this.state = "playing";
        } else if (this.state === "paused") {
          this.state = "playing";
        }
        break;
      case "jump":
        if (this.state === "title" || this.state === "gameover") {
          this.reset();
          this.state = "playing";
          return;
        }
        if (this.state === "playing") this.buffer = JUMP_BUFFER;
        break;
      case "pause":
        if (this.state === "playing") this.state = "paused";
        break;
      case "resume":
        if (this.state === "paused") this.state = "playing";
        break;
    }
  }

  pause(): void {
    this.input("pause");
  }

  resume(): void {
    this.input("resume");
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
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 60);
    this.stepParticles(dt);

    if (this.state !== "playing") return;

    this.runTime += dt;

    // Speed ramps quickly at first, then flattens toward MAX_SPEED.
    this.speed = Math.min(
      MAX_SPEED,
      START_SPEED + (MAX_SPEED - START_SPEED) * (1 - Math.exp(-this.runTime / SPEED_RAMP)),
    );

    this.distance += this.speed * dt;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.powerTime > 0) this.powerTime -= dt;

    this.stepPlayer(dt);
    this.stepWorld(dt);
    this.stepCollisions();

    const nextScore = Math.floor(this.distance / 10) + this.coinsBanked * 10;
    if (nextScore !== this.score) {
      this.score = nextScore;
      this.onEvent?.({ type: "score", value: this.score });
    }
  }

  private stepPlayer(dt: number): void {
    if (this.buffer > 0) this.buffer -= dt;
    if (this.coyote > 0) this.coyote -= dt;

    const canDouble = this.score >= DOUBLE_JUMP_SCORE;
    const maxJumps = canDouble ? 2 : 1;
    const grounded = this.onGround || this.coyote > 0;

    if (this.buffer > 0 && (grounded || this.jumpsUsed < maxJumps)) {
      if (grounded) this.jumpsUsed = 1;
      else this.jumpsUsed += 1;
      this.velocityY = JUMP_V;
      this.onGround = false;
      this.coyote = 0;
      this.buffer = 0;
    }

    this.velocityY += GRAVITY * dt;
    this.playerY += this.velocityY * dt;

    const floor = GROUND_Y - PLAYER_H;
    if (this.playerY >= floor) {
      if (!this.onGround) this.coyote = 0;
      this.playerY = floor;
      this.velocityY = 0;
      this.onGround = true;
      this.jumpsUsed = 0;
    } else if (this.onGround) {
      // Just walked off a ledge — grant coyote time.
      this.onGround = false;
      this.coyote = COYOTE_TIME;
    }
  }

  private stepWorld(dt: number): void {
    const dx = this.speed * dt;

    for (const o of this.obstacles) o.x -= dx;
    for (const c of this.coins) {
      c.x -= dx;
      c.spin += dt * 6;
    }
    for (const p of this.powerups) p.x -= dx;

    this.obstacles = this.obstacles.filter((o) => o.x + o.w > -8);
    this.coins = this.coins.filter((c) => c.x > -8 && !c.taken);
    this.powerups = this.powerups.filter((p) => p.x > -8);

    this.spawnGap -= dx;
    if (this.spawnGap <= 0) this.spawn();
  }

  private spawn(): void {
    const kinds: ObstacleKind[] = ["bug", "scope", "meeting"];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const def = OBSTACLES[kind];

    this.obstacles.push({
      x: GAME_WIDTH + 8,
      w: def.w,
      h: def.h,
      kind,
    });

    // A jump lasts ~0.6s. Requiring at least 0.85s of travel between spawns
    // means no gap is ever unclearable, at any speed tier.
    const minGap = this.speed * 0.85;
    this.spawnGap = minGap + Math.random() * this.speed * 0.7;

    // Coins ride in the gap, arcing over where the player will be mid-jump.
    if (Math.random() < 0.75) {
      const count = 1 + Math.floor(Math.random() * 3);
      const baseX = GAME_WIDTH + 8 + minGap * 0.45;
      for (let i = 0; i < count; i += 1) {
        const t = count === 1 ? 0.5 : i / (count - 1);
        this.coins.push({
          x: baseX + i * 16,
          y: GROUND_Y - 34 - Math.sin(t * Math.PI) * 18,
          taken: false,
          spin: 0,
        });
      }
    }

    if (Math.random() < 0.07) {
      this.powerups.push({
        x: GAME_WIDTH + 8 + minGap * 0.7,
        y: GROUND_Y - 52,
      });
    }
  }

  private stepCollisions(): void {
    const px = PLAYER_X;
    const py = this.playerY;

    for (const c of this.coins) {
      if (c.taken) continue;
      if (Math.abs(c.x - (px + PLAYER_W / 2)) < 9 && Math.abs(c.y - (py + PLAYER_H / 2)) < 11) {
        c.taken = true;
        this.coinsBanked += 1;
        this.burst(c.x, c.y, "#f5c542", 6);
        this.onEvent?.({ type: "coin" });
      }
    }

    this.powerups = this.powerups.filter((p) => {
      if (Math.abs(p.x - (px + PLAYER_W / 2)) < 11 && Math.abs(p.y - (py + PLAYER_H / 2)) < 13) {
        this.powerTime = POWERUP_TIME;
        this.burst(p.x, p.y, "#3fd8e8", 10);
        this.onEvent?.({ type: "powerup" });
        return false;
      }
      return true;
    });

    if (this.invuln > 0 || this.powerTime > 0) return;

    for (const o of this.obstacles) {
      const oy = GROUND_Y - o.h;
      const hit =
        px + PLAYER_W - 2 > o.x &&
        px + 2 < o.x + o.w &&
        py + PLAYER_H - 1 > oy &&
        py + 2 < GROUND_Y;

      if (hit) {
        this.lives -= 1;
        this.invuln = HIT_INVULN;
        this.shake = 8;
        this.burst(o.x, oy, OBSTACLES[o.kind].color, 12);
        this.onEvent?.({ type: "hit" });

        if (this.lives <= 0) {
          const isHighScore = this.score > this.highScore;
          if (isHighScore) {
            this.highScore = this.score;
            saveHighScore(this.score);
          }
          this.state = "gameover";
          this.onEvent?.({ type: "gameover", score: this.score, isHighScore });
        }
        break;
      }
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
    this.drawGround(ctx);
    this.drawEntities(ctx);
    this.drawPlayer(ctx);
    this.drawParticles(ctx);

    ctx.restore();

    this.drawHud(ctx);
    this.drawOverlay(ctx);
  }

  private drawSky(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#0d1220";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#1a2338";
    ctx.fillRect(0, 96, GAME_WIDTH, GAME_HEIGHT - 96);

    ctx.fillStyle = "#e8edf7";
    for (const s of this.stars) {
      const x = (s.x - this.distance * 0.04) % GAME_WIDTH;
      ctx.fillRect(Math.floor(x < 0 ? x + GAME_WIDTH : x), s.y, s.s, s.s);
    }
  }

  /** Three skyline layers at different speeds. */
  private drawSkyline(ctx: CanvasRenderingContext2D): void {
    const layers = [
      { speed: 0.08, color: "#161d2e", base: 108, min: 14, max: 40, w: 22, seed: 3 },
      { speed: 0.18, color: "#1f2942", base: 120, min: 12, max: 32, w: 18, seed: 7 },
      { speed: 0.34, color: "#2a3654", base: 132, min: 10, max: 26, w: 14, seed: 11 },
    ];

    for (const l of layers) {
      ctx.fillStyle = l.color;
      const offset = (this.distance * l.speed) % l.w;
      const count = Math.ceil(GAME_WIDTH / l.w) + 2;
      for (let i = 0; i < count; i += 1) {
        const idx = Math.floor((this.distance * l.speed) / l.w) + i;
        // Deterministic pseudo-random height so buildings don't flicker.
        const n = Math.abs(Math.sin(idx * l.seed) * 10000) % 1;
        const h = l.min + Math.floor(n * (l.max - l.min));
        const x = Math.floor(i * l.w - offset);
        ctx.fillRect(x, l.base - h, l.w - 3, h);

        // Lit windows
        ctx.fillStyle = "#f5c542";
        for (let wy = l.base - h + 3; wy < l.base - 3; wy += 5) {
          for (let wx = x + 2; wx < x + l.w - 6; wx += 4) {
            if ((wx * 7 + wy * 13 + idx * 5) % 11 < 3) ctx.fillRect(wx, wy, 1, 2);
          }
        }
        ctx.fillStyle = l.color;
      }
    }
  }

  private drawGround(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#0a0e18";
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
    ctx.fillStyle = "#f5c542";
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, 1);

    ctx.fillStyle = "#3a4560";
    const offset = this.distance % 16;
    for (let x = -offset; x < GAME_WIDTH; x += 16) {
      ctx.fillRect(Math.floor(x), GROUND_Y + 5, 8, 1);
    }
  }

  private drawEntities(ctx: CanvasRenderingContext2D): void {
    for (const o of this.obstacles) {
      const def = OBSTACLES[o.kind];
      const y = GROUND_Y - o.h;
      ctx.fillStyle = def.color;
      ctx.fillRect(Math.floor(o.x), y, o.w, o.h);
      ctx.fillStyle = "#0a0e18";
      ctx.fillRect(Math.floor(o.x) + 2, y + 2, 2, 2);
      ctx.fillRect(Math.floor(o.x) + o.w - 4, y + 2, 2, 2);
    }

    for (const c of this.coins) {
      if (c.taken) continue;
      const w = Math.max(2, Math.round(Math.abs(Math.cos(c.spin)) * 6));
      ctx.fillStyle = "#7a4f10";
      ctx.fillRect(Math.floor(c.x - w / 2), Math.floor(c.y - 3), w, 6);
      ctx.fillStyle = "#f5c542";
      ctx.fillRect(Math.floor(c.x - w / 2) + 1, Math.floor(c.y - 2), Math.max(1, w - 2), 4);
    }

    for (const p of this.powerups) {
      ctx.fillStyle = "#3fd8e8";
      ctx.fillRect(Math.floor(p.x) - 4, Math.floor(p.y) - 6, 8, 12);
      ctx.fillStyle = "#d7fbff";
      ctx.fillRect(Math.floor(p.x) - 2, Math.floor(p.y) - 4, 4, 4);
    }
  }

  private drawPlayer(ctx: CanvasRenderingContext2D): void {
    // Blink while invulnerable.
    if (this.invuln > 0 && Math.floor(this.invuln * 12) % 2 === 0) return;

    const x = PLAYER_X;
    const y = Math.floor(this.playerY);
    const powered = this.powerTime > 0;

    ctx.fillStyle = powered && Math.floor(this.runTime * 10) % 2 === 0 ? "#3fd8e8" : "#e8edf7";
    ctx.fillRect(x + 2, y, 8, 7); // head
    ctx.fillStyle = "#3355ff";
    ctx.fillRect(x + 3, y + 2, 2, 2); // visor

    ctx.fillStyle = powered ? "#3fd8e8" : "#d23c4a";
    ctx.fillRect(x, y + 7, PLAYER_W, 6); // torso

    ctx.fillStyle = "#2b2f3a";
    if (this.onGround) {
      const stride = Math.floor(this.runTime * 12) % 2 === 0;
      ctx.fillRect(x + 1, y + 13, 4, 3);
      ctx.fillRect(x + 7, y + 13, 4, stride ? 2 : 3);
    } else {
      ctx.fillRect(x + 1, y + 13, 4, 2);
      ctx.fillRect(x + 8, y + 12, 4, 2);
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      const s = p.life > 0.25 ? 2 : 1;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), s, s);
    }
  }

  private drawHud(ctx: CanvasRenderingContext2D): void {
    ctx.font = "8px monospace";
    ctx.textBaseline = "top";

    ctx.fillStyle = "#f5c542";
    ctx.fillText(`SCORE ${this.score}`, 6, 6);

    ctx.fillStyle = "#8a93a8";
    const hi = `HI ${Math.max(this.highScore, this.score)}`;
    ctx.fillText(hi, GAME_WIDTH - 6 - ctx.measureText(hi).width, 6);

    for (let i = 0; i < START_LIVES; i += 1) {
      ctx.fillStyle = i < this.lives ? "#d23c4a" : "#333a4d";
      const hx = 6 + i * 10;
      ctx.fillRect(hx, 18, 2, 2);
      ctx.fillRect(hx + 4, 18, 2, 2);
      ctx.fillRect(hx, 20, 6, 2);
      ctx.fillRect(hx + 1, 22, 4, 1);
      ctx.fillRect(hx + 2, 23, 2, 1);
    }

    if (this.powerTime > 0) {
      ctx.fillStyle = "#3fd8e8";
      ctx.fillText(`SHIP IT ${this.powerTime.toFixed(1)}`, 6, 30);
    }
  }

  private drawOverlay(ctx: CanvasRenderingContext2D): void {
    if (this.state === "playing") return;

    ctx.fillStyle = "rgba(5,8,15,0.78)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.textAlign = "center";

    const cx = GAME_WIDTH / 2;

    if (this.state === "title") {
      ctx.fillStyle = "#f5c542";
      ctx.font = "16px monospace";
      ctx.fillText("SHIP IT", cx, 58);
      ctx.fillStyle = "#e8edf7";
      ctx.font = "8px monospace";
      ctx.fillText("JUMP THE BUGS. COLLECT THE COINS.", cx, 86);
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = "#3fd8e8";
        ctx.fillText("PRESS SPACE TO START", cx, 110);
      }
    } else if (this.state === "paused") {
      ctx.fillStyle = "#f5c542";
      ctx.font = "12px monospace";
      ctx.fillText("PAUSED", cx, 80);
    } else if (this.state === "gameover") {
      ctx.fillStyle = "#d23c4a";
      ctx.font = "14px monospace";
      ctx.fillText("GAME OVER", cx, 52);
      ctx.fillStyle = "#e8edf7";
      ctx.font = "8px monospace";
      ctx.fillText(`SCORE ${this.score}`, cx, 78);
      ctx.fillText(`BEST  ${this.highScore}`, cx, 90);
      if (this.score >= this.highScore && this.score > 0 && Math.floor(Date.now() / 400) % 2 === 0) {
        ctx.fillStyle = "#f5c542";
        ctx.fillText("NEW HIGH SCORE!", cx, 106);
      }
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillStyle = "#3fd8e8";
        ctx.fillText("PRESS SPACE TO RETRY", cx, 124);
      }
    }

    ctx.textAlign = "left";
  }
}
