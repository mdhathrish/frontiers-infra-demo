"use client";
/**
 * useReveal — attaches a preset timeline to a ScrollTrigger following the
 * spec's trigger philosophy (MOTION-SPEC.md §2):
 *
 * - everything triggers ONCE by default, starting ~200px before the element
 *   enters the viewport (`top bottom-=200px`) so content animates in early
 * - scrub is RESERVED and must be passed explicitly — the only scrubbed
 *   things are the hero cinematic (0.1), the chevrons row (3), ambient
 *   parallax (1.5, see `parallaxTrigger`), and the footer slide-up (true).
 *   Phase 2: scrub now runs on mobile too (the reference scrubs its mobile
 *   parallax / chevrons / footer)
 * - reduced motion: factories instant-set their final state at mount, so no
 *   ScrollTrigger is created at all
 * - mobile (<768px, motion allowed): content presets run their real
 *   choreography (word/line/clip wipes), retimed for phones (Phase 2), driven
 *   by the same once-trigger as desktop
 *
 * Perf (integration QA pass): once-reveals build their preset LAZILY, inside
 * the trigger's `onEnter`, rather than at mount. Building eagerly meant every
 * section ran `new SplitText()` (a forced synchronous reflow) during the first
 * frames — ~10 sections' worth of layout thrash landed in one long task and
 * dominated Total Blocking Time. Deferring the build means an off-screen
 * section does no layout work until it's actually approached, and each split
 * now measures already-loaded fonts. Scrubbed reveals still build at mount
 * (the scrub needs the timeline up front, and none of them use SplitText), and
 * the static fallback still builds at mount so its instant-set runs immediately.
 * A timeline built inside `onEnter` is created after useGSAP's context has
 * captured its synchronous work, so it is cleaned up explicitly here.
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

      if (prefersReducedMotion()) {
        // Factory instant-sets the final state at mount; nothing to trigger.
        const tl = build(el);
        return () => tl?.cleanup?.();
      }

      const { scrub, start, end } = options;

      // Scrubbed reveals need their timeline attached up front for the scrub to
      // drive — build eagerly (none of these use SplitText, so it's cheap).
      // Phase 2: scrub now wires up on mobile too (the reference scrubs its
      // mobile parallax / chevrons / footer). Reduced motion already returned
      // above, so no ScrollTrigger is created for it.
      if (scrub != null) {
        const tl = build(el);
        if (!tl) return;
        ScrollTrigger.create({
          trigger: el,
          animation: tl,
          start: start ?? "top bottom",
          end: end ?? "bottom top",
          scrub,
        });
        return () => tl.cleanup?.();
      }

      // Once-reveals: defer the (SplitText-heavy) build to onEnter so nothing
      // off-screen does layout work at mount. The timeline auto-plays on
      // creation; `once` disables the trigger after it fires.
      let tl: PresetTimeline | void;
      ScrollTrigger.create({
        trigger: el,
        start: start ?? "top bottom-=200px",
        end,
        once: true,
        onEnter: () => {
          tl = build(el);
        },
      });
      return () => tl?.cleanup?.();
    },
    { scope: ref }
  );

  return ref;
}
