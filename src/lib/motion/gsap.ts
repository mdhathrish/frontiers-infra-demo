/**
 * Central GSAP registration + reduced-motion guard.
 *
 * Import gsap/ScrollTrigger/SplitText from here — never from "gsap" directly —
 * so plugin registration happens exactly once.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
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

export { gsap, ScrollTrigger, SplitText };
