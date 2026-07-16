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

/**
 * Static-fallback guard for the preset factories (project rule: below 768px
 * sections show static composed fallbacks — no scroll-driven effects).
 * True when the user prefers reduced motion OR the viewport is <768px; every
 * preset factory then resolves to an instant-set of its final state and
 * `useReveal` creates no ScrollTrigger.
 *
 * The hero handles its own gating (`mountHero` + gsap.matchMedia) because its
 * static markup is already the composed end state.
 */
export function motionStatic(): boolean {
  if (typeof window === "undefined") return false;
  return (
    prefersReducedMotion() || window.matchMedia("(max-width: 767px)").matches
  );
}

export { gsap, ScrollTrigger, SplitText, CustomEase };
