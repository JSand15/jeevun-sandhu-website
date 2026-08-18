"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useArcade } from "@/components/arcade/arcade-provider";
import { useScrollXp } from "@/components/arcade/use-scroll-xp";

/**
 * Route-level glue: records which pages have been seen (which drives the
 * EXPLORER / COMPLETIONIST trophies) and awards XP for reading depth.
 */
export function ArcadeTracker() {
  const pathname = usePathname();
  const { markVisited } = useArcade();

  useScrollXp();

  useEffect(() => {
    if (!pathname) return;
    markVisited(pathname);
  }, [pathname, markVisited]);

  return null;
}
