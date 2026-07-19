"use client";
/**
 * Homepage hero — MOTION-SPEC.md §3.1.
 *
 * Purely structural: every animation lives in `mountHero` (src/lib/motion/hero.ts),
 * which finds layers via `data-hero` attributes. The markup below is the
 * static composed fallback (house + sky + full solid wordmark visible) that
 * <768px viewports and prefers-reduced-motion users see as-is.
 *
 * Layout trick from the spec: no ScrollTrigger pinning — a 3,600px-tall
 * section with a `position: sticky` full-viewport stage inside it.
 *
 * Layers (back → front): sky · mid cloud · house · front clouds · title ·
 * wordmark (drawn SVG + house-image-masked SVG stacked for the crossfade).
 */
import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, mountHero } from "@/lib/motion";
import { LOGO_PATHS, LOGO_VIEWBOX } from "./heroLogoPaths";

gsap.registerPlugin(useGSAP);

/** Soft cloud puffs: CSS-masked copies of sky.webp sampling its cloudy band.
    Each is a nested pair — the OUTER div takes the ambient looping drift,
    the INNER div takes the intro fade/rise and the scroll-scrub parting, so
    the two transforms compose instead of fighting (see mountHero). The front
    pair rides high enough to overlap and swallow the building's base. */
const CLOUD_MASK =
  "radial-gradient(ellipse 50% 50% at 50% 50%, black 30%, transparent 72%)";

const CLOUDS: { name: string; className: string; pos: string }[] = [
  {
    // Front-left bank, raised and widened so it laps over the house base and
    // overlaps cloud-r across the centre (was leaving the mid-base exposed).
    name: "cloud-l",
    className: "left-[-16%] bottom-[-2%] w-[90vw] h-[62vh] z-30",
    pos: "28% 72%",
  },
  {
    // Behind the house (z-10): backfill so no sky shows through the parted gap.
    name: "cloud-m",
    className: "left-[8%] bottom-[-10%] w-[78vw] h-[48vh] z-10",
    pos: "52% 68%",
  },
  {
    // Front-right bank, mirror of cloud-l.
    name: "cloud-r",
    className: "right-[-16%] bottom-[-2%] w-[94vw] h-[64vh] z-30",
    pos: "72% 72%",
  },
];

const cloudStyle = (pos: string): CSSProperties => ({
  backgroundImage: "url(/assets/hero/sky.webp)",
  backgroundSize: "175%",
  backgroundPosition: pos,
  WebkitMaskImage: CLOUD_MASK,
  maskImage: CLOUD_MASK,
  filter: "blur(10px) brightness(1.07)",
});

/** Mobile ambient puffs (§ mobile pass): a few soft masked copies of the sky
    that ride the ambient drift loop in `mountHero`'s mobile matchMedia —
    transform-only, no scroll coupling, so the static composed hero still has
    one cheap sign of life on phones. Kept in the MID sky — below the top-left
    headline block, above the bottom-anchored house — so they never clutter the
    copy or fight the house's rise. */
const MOBILE_CLOUDS: { className: string; pos: string }[] = [
  { className: "right-[-12%] top-[26%] h-[18vh] w-[54vw]", pos: "70% 42%" },
  { className: "left-[-14%] top-[34%] h-[16vh] w-[50vw]", pos: "34% 46%" },
  { className: "right-[6%] top-[40%] h-[15vh] w-[46vw]", pos: "58% 40%" },
];

/** Reference mobile hero sky: a soft blue→peach vertical wash laid OVER our
    sky.webp (not replacing it). Cool blue tints the top behind the dark
    headline, the middle clears so the photo reads, and the horizon warms to
    peach where the house's alpha-faded base dissolves into it — the reference's
    dreamy sky feel, built from our own asset. */
