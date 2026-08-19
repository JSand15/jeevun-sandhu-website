"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { GAME_HEIGHT, GAME_WIDTH, type MiniGame, type MiniGameEvent } from "./types";

interface GameCanvasProps {
  /** Constructs the engine. Called once per mount. */
  create: () => MiniGame;
  onScore?: (score: number) => void;
  onGameOver?: (score: number, isHighScore: boolean) => void;
  /** Screen-reader description of what the game is. */
  label: string;
  /** Shown under the canvas. Keep it to one short line per pointer type. */
  hint: { desktop: string; touch: string };
  /** Set when the game needs arrow-key steering. */
  usesArrows?: boolean;
  /** Set when the game is driven by clicking a target on the canvas. */
  usesPointer?: boolean;
  className?: string;
}

const PRIMARY_KEYS = new Set([" ", "Spacebar", "Enter"]);

/**
 * Hosts a MiniGame: owns the canvas, the rAF loop, and input plumbing.
 *
 * Keyboard listeners live on the container rather than the window, so a game
 * never steals keys from the rest of the page, and Space is only swallowed
 * while the game itself has focus.
 */
export function GameCanvas({
  create,
  onScore,
  onGameOver,
  label,
  hint,
  usesArrows = false,
  usesPointer = false,
  className,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<MiniGame | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);

  const [score, setScore] = useState(0);

  const createRef = useRef(create);
  const scoreCb = useRef(onScore);
  const overCb = useRef(onGameOver);
  scoreCb.current = onScore;
  overCb.current = onGameOver;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const game = createRef.current();
    game.onEvent = (event: MiniGameEvent) => {
      if (event.type === "score") {
        setScore(event.value);
        scoreCb.current?.(event.value);
      } else if (event.type === "gameover") {
        overCb.current?.(event.score, event.isHighScore);
      }
    };
    game.init(ctx);
    gameRef.current = game;

    const loop = (now: number) => {
      const last = lastRef.current || now;
      lastRef.current = now;
      game.update((now - last) / 1000);
      game.render();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      game.onEvent = null;
      gameRef.current = null;
    };
  }, []);

  // Never run a loop the user can't see.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) gameRef.current?.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const game = gameRef.current;
      if (!game) return;

      if (PRIMARY_KEYS.has(event.key)) {
        event.preventDefault();
        game.input({ type: "primary" });
        return;
      }
      if (usesArrows && (event.key === "ArrowLeft" || event.key === "a")) {
        event.preventDefault();
        game.input({ type: "move", dir: -1 });
        return;
      }
      if (usesArrows && (event.key === "ArrowRight" || event.key === "d")) {
        event.preventDefault();
        game.input({ type: "move", dir: 1 });
        return;
      }
      if (event.key === "p" || event.key === "P" || event.key === "Escape") {
        game.input(game.state === "paused" ? { type: "resume" } : { type: "pause" });
      }
    },
    [usesArrows],
  );

  const handleKeyUp = useCallback(
    (event: React.KeyboardEvent) => {
      if (!usesArrows) return;
      const game = gameRef.current;
      if (!game) return;
      if (["ArrowLeft", "ArrowRight", "a", "d"].includes(event.key)) {
        game.input({ type: "move", dir: 0 });
      }
    },
    [usesArrows],
  );

  /** Maps a pointer event to game coordinates, accounting for the scale-up. */
  const toGameCoords = useCallback((event: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * GAME_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * GAME_HEIGHT,
    };
  }, []);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      wrapRef.current?.focus();
      const game = gameRef.current;
      if (!game) return;

      if (usesPointer) {
        const pos = toGameCoords(event);
        if (pos) game.input({ type: "point", x: pos.x, y: pos.y });
        // A tap on the title/gameover screen should also start the round.
        if (game.state !== "playing") game.input({ type: "primary" });
        return;
      }

      if (usesArrows) {
        const pos = toGameCoords(event);
        if (pos && game.state === "playing") {
          game.input({ type: "move", dir: pos.x < GAME_WIDTH / 2 ? -1 : 1 });
          return;
        }
      }

      game.input({ type: "primary" });
    },
    [usesPointer, usesArrows, toGameCoords],
  );

  const handlePointerUp = useCallback(() => {
    if (!usesArrows) return;
    gameRef.current?.input({ type: "move", dir: 0 });
  }, [usesArrows]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        ref={wrapRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onBlur={() => gameRef.current?.pause()}
        role="application"
        aria-label={label}
        data-no-smooth-scroll
        className="focus-visible:outline-arcade relative w-full cursor-pointer touch-none select-none focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <canvas
          ref={canvasRef}
          className="pixelated block h-auto w-full bg-[#0d1220]"
          style={{ aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}` }}
          role="img"
          aria-label={`${label} Current score ${score}.`}
        />
      </div>

      <p className="text-muted-foreground text-center text-xs">
        <span className="hidden sm:inline">{hint.desktop}</span>
        <span className="sm:hidden">{hint.touch}</span>
      </p>
    </div>
  );
}
