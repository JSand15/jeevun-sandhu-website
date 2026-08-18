/**
 * A dependency-free, damped ("luxury") scroll engine.
 *
 * The browser's native wheel scrolling is intercepted and replaced with a
 * virtual `target` position that a rAF loop lerps `current` toward. The
 * result: every wheel notch moves the page LESS than the native default,
 * and the page glides to a stop instead of snapping — heavy, never floaty.
 *
 * This class is intentionally framework-agnostic (no React) so it can be
 * mounted/unmounted cleanly from `SmoothScrollProvider`.
 */

export interface SmoothScrollOptions {
  /** Multiplier applied to every normalized wheel delta. Lower = each notch does less. */
  wheelMultiplier?: number;
  /** Linear interpolation factor per animation frame. Lower = heavier glide. */
  lerp?: number;
  /**
   * Multiplier reserved for non-native touch-like wheel input (e.g. a
   * stylus or an external mouse on a touch device that still fires wheel
   * events). Real touch scrolling is always left untouched — see
   * `isCoarsePointer()` — so this only matters in that edge case.
   */
  touchMultiplier?: number;
  /** Hard clamp (in normalized pixels, pre-multiplier) on any single wheel delta. */
  maxDelta?: number;
}

export const SCROLL_DEFAULTS: Required<SmoothScrollOptions> = {
  wheelMultiplier: 0.55,
  lerp: 0.075,
  touchMultiplier: 0.8,
  maxDelta: 120,
};

export interface ScrollToOptions {
  /** Skip the glide and jump straight there. */
  immediate?: boolean;
}

/** Pixels-per-line used to normalize `deltaMode === 1` (line) wheel events. */
const LINE_HEIGHT_PX = 16;
/** Below this |target - current| gap (px) the rAF loop parks itself. */
const STOP_THRESHOLD = 0.1;
/**
 * How far (px) the real `window.scrollY` may drift from the last position we
 * ourselves wrote before we treat a `scroll` event as externally caused
 * (scrollbar drag, keyboard nav, anchor jump) and resync to it.
 */
const RESYNC_THRESHOLD = 2;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isCoarsePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function getScrollingElement(): Element | null {
  return document.scrollingElement ?? document.documentElement;
}

function getMaxScroll(): number {
  const el = getScrollingElement();
  if (!el) return 0;
  return Math.max(0, el.scrollHeight - window.innerHeight);
}

/** Walks up from `el` looking for a `[data-no-smooth-scroll]` or dialog ancestor. */
function hasScrollBlockerAttribute(el: Element): boolean {
  return el.closest('[data-no-smooth-scroll], [role="dialog"]') !== null;
}

/**
 * Walks up from `el` looking for a real scrollable ancestor — one whose
 * overflow is auto/scroll on either axis AND that actually has room to move.
 * Checking both axes matters: a horizontally scrollable code block would
 * otherwise be hijacked and become unscrollable by trackpad swipe.
 */
function hasScrollableAncestor(el: Element): boolean {
  let node: Element | null = el;
  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node);

    const scrollableY = style.overflowY === "auto" || style.overflowY === "scroll";
    if (scrollableY && node.scrollHeight > node.clientHeight + 1) return true;

    const scrollableX = style.overflowX === "auto" || style.overflowX === "scroll";
    if (scrollableX && node.scrollWidth > node.clientWidth + 1) return true;

    node = node.parentElement;
  }
  return false;
}

/**
 * True while something (a dialog, a sheet) has locked page scrolling. The
 * engine must stand down entirely: the backdrop is a sibling of the dialog,
 * not a descendant, so an attribute check on the event target alone misses it.
 */
function isScrollLocked(): boolean {
  const html = document.documentElement;
  if (html.hasAttribute("data-base-ui-scroll-locked")) return true;
  return (
    window.getComputedStyle(html).overflow === "hidden" ||
    window.getComputedStyle(document.body).overflow === "hidden"
  );
}

export class SmoothScroll {
  private readonly options: Required<SmoothScrollOptions>;

  private current = 0;
  private target = 0;
  /** The scrollY value we most recently wrote via `window.scrollTo`, used to tell our own `scroll` events apart from externally caused ones. */
  private expectedY = 0;

