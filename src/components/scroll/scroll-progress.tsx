"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

interface ScrollProgressProps {
  className?: string;
}

/**
 * A 2px reading-progress bar pinned to the top of the viewport, gliding
 * with a spring so it never feels like a raw scroll-linked jitter. Hidden
 * for the first 1% of scroll so it doesn't flash on load.
 */
export function ScrollProgress({ className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
    restDelta: 0.001,
  });
  const opacity = useTransform(scrollYProgress, [0, 0.01, 1], [0, 1, 1]);

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed top-0 left-0 z-50 h-[2px] w-full origin-left",
        "from-arcade to-arcade-cyan bg-gradient-to-r",
        className
      )}
      style={{ scaleX, opacity }}
    />
  );
}
