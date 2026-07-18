"use client";
/**
 * Section 10 — Outro (MOTION-SPEC.md §3.10, video bg).
 *
 * Spec structure and triggers:
 * - background video: parallax zoom `scale 1 → 1.1` (scrub 1.5) + clipWipe
 *   on the media frame on entry, once — same outer/inner split as
 *   WhyUs/Steps (outer = clip, inner = zoom)
 * - headline: lineWipe, dark tint — the spec table says white, but the
 *   overlay must match what's behind the text (spec §2.1: "`color` MUST
 *   match the section background"); here that's a dark video under a
 *   black/45 scrim, and the white tint rendered as white boxes over the
 *   footage mid-wipe (caught in the integration QA pass) + CTA fadeUp
 *
 * Imagery per ASSETS.md — the outro background video.
 */
import {
  useReveal,
  lineWipe,
  lineWipeTrigger,
  clipWipe,
  fadeUp,
  parallax,
  parallaxTrigger,
} from "@/lib/motion";

/** Matches the video's black/45 scrim, not the section token — see header note. */
const SCRIM_TINT = "rgba(21,23,23,0.8)";
const HOVER_EASE = "ease-[cubic-bezier(.16,1,.3,1)]";

export default function Outro() {
  const frameClipRef = useReveal<HTMLDivElement>((el) => clipWipe(el));
  const frameZoomRef = useReveal<HTMLDivElement>(
    (el) => parallax(el, { fromY: 0, toY: 0, scale: [1, 1.1] }),
    parallaxTrigger
  );
  const copyRef = useReveal<HTMLDivElement>(
    (el) => lineWipe(el, { color: SCRIM_TINT }),
    lineWipeTrigger
  );
  const ctaRef = useReveal<HTMLDivElement>((el) =>
    fadeUp(el.querySelectorAll("[data-fade]"))
  );

  return (
    <section
      id="outro"
      aria-label="Find your next frontier"
      className="relative z-10 overflow-hidden bg-[#151717] text-white"
    >
      <div
        ref={frameClipRef}
        className="invisible relative aspect-[4/5] w-full overflow-hidden md:aspect-[16/9]"
      >
        <div ref={frameZoomRef} className="absolute inset-0">
          <video
            className="h-full w-full object-cover"
            src="/assets/videos/pexels-video-modern-architecture-856662.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Time-lapse of sky reflected in modern architecture"
          />
        </div>
        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div ref={copyRef} className="invisible max-w-3xl">
            <h2 className="text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
              Your next address is already being built.
            </h2>
          </div>
          <div ref={ctaRef} className="mt-10">
            <a
              data-fade
              href="#contact"
              className={`invisible inline-block rounded-full bg-white px-7 py-3 text-sm font-medium text-slate-900 transition-transform duration-700 ${HOVER_EASE} hover:scale-105`}
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
