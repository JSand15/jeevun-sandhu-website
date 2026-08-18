"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealTag =
  | "div"
  | "section"
  | "article"
  | "li"
  | "span"
  | "p"
  | "h2"
  | "h3";

const EASE_LUXE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to hold before the reveal starts. */
  delay?: number;
  /** Px traveled on the way in. Kept small — this is a glide, not a slide. */
  distance?: number;
  /** Add a soft blur-to-focus finish. */
  blur?: boolean;
  as?: RevealTag;
}

/**
 * The premium replacement for a plain fade-in: slower (~1.1s), a gentle
 * custom ease, and a small travel distance so it reads as weighty rather
 * than bouncy. Instant and transform-free under reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 24,
  blur = false,
  as = "div",
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motion[as];

  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : distance,
      filter: blur && !shouldReduceMotion ? "blur(6px)" : "blur(0px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
    },
  };

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15% 0px" }}
      variants={variants}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 1.1, delay, ease: EASE_LUXE }
      }
    >
      {children}
    </MotionTag>
  );
}

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  as?: RevealTag;
}

/** Wrap a list of `RevealChild` with this to stagger their entrance. */
export function RevealGroup({
  children,
  className,
  as = "div",
}: RevealGroupProps) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motion[as];

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
      },
    },
  };

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-15% 0px" }}
      variants={container}
    >
      {children}
    </MotionTag>
  );
}

interface RevealChildProps {
  children: ReactNode;
  className?: string;
  distance?: number;
  blur?: boolean;
  as?: RevealTag;
}

/** A single staggered item — must be a direct child of `RevealGroup`. */
export function RevealChild({
  children,
  className,
  distance = 24,
  blur = false,
  as = "div",
}: RevealChildProps) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = motion[as];

  const item: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : distance,
      filter: blur && !shouldReduceMotion ? "blur(6px)" : "blur(0px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 1.1, ease: EASE_LUXE },
    },
  };

  return (
    <MotionTag className={className} variants={item}>
      {children}
    </MotionTag>
  );
}
