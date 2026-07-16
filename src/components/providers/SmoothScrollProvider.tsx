"use client";
/**
 * Lenis smooth scroll, wired exactly per MOTION-SPEC.md §1:
 *
 * - `<ReactLenis root options={{ autoRaf: false }}>` — Lenis does NOT run
 *   its own rAF; gsap.ticker drives it (`lenis.raf(t * 1000)`) with
 *   `lagSmoothing(0)` so ScrollTrigger and Lenis share one clock
 * - desktop-only: not mounted at all on touch devices (native scroll)
 * - disabled entirely for prefers-reduced-motion users
 * - overlays/modals should set `data-lenis-prevent` and lock body overflow
 */
import { useEffect, useRef, useState } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";
import "lenis/dist/lenis.css";

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
    <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
