"use client";
/**
 * Lenis smooth scroll, wired exactly per MOTION-SPEC.md §1:
 *
 * - `<ReactLenis root options={{ autoRaf: false }}>` — Lenis does NOT run
 *   its own rAF; gsap.ticker drives it (`lenis.raf(t * 1000)`) with
 *   `lagSmoothing(0)` so ScrollTrigger and Lenis share one clock
 * - `anchors` on: in-page `#hash` links smooth-scroll through Lenis instead
 *   of hard-jumping (otherwise a native jump bypasses the smooth-scroll
 *   entirely, which reads as a hitch on a site tuned this soft). The
 *   `offset: -HEADER_OFFSET` lands every target below the fixed header —
 *   necessary because not every section carries top padding (e.g. the
 *   Chevrons `#portfolio` section is `pb-24` only, so a zero-offset jump
 *   would tuck its heading behind the header).
 * - desktop-only: not mounted at all on touch devices (native scroll)
 * - disabled entirely for prefers-reduced-motion users
 * - overlays/modals should set `data-lenis-prevent` and lock body overflow
 */
import { useEffect, useRef, useState } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import "lenis/dist/lenis.css";

/** Fixed header height at md+ (Nav is `md:h-20` = 80px); Lenis only mounts on
 *  desktop, so this is the height anchor targets must clear. */
const HEADER_OFFSET = 80;

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<LenisRef>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // isTouch === 1 → touch-only device: keep native scroll.
    setEnabled(ScrollTrigger.isTouch !== 1 && !prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const lenis = lenisRef.current?.lenis;
    const raf = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis?.on("scroll", ScrollTrigger.update);
    return () => {
      gsap.ticker.remove(raf);
      lenis?.off("scroll", ScrollTrigger.update);
    };
  }, [enabled]);

  if (!enabled) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{ autoRaf: false, anchors: { offset: -HEADER_OFFSET } }}
      ref={lenisRef}
    >
      {children}
    </ReactLenis>
  );
}
