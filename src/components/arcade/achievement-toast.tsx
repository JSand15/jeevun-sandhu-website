"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { Achievement, AchievementId } from "@/lib/arcade/types";

import { useArcade } from "./arcade-provider";
import { getArcadeIcon } from "./icon-map";

const AUTO_DISMISS_MS = 4500;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

interface ToastCardProps {
  achievement: Achievement;
  reducedMotion: boolean;
  onDismiss: (id: AchievementId) => void;
}

function ToastCard({ achievement, reducedMotion, onDismiss }: ToastCardProps) {
  // Hold the dismiss callback in a ref so the timer is keyed only on the
  // achievement id. Passing an inline closure here would restart the countdown
  // on every unrelated arcade state change (scroll XP, a second unlock), and a
  // busy page could keep a toast on screen indefinitely.
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  const id = achievement.id;

  useEffect(() => {
    const timer = window.setTimeout(() => dismissRef.current(id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [id]);

  const Icon = getArcadeIcon(achievement.icon);

  return (
    <motion.div
      layout
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -36, scale: 0.92 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.96 }}
      transition={
        reducedMotion
          ? { duration: 0.2, ease: "easeOut" }
          : { type: "spring", stiffness: 420, damping: 24, mass: 0.7 }
      }
      className="pointer-events-auto"
      role="status"
    >
      <div className="relative rounded-none border-2 border-arcade bg-black p-3 shadow-[4px_4px_0_0_var(--arcade)]">
        {!reducedMotion && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 bg-arcade"
          />
        )}
        <div className="relative flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-none border-2 border-arcade bg-black">
            <Icon className="size-4 text-arcade" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-pixel text-[9px] leading-relaxed tracking-[0.2em] text-[color:var(--arcade-dim)]">
              ACHIEVEMENT UNLOCKED
            </p>
            <p className="mt-1 truncate text-sm font-bold text-arcade">{achievement.name}</p>
            <p className="mt-0.5 text-xs leading-snug text-[color:var(--arcade-foreground)]/80">
              {achievement.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(id)}
            aria-label={`Dismiss ${achievement.name} achievement notification`}
            className={cn(
              "ml-auto shrink-0 rounded-none border-2 border-transparent px-1 py-0.5",
              "font-pixel text-[9px] text-[color:var(--arcade-dim)]",
              "hover:border-arcade hover:text-arcade focus-visible:border-arcade focus-visible:outline-none",
            )}
          >
            X
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function AchievementToasts() {
  const { recentUnlocks, dismissUnlock } = useArcade();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-20 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-3 print:hidden"
    >
      <AnimatePresence initial={false}>
        {recentUnlocks.map((achievement) => (
          <ToastCard
            key={achievement.id}
            achievement={achievement}
            reducedMotion={reducedMotion}
            onDismiss={dismissUnlock}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
