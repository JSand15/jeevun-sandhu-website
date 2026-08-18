"use client";

import { useEffect, useRef } from "react";

import { useArcade } from "./arcade-provider";

const DEPTH_BANDS = [25, 50, 75, 100];
const XP_PER_BAND = 10;
const BOTTOM_TOLERANCE_PX = 4;

interface ScrollMetrics {
  depth: number;
  atBottom: boolean;
}

function computeMetrics(): ScrollMetrics | null {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop || 0;
  const viewport = window.innerHeight;
  const fullHeight = doc.scrollHeight;
  const scrollable = fullHeight - viewport;

  // page isn't taller than the viewport — nothing to track
  if (scrollable <= 0) return null;

  const depth = Math.min(100, Math.max(0, (scrollTop / scrollable) * 100));
  const atBottom = scrollTop + viewport >= fullHeight - BOTTOM_TOLERANCE_PX;

  return { depth, atBottom };
}

/**
 * Awards XP as the user scrolls a page: 10 XP per new 25% depth band
 * reached (max 40 XP per page load), and unlocks "scroll-master" when
 * the user hits the bottom of the page. No-ops on pages shorter than
 * the viewport.
 */
export function useScrollXp() {
  const { hydrated, awardXp, unlock } = useArcade();

  const maxDepthRef = useRef(0);
  const awardedBandsRef = useRef<Set<number>>(new Set());
  const bottomReachedRef = useRef(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;

    function evaluate() {
      const metrics = computeMetrics();
      if (!metrics) return;

      if (metrics.depth > maxDepthRef.current) {
        maxDepthRef.current = metrics.depth;
      }

      for (const band of DEPTH_BANDS) {
        if (maxDepthRef.current >= band && !awardedBandsRef.current.has(band)) {
          awardedBandsRef.current.add(band);
          awardXp(XP_PER_BAND, `scroll-depth-${band}`);
        }
      }

      if (metrics.atBottom && !bottomReachedRef.current) {
        bottomReachedRef.current = true;
        unlock("scroll-master");
      }
    }

    function onScrollOrResize() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      window.requestAnimationFrame(() => {
        tickingRef.current = false;
        evaluate();
      });
    }

    // catch pages that load already scrolled, or exactly at the bottom
    evaluate();

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [hydrated, awardXp, unlock]);
}
