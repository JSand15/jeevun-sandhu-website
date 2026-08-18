"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useScroll, type MotionValue } from "framer-motion";

import { cn } from "@/lib/utils";

const SceneProgressContext = createContext<MotionValue<number> | null>(null);

/** Read the current scene's 0→1 scroll progress from inside a `ScrollScene`. */
export function useSceneProgress(): MotionValue<number> {
  const ctx = useContext(SceneProgressContext);
  if (!ctx) {
    throw new Error("useSceneProgress must be used within a ScrollScene");
  }
  return ctx;
}

interface ScrollSceneProps {
  children: ReactNode | ((progress: MotionValue<number>) => ReactNode);
  className?: string;
  /** Total scroll travel the scene is pinned for. */
  height?: string;
}

/**
 * A pinned/sticky scene: a tall outer wrapper containing a `sticky top-0
 * h-svh` inner stage, so children can animate through a full scroll of
 * travel while staying visually locked in place. Progress is available via
 * the render-prop argument or `useSceneProgress()`.
 */
export function ScrollScene({
  children,
  className,
  height = "200vh",
}: ScrollSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={ref} className={cn("relative", className)} style={{ height }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        <SceneProgressContext.Provider value={scrollYProgress}>
          {typeof children === "function"
            ? children(scrollYProgress)
            : children}
        </SceneProgressContext.Provider>
      </div>
    </div>
  );
}
