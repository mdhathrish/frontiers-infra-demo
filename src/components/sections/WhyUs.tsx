"use client";
/**
 * Section 2 — "Why Frontier Infra" (MOTION-SPEC.md §3.2 why-us, white bg).
 *
 * Spec structure and triggers:
 * - heading + paragraph: lineWipe (white tint), trigger window
 *   `top bottom-=200px → center center`, once
 * - full-width video: clipWipe on entry (once) + parallax zoom
 *   `scale 1 → 1.1` (scrub 1.5) — split across outer/inner wrappers so the
 *   two tweens compose
 * - supporting still (ASSETS.md §3.2 mapping): clipWipe; adjacent copy fadeUp
 */
import Image from "next/image";
import {
  useReveal,
  lineWipe,
  lineWipeTrigger,
  clipWipe,
  fadeUp,
  parallax,
  parallaxTrigger,
} from "@/lib/motion";

const WHITE_TINT = "rgba(255,255,255,0.8)";
const HOVER_EASE = "ease-[cubic-bezier(.16,1,.3,1)]";

export default function WhyUs() {
  const copyRef = useReveal<HTMLDivElement>(
    (el) => lineWipe(el, { color: WHITE_TINT }),
    lineWipeTrigger
  );
  const videoClipRef = useReveal<HTMLDivElement>((el) => clipWipe(el));
  const videoZoomRef = useReveal<HTMLDivElement>(
    (el) => parallax(el, { fromY: 0, toY: 0, scale: [1, 1.1] }),
    parallaxTrigger
  );
  const stillRef = useReveal<HTMLDivElement>((el) => clipWipe(el));
  const detailRef = useReveal<HTMLDivElement>((el) =>
    fadeUp(el.querySelectorAll("[data-fade]"))
  );

  return (
    <section
      id="why-us"
      aria-label="Why Frontier Infra"
      className="relative z-10 bg-white py-24 text-slate-900 md:py-36"
    >
      <div ref={copyRef} className="invisible px-6 md:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
          Why Frontier Infra
        </p>
        <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
          Hyderabad is building its next century. We hold the ground it stands
          on.
        </h2>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-600">
          From HMDA-approved plots along the Outer Ring Road to signature
          residences in Kokapet and Tellapur, Frontier Infra pairs deep local
          diligence with institutional-grade execution. Every title is
          verified, every site is walked, every commitment is documented — so
          what you see is precisely what you own.
        </p>
      </div>

      {/* Full-width video: outer = clip reveal, inner = parallax zoom. */}
      <div
        ref={videoClipRef}
        className="invisible relative mt-16 aspect-video w-full overflow-hidden md:mt-24 md:aspect-[21/9]"
      >
        <div ref={videoZoomRef} className="absolute inset-0">
          <video
            className="h-full w-full object-cover"
            src="/assets/videos/pexels-video-aerial-drone-house-12240430.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Aerial footage of a residential district"
          />
        </div>
      </div>

      <div className="mt-20 grid items-center gap-12 px-6 md:mt-32 md:grid-cols-2 md:gap-20 md:px-10">
        <div
          ref={stillRef}
          className="invisible relative aspect-[4/3] overflow-hidden"
        >
          <Image
            src="/assets/sections/pexels-max-vakhtbovych-7031595.webp"
            alt="Contemporary villa against a clear sky"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className={`object-cover transition-transform duration-[4000ms] ${HOVER_EASE} hover:scale-105`}
          />
        </div>
        <div ref={detailRef}>
          <h3
            data-fade
            className="invisible max-w-md text-2xl font-semibold tracking-tight md:text-4xl"
          >
            Considered, not aggregated.
          </h3>
          <p
            data-fade
            className="invisible mt-6 max-w-md text-base leading-relaxed text-slate-600 md:text-lg"
          >
            We don&apos;t list inventory; we curate it. Each residence and
            parcel enters our portfolio for its bones — orientation, access,
            the arc of the corridor it sits on — and is held to the standard
            we&apos;d demand of our own homes.
          </p>
          <a
            data-fade
            href="#portfolio"
            className={`invisible mt-10 inline-block rounded-full border border-slate-900/25 px-6 py-3 text-sm font-medium transition-transform duration-700 ${HOVER_EASE} hover:scale-105`}
          >
            Explore the portfolio
          </a>
        </div>
      </div>
    </section>
  );
}
