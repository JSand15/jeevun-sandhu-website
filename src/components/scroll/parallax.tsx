"use client";

import { useRef, type ReactNode } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import { cn } from "@/lib/utils";

interface ParallaxProps {
  /** Signed multiplier: negative drifts slower/backwards, positive drifts faster. */
  speed?: number;
  children: ReactNode;
  className?: string;
}

/**
 * Translates its children on Y as the element passes through the viewport.
 * Transform-only (never top/left) so it stays off the main thread's layout
 * pass. Inert under reduced motion.
 */
export function Parallax({ speed = 0.2, children, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const range = 120 * speed;
  const rawY = useTransform(scrollYProgress, [0, 1], [-range, range]);
  const y = useSpring(rawY, { stiffness: 90, damping: 24, mass: 0.4 });

  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  /** Signed multiplier: negative drifts slower/backwards, positive drifts faster. */
  speed?: number;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  /** Lay a `bg-background/70` scrim over the image for text legibility. */
  overlay?: boolean;
}

/**
 * A full-bleed, parallaxing `next/image` inside an `overflow-hidden` box.
 * Scaled up ~1.25x so the parallax translation never exposes an edge.
 */
export function ParallaxImage({
  src,
  alt,
  speed = 0.2,
  className,
  imageClassName,
  priority,
  overlay,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const range = 120 * speed;
  const rawY = useTransform(scrollYProgress, [0, 1], [-range, range]);
  const y = useSpring(rawY, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0 scale-125"
        style={shouldReduceMotion ? undefined : { y }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
      </motion.div>
      {overlay ? (
        <div className="bg-background/70 absolute inset-0" aria-hidden="true" />
      ) : null}
    </div>
  );
}