const SKY_WASH: CSSProperties = {
  backgroundImage:
    "linear-gradient(to bottom, rgba(120,170,215,0.48) 0%, rgba(165,198,222,0.14) 34%, rgba(246,214,190,0.30) 68%, rgba(247,203,172,0.58) 100%)",
};

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      return mountHero(sectionRef.current);
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      aria-label="Frontier Infra — find your next frontier"
      className="relative h-svh max-md:motion-safe:h-[260vh] md:h-[3600px] bg-[#7db3d6]"
    >
      {/* ── Mobile composition (<768px) ──────────────────────────────────
          Reference-parity portrait stack (findrealestate.com mobile): a soft
          blue→peach sky wash, a left-aligned near-black headline block at the
          TOP (headline · subhead · rule · dark pill CTA), and the house
          bottom-anchored, rising out of the frame. Text-forward — no giant
          wordmark (that lockup lives in the nav); the house, not a wordmark, is
          the hero image.

          Motion-safe phones get their own scroll cinematic (mountHero mobile
          matchMedia): the section grows to 260vh and this stage goes sticky, so
          scrolling zooms the sky, lifts + dissolves the house, and drifts the
          copy up as it fades — the mobile counterpart to the desktop scrub.
          Under reduced motion the tall height + sticky both drop out (motion-
          safe: variants), leaving the static one-screen composite with ambient
          puff drift only, so it degrades cleanly. */}
      <div className="md:hidden relative motion-safe:sticky motion-safe:top-0 h-svh w-full overflow-hidden">
        {/* Sky photo (scrub zoom target) */}
        <div data-hero-msky className="absolute inset-0">
          <Image
            src="/assets/hero/sky.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_32%]"
          />
        </div>

        {/* Blue→peach wash over the photo */}
        <div aria-hidden className="absolute inset-0 z-[5]" style={SKY_WASH} />

        {/* Ambient drifting puffs in the mid sky */}
        {MOBILE_CLOUDS.map(({ className, pos }, i) => (
          <div
            key={i}
            data-hero-mcloud
            aria-hidden
            className={`absolute z-[6] ${className}`}
            style={cloudStyle(pos)}
          />
        ))}

        {/* House — bottom-anchored and oversized so its base bleeds off the
            bottom edge and rises out of frame on scroll. The cutout's alpha-
            faded base dissolves into the peach horizon (no hard edge, no cloud
            bank needed). object-bottom keeps the base pinned as it scales. */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center">
          <div
            data-hero-mhouse
            className="relative w-[150vw] max-w-[680px] shrink-0 aspect-[2604/1492] origin-bottom"
          >
            <Image
              src="/assets/hero/house-cutout.png"
              alt=""
              fill
              priority
              sizes="116vw"
              className="object-contain object-bottom"
            />
          </div>
        </div>

        {/* Top-left headline block: headline → subhead → rule → dark pill CTA.
            One `data-hero-mcopy` target so the scrub can drift it up + fade it
            as the house rises. pt clears the fixed nav. */}
        <div
          data-hero-mcopy
          className="absolute inset-x-0 top-0 z-40 flex flex-col items-start gap-5 px-6 pt-28 text-left"
        >
          <h1 className="max-w-[9ch] text-[clamp(2.1rem,10vw,3rem)] font-semibold leading-[1.04] tracking-tight text-slate-900">
            Find Your Next Frontier
          </h1>
          <p className="max-w-[26ch] text-[0.95rem] font-medium leading-relaxed text-slate-700">
            Homes, land, and infrastructure — curated for the way you want to
            live.
          </p>
          <span aria-hidden className="block h-px w-16 bg-slate-500/50" />
          <a
            href="#why-us"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-[0_8px_28px_rgba(10,20,35,0.28)]"
          >
            Explore Properties
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>

      {/* ── Desktop cinematic (≥768px) ───────────────────────────────────
          Full-viewport stage: sticky replicates the reference's fixed
          composite. Hidden below md, where the mobile composition above
          stands in. */}
      <div className="hidden md:block relative md:sticky md:top-0 h-svh md:h-screen overflow-hidden">
        {/* Sky (outer = scrub zoom, inner = intro settle) */}
        <div data-hero="sky" className="absolute inset-0">
          <div data-hero="sky-inner" className="absolute inset-0">
            <Image
              src="/assets/hero/sky.webp"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Clouds (mid puff sits behind the house, l/r overlap it in front;
            outer = ambient loop, inner = intro + scrub) */}
        {CLOUDS.map(({ name, className, pos }) => (
          <div
            key={name}
            data-hero={name}
            aria-hidden
            className={`absolute ${className}`}
          >
            <div
              data-hero={`${name}-inner`}
              className="absolute inset-0"
              style={cloudStyle(pos)}
            />
          </div>
        ))}

        {/* House (outer = scrub zoom/rise/dissolve, inner = intro rise).
            The cutout asset is pre-leveled and its base alpha-fades out
            (scripts/process-house-cutout.py), so it rests in the clouds
            instead of ending on a hard edge. */}
        <div
          data-hero="house"
          className="absolute z-20 inset-x-0 bottom-[-2%] flex justify-center"
        >
          <div
            data-hero="house-inner"
            className="relative w-[min(140vw,560px)] md:w-[min(66vw,1080px)] aspect-[2604/1492]"
          >
            <Image
              src="/assets/hero/house-cutout.png"
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 66vw, 140vw"
              className="object-contain drop-shadow-[0_30px_60px_rgba(10,30,50,0.35)]"
            />
          </div>
        </div>

        {/* Title block */}
        <div
          data-hero="title"
          className="absolute z-40 inset-x-0 top-[12%] md:top-[14%] flex flex-col items-center px-6 text-center"
        >
          <h1
            data-hero="headline"
            className="max-w-4xl font-sans font-semibold tracking-tight text-white text-[clamp(2.4rem,6vw,5rem)] leading-[1.05] [text-shadow:0_2px_24px_rgba(20,40,60,0.35)]"
          >
            Find Your Next Frontier
          </h1>
          <p
            data-hero-fade
            className="mt-5 max-w-xl text-base md:text-lg text-white/90 [text-shadow:0_1px_12px_rgba(20,40,60,0.35)]"
          >
            Homes, land, and infrastructure — curated for the way you want to
            live.
          </p>
          <a
            data-hero-fade
            href="#why-us"
            className="mt-8 rounded-full bg-white px-7 py-3 text-sm font-medium text-slate-900 transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] hover:scale-105"
          >
            Explore Properties
          </a>
        </div>

        {/* Wordmark: drawn SVG + masked SVG stacked for the crossfade moment.
            Statically only the solid drawn wordmark shows; on desktop the
            scrub timeline stroke-draws it, fills it, then swaps to the
            house-image-masked version. */}
        <div className="pointer-events-none absolute z-50 inset-x-0 top-[46%] md:top-1/2 -translate-y-1/2 px-[6vw]">
          <div className="relative">
            <svg
              data-hero="wordmark-drawn"
              viewBox={LOGO_VIEWBOX}
              role="img"
              aria-label="Frontier Infra"
              className="w-full text-white [filter:drop-shadow(0_2px_18px_rgba(20,40,60,0.30))]"
            >
              {LOGO_PATHS.map(({ letter, d }, i) => (
                <path
                  key={`${letter}-${i}`}
                  className="logo-letter"
                  d={d}
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
              ))}
            </svg>
            <svg
              data-hero="wordmark-masked"
              viewBox={LOGO_VIEWBOX}
              aria-hidden
              className="absolute inset-0 h-full w-full opacity-0 [filter:drop-shadow(0_1px_1px_rgba(10,30,50,0.4))_drop-shadow(0_4px_16px_rgba(10,30,50,0.25))]"
            >
              <defs>
                <clipPath id="hero-wordmark-clip">
                  {LOGO_PATHS.map(({ letter, d }, i) => (
                    <path key={`${letter}-${i}`} d={d} />
                  ))}
                </clipPath>
                {/* Punch up the photo inside the letters so the glass band
                    doesn't wash into the cloud background behind it. */}
                <filter id="hero-wordmark-tune">
                  <feColorMatrix type="saturate" values="1.25" />
                </filter>
              </defs>
              {/* Sky fills the letterforms; the house cutout floats over it. */}
              <g clipPath="url(#hero-wordmark-clip)">
                <g filter="url(#hero-wordmark-tune)">
                  <image
                    href="/assets/hero/sky.webp"
                    x="0"
                    y="-333"
                    width="1115"
                    height="836"
                    preserveAspectRatio="xMidYMid slice"
                  />
                  {/* 2604x1492 asset -> 1310x751 here; sized so the facade
                      (~10-95% of the frame) spans the full wordmark width,
                      and offset so the 170-unit strip frames the roofline +
                      upper glass band — one horizontal sweep, above the palm
                      and well clear of the base fade zone. */}
                  <image
                    href="/assets/hero/house-cutout.png"
                    x="-131"
                    y="-113"
                    width="1310"
                    height="751"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
                {/* Dark scrim: separates the letterforms from the pale
                    clouds without reading as a flat tint. */}
                <rect
                  x="0"
                  y="0"
                  width="1115"
                  height="170"
                  fill="#0a1e30"
                  opacity="0.18"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
