"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import {
  SmoothScroll,
  isCoarsePointer,
  prefersReducedMotion,
  type ScrollToOptions,
} from "@/lib/scroll/smooth-scroll";

/**
 * Class toggled on `<html>` while the damped scroll engine is actually
 * running. `globals.css` scopes its native `scroll-behavior: smooth`
 * fallback to `html:not(.smooth-scroll-active)`, so this class must be
 * present exactly when — and only when — our rAF loop owns scrolling,
 * otherwise the browser's native smoothing fights our lerp.
 */
const ACTIVE_CLASS = "smooth-scroll-active";

interface SmoothScrollContextValue {
  scrollTo: (y: number, options?: ScrollToOptions) => void;
  enabled: boolean;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(
  null
);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<SmoothScroll | null>(null);
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const active = !prefersReducedMotion() && !isCoarsePointer();
    setEnabled(active);

    if (!active) {
      document.documentElement.classList.remove(ACTIVE_CLASS);
      return;
    }

    const engine = new SmoothScroll();
    engineRef.current = engine;
    engine.start();
    document.documentElement.classList.add(ACTIVE_CLASS);

    return () => {
      engine.destroy();
      engineRef.current = null;
      document.documentElement.classList.remove(ACTIVE_CLASS);
    };
  }, []);

  useEffect(() => {
    // Re-sync to the top of the viewport on client-side route changes so
    // the damped engine doesn't try to glide from the previous page's
    // scroll offset.
    engineRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  const value = useMemo<SmoothScrollContextValue>(
    () => ({
      enabled,
      scrollTo: (y, options) => {
        engineRef.current?.scrollTo(y, options);
      },
    }),
    [enabled]
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll(): SmoothScrollContextValue {
  const ctx = useContext(SmoothScrollContext);
  if (!ctx) {
    throw new Error("useSmoothScroll must be used within a SmoothScrollProvider");
  }
  return ctx;
}