  private rafId: number | null = null;
  private running = false;
  private destroyed = false;

  constructor(options: SmoothScrollOptions = {}) {
    this.options = { ...SCROLL_DEFAULTS, ...options };
  }

  start(): void {
    if (typeof window === "undefined" || this.running || this.destroyed) return;
    this.running = true;

    const y = window.scrollY;
    this.current = y;
    this.target = y;
    this.expectedY = y;

    window.addEventListener("wheel", this.handleWheel, { passive: false });
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("hashchange", this.handleHashChange);
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;

    window.removeEventListener("wheel", this.handleWheel);
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("hashchange", this.handleHashChange);

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy(): void {
    this.stop();
    this.destroyed = true;
  }

  /** Programmatic navigation (e.g. a "back to top" button, a router effect). */
  scrollTo(y: number, options: ScrollToOptions = {}): void {
    if (typeof window === "undefined" || this.destroyed) return;

    const clamped = Math.min(Math.max(y, 0), getMaxScroll());
    this.target = clamped;

    if (options.immediate) {
      this.current = clamped;
      this.applyScroll(clamped);
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      return;
    }

    this.ensureLoop();
  }

  private applyScroll(y: number): void {
    this.expectedY = y;
    window.scrollTo(0, y);
  }

  private ensureLoop(): void {
    if (this.rafId === null && this.running) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  }

  private loop = (): void => {
    if (!this.running) {
      this.rafId = null;
      return;
    }

    const diff = this.target - this.current;

    if (Math.abs(diff) < STOP_THRESHOLD) {
      this.current = this.target;
      this.applyScroll(this.current);
      this.rafId = null; // park — nothing left to animate
      return;
    }

    this.current += diff * this.options.lerp;
    this.applyScroll(this.current);
    this.rafId = requestAnimationFrame(this.loop);
  };

  private shouldHijack(event: WheelEvent): boolean {
    if (this.destroyed) return false;
    // ctrl+wheel is how browsers deliver pinch-to-zoom. Never swallow it.
    if (event.ctrlKey || event.metaKey) return false;
    // A predominantly horizontal gesture belongs to the browser; we only
    // drive the vertical axis.
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return false;
    if (prefersReducedMotion()) return false;
    if (isCoarsePointer()) return false;
    if (getMaxScroll() <= 0) return false;
    if (isScrollLocked()) return false;

    const target = event.target;
    if (target instanceof Element) {
      if (hasScrollBlockerAttribute(target)) return false;
      if (hasScrollableAncestor(target)) return false;
    }

    return true;
  }

  private handleWheel = (event: WheelEvent): void => {
    if (!this.shouldHijack(event)) return;

    let delta = event.deltaY;
    if (event.deltaMode === 1) delta *= LINE_HEIGHT_PX;
    else if (event.deltaMode === 2) delta *= window.innerHeight;

    const { maxDelta, wheelMultiplier } = this.options;
    delta = Math.max(-maxDelta, Math.min(maxDelta, delta));

    event.preventDefault();

    const max = getMaxScroll();
    this.target = Math.min(Math.max(this.target + delta * wheelMultiplier, 0), max);
    this.ensureLoop();
  };

  /**
   * Detects scroll changes we did not cause ourselves — keyboard nav,
   * scrollbar drag, browser scroll restoration, anchor jumps — and resyncs
   * our virtual state to match instead of fighting the browser.
   */
  private handleScroll = (): void => {
    const realY = window.scrollY;
    if (Math.abs(realY - this.expectedY) < RESYNC_THRESHOLD) return;

    // The scroll came from somewhere else (scrollbar drag, keyboard, anchor).
    // Cancel any in-flight glide, otherwise the loop spends the next second
    // yanking the page back toward its stale target every frame.
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.current = realY;
    this.target = realY;
    this.expectedY = realY;
  };

  private handleResize = (): void => {
    const max = getMaxScroll();
    this.target = Math.min(this.target, max);
    this.ensureLoop();
  };

  private handleHashChange = (): void => {
    // Let the browser finish its native (instant) jump to the anchor, then
    // resync so the engine doesn't try to glide back from where it was.
    requestAnimationFrame(() => {
      const y = window.scrollY;
      this.current = y;
      this.target = y;
      this.expectedY = y;
    });
  };
}
