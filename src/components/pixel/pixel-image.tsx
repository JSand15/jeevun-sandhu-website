"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Chunkiness ladder walked on hover, from most pixelated to sharp. */
const REVEAL_STEPS = [16, 12, 8, 4, 2, 1] as const;
const STEP_MS = 50;

interface PixelImageProps {
  src: string;
  alt: string;
  /** Intrinsic aspect ratio. The element itself is fluid width. */
  width: number;
  height: number;
  /** Edge length of one rendered "pixel". Higher is chunkier. */
  pixelSize?: number;
  /** Walk down to a sharp image on hover/focus. The site's signature effect. */
  hoverReveal?: boolean;
  className?: string;
  priority?: boolean;
}

/**
 * Renders a real photograph as 8-bit pixel art by downsampling it to a small
 * offscreen canvas and scaling that back up with image smoothing disabled.
 *
 * Falls back to a plain <img> if the canvas or the image itself fails, and
 * skips the reveal animation entirely under reduced motion.
 */
export function PixelImage({
  src,
  alt,
  width,
  height,
  pixelSize = 8,
  hoverReveal = false,
  className,
  priority = false,
}: PixelImageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const stepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentPixel, setCurrentPixel] = useState(pixelSize);

  // Paint the image at a given chunkiness.
  const paint = useCallback((chunk: number) => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !img || !wrap || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = wrap.clientWidth;
    if (cssW === 0) return;
    const cssH = Math.round((cssW * height) / width);

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (chunk <= 1) {
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return;
    }

    // Downsample small, then blow it back up with smoothing off.
    const smallW = Math.max(1, Math.round(cssW / chunk));
    const smallH = Math.max(1, Math.round(cssH / chunk));

    const off = document.createElement("canvas");
    off.width = smallW;
    off.height = smallH;
    const offCtx = off.getContext("2d");
    if (!offCtx) return;
    offCtx.imageSmoothingEnabled = true;
    offCtx.drawImage(img, 0, 0, smallW, smallH);

    ctx.drawImage(off, 0, 0, smallW, smallH, 0, 0, canvas.width, canvas.height);
  }, [width, height]);

  // Load the source image once.
  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    if (priority) img.fetchPriority = "high";
    img.onload = () => {
      imageRef.current = img;
      setLoaded(true);
    };
    img.onerror = () => setFailed(true);
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, priority]);

  // Repaint on load, on chunk change, and on resize.
  useEffect(() => {
    if (!loaded) return;
    paint(currentPixel);

    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => paint(currentPixel));
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [loaded, currentPixel, paint]);

  useEffect(() => {
    setCurrentPixel(pixelSize);
  }, [pixelSize]);

  const clearTimer = () => {
    if (stepTimer.current) {
      clearTimeout(stepTimer.current);
      stepTimer.current = null;
    }
  };

  // Walk the chunkiness ladder one discrete step at a time, so the reveal
  // reads as an 8-bit transition rather than a smooth CSS fade.
  const walkTo = useCallback((sharp: boolean) => {
    clearTimer();
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setCurrentPixel(sharp ? 1 : pixelSize);
      return;
    }

    const ladder = sharp
      ? REVEAL_STEPS.filter((s) => s <= pixelSize)
      : [...REVEAL_STEPS].reverse().filter((s) => s <= pixelSize);

    let i = 0;
    const advance = () => {
      if (i >= ladder.length) return;
      setCurrentPixel(ladder[i]);
      i += 1;
      stepTimer.current = setTimeout(advance, STEP_MS);
    };
    advance();
  }, [pixelSize]);

  useEffect(() => clearTimer, []);

  if (failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn("h-auto w-full object-cover", className)}
      />
    );
  }

  const interactive = hoverReveal;

  return (
    <div
      ref={wrapRef}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: `${width} / ${height}` }}
      onMouseEnter={interactive ? () => walkTo(true) : undefined}
      onMouseLeave={interactive ? () => walkTo(false) : undefined}
      onFocus={interactive ? () => walkTo(true) : undefined}
      onBlur={interactive ? () => walkTo(false) : undefined}
      tabIndex={interactive ? 0 : undefined}
      role="img"
      aria-label={alt}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "pixelated block h-full w-full transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      />
    </div>
  );
}
