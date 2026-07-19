/**
 * Central GSAP registration + reduced-motion guard.
 *
 * Import gsap/ScrollTrigger/SplitText from here — never from "gsap" directly —
 * so plugin registration happens exactly once.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
}

/**
 * Module-level reduced-motion guard. When true:
 * - every preset factory resolves to an instant-set (final state, no motion)
 * - the Lenis provider does not mount (native scroll)
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True when the viewport is below the 768px `md` breakpoint. */
export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

/**
 * Static-fallback guard for the scrub/ambient presets (project rule: below
 * 768px, no scroll-driven effects). True when the user prefers reduced motion
 * OR the viewport is <768px; the parallax/chevron/footer-scrub factories then
 * resolve to their final visible state with no scrub.
 *
 * Content reveals (word/line/clip/fade) DON'T use this — they degrade to a
 * simple fadeUp once-trigger on mobile via `mobileMotion()` (the user's mobile
 * pass sanctions "simple fadeUp once-triggers … no scrub, no pinning"). Only
 * `prefersReducedMotion()` collapses those to an instant-set.
 *
 * The hero handles its own gating (`mountHero` + gsap.matchMedia) because its
 * static markup is already the composed end state.
 */
export function motionStatic(): boolean {
  if (typeof window === "undefined") return false;
  return prefersReducedMotion() || isMobileViewport();
}

/**
 * True on a <768px viewport when the user has NOT asked for reduced motion —
 * the regime where content reveals play as a simple fadeUp once-trigger
 * instead of their full desktop choreography (SplitText line/word wipes,
 * clip-path reveals). Kept distinct from `prefersReducedMotion()` so reduced
 * motion stays fully static everywhere.
 */
export function mobileMotion(): boolean {
  return isMobileViewport() && !prefersReducedMotion();
}

export { gsap, ScrollTrigger, SplitText, CustomEase };
