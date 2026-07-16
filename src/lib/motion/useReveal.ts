"use client";
/**
 * useReveal — attaches a preset timeline to a ScrollTrigger following the
 * spec's trigger philosophy (MOTION-SPEC.md §2):
 *
 * - everything triggers ONCE by default, starting ~200px before the element
 *   enters the viewport (`top bottom-=200px`) so content animates in early
 * - scrub is RESERVED and must be passed explicitly — the only scrubbed
 *   things are the hero cinematic (0.1), the chevrons row (3), ambient
 *   parallax (1.5, see `parallaxTrigger`), and the footer slide-up (true)
 * - reduced motion: factories have already resolved to instant-set, so no
 *   ScrollTrigger is created at all
 */
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";
import type { PresetTimeline } from "./presets";

gsap.registerPlugin(useGSAP);

export interface RevealOptions {
  /** Reserved — pass explicitly per spec (hero 0.1, chevrons 3, parallax 1.5, footer true). Omit for the default trigger-once behavior. */
  scrub?: number | boolean;
  start?: string;
  end?: string;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  build: (el: T) => PresetTimeline | void,
  options: RevealOptions = {}
) {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const tl = build(el);
      if (!tl) return;
      if (prefersReducedMotion()) {
        // Factory already instant-set the final state; nothing to trigger.
        return () => tl.cleanup?.();
      }
      const { scrub, start, end } = options;
      ScrollTrigger.create({
        trigger: el,
        animation: tl,
        start: start ?? (scrub != null ? "top bottom" : "top bottom-=200px"),
        end: end ?? (scrub != null ? "bottom top" : undefined),
        ...(scrub != null ? { scrub } : { once: true }),
      });
      return () => tl.cleanup?.();
    },
    { scope: ref }
  );

  return ref;
}
