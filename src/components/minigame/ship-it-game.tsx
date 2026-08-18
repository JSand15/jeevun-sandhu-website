"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { GAME_HEIGHT, GAME_WIDTH, ShipItGame as Engine } from "./engine";
import { cn } from "@/lib/utils";

interface ShipItGameProps {
  onScore?: (score: number) => void;
  onGameOver?: (score: number, isHighScore: boolean) => void;
  className?: string;
  autoFocus?: boolean;
}

const JUMP_KEYS = new Set([" ", "Spacebar", "ArrowUp", "w", "W"]);

export function ShipItGame({
  onScore,
  onGameOver,
  className,
  autoFocus = false,
}: ShipItGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  const [score, setScore] = useState(0);

  // Keep the latest callbacks without restarting the loop.
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

    const engine = new Engine();
    engine.onEvent = (event) => {
      if (event.type === "score") {
        setScore(event.value);
        scoreCb.current?.(event.value);
      } else if (event.type === "gameover") {
        overCb.current?.(event.score, event.isHighScore);
      }
    };
    engine.init(ctx);
    engineRef.current = engine;

    const loop = (now: number) => {
      const last = lastRef.current || now;
      lastRef.current = now;
      engine.update((now - last) / 1000);
      engine.render();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      engine.onEvent = null;
      engineRef.current = null;
    };
  }, []);

  // Pause when the tab goes away so nothing runs unseen.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) engineRef.current?.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (autoFocus) wrapRef.current?.focus();
  }, [autoFocus]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (JUMP_KEYS.has(event.key)) {
      // Only swallow the key while the game itself has focus, so the rest of
      // the page keeps its normal scrolling behaviour.
      event.preventDefault();
      engine.input("jump");
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      engine.input("start");
      return;
    }
    if (event.key === "p" || event.key === "P" || event.key === "Escape") {
      engine.input(engine.state === "paused" ? "resume" : "pause");
    }
  }, []);

  const handleTap = useCallback(() => {
    wrapRef.current?.focus();
    engineRef.current?.input("jump");
  }, []);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        ref={wrapRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handleTap}
        onBlur={() => engineRef.current?.pause()}
        role="application"
        aria-label="Ship It, a jumping arcade game. Press space to jump."
        data-no-smooth-scroll
        className="focus-visible:outline-arcade relative w-full cursor-pointer touch-none select-none focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <canvas
          ref={canvasRef}
          className="pixelated block h-auto w-full bg-[#0d1220]"
          style={{ aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}` }}
          role="img"
          aria-label={`Ship It arcade game. Current score ${score}.`}
        />
      </div>

      <p className="text-muted-foreground text-center text-xs">
        <span className="hidden sm:inline">
          Space or ↑ to jump. P to pause. Click the screen first to focus it.
        </span>
        <span className="sm:hidden">Tap the screen to jump.</span>
      </p>
    </div>
  );
}
