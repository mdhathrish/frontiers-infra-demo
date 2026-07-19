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
    one cheap sign of life on phones. Kept in the OPEN SKY above the house so
    the drift never uncovers its grounded base. */
const MOBILE_CLOUDS: { className: string; pos: string }[] = [
  { className: "left-[2%] top-[5%] h-[16vh] w-[46vw]", pos: "30% 44%" },
  { className: "right-[-10%] top-[11%] h-[20vh] w-[56vw]", pos: "70% 40%" },
  { className: "left-[-16%] top-[3%] h-[18vh] w-[52vw]", pos: "50% 38%" },
];

/** Mobile grounding cloud bank: soft, wide masked copies of the sky sitting AT
    the house base (z-30, above the house's z-20) so the cutout's hard,
    alpha-faded edge sinks into cloud instead of floating over open sky — the
    same "clouds swallow the base" trick the desktop composite uses. Static (no
    drift) so the base stays reliably covered on every device. */
const GROUND_CLOUDS: { className: string; pos: string }[] = [
  { className: "left-[-20%] top-[46%] h-[30vh] w-[98vw]", pos: "40% 70%" },
  { className: "right-[-22%] top-[50%] h-[24vh] w-[86vw]", pos: "78% 72%" },
];

/** Wider, flatter mask than CLOUD_MASK so the grounding pair reads as a bank
    stretched across the base, not two discrete circular puffs. */
const BAND_MASK =
  "radial-gradient(ellipse 62% 52% at 50% 42%, black 44%, transparent 80%)";

const bandStyle = (pos: string): CSSProperties => ({
  backgroundImage: "url(/assets/hero/sky.webp)",
  backgroundSize: "185%",
  backgroundPosition: pos,
  WebkitMaskImage: BAND_MASK,
  maskImage: BAND_MASK,
  filter: "blur(7px) brightness(1.1)",
});

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
          Art-directed portrait stack — NOT the desktop composite with its
          motion switched off. Sky + drifting cloud puffs behind a house that
          rests in the cloud band, with the wordmark sized to the viewport
          width and the tagline / subcopy / CTA stacked beneath it.

          Motion-safe phones get their own scroll cinematic (mountHero mobile
          matchMedia): the section grows to 260vh and this stage goes sticky,
          so scrolling lifts the house off, zooms the sky, and parts the
          grounding bank — the mobile counterpart to the desktop scrub. Under
          reduced motion the tall height + sticky both drop out (motion-safe:
          variants), leaving the static one-screen composite with ambient drift
          only, so it degrades cleanly. */}
      <div className="md:hidden relative motion-safe:sticky motion-safe:top-0 h-svh w-full overflow-hidden">
        <div data-hero-msky className="absolute inset-0">
          <Image
            src="/assets/hero/sky.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[50%_30%]"
          />
        </div>

        {/* Ambient drifting puffs in the open sky above the house. */}
        {MOBILE_CLOUDS.map(({ className, pos }, i) => (
          <div
            key={i}
            data-hero-mcloud
            aria-hidden
            className={`absolute ${className}`}
            style={cloudStyle(pos)}
          />
        ))}

        {/* House — larger and base-anchored to ~56% (h-[56%] + items-end) so it
            rises out of the grounding bank below rather than floating mid-sky.
            No drop shadow: the cloud bank, not a cast shadow, gives it depth. */}
        <div className="absolute inset-x-0 top-0 z-20 flex h-[56%] items-end justify-center">
          <div
            data-hero-mhouse
            className="relative w-[92vw] max-w-[440px] aspect-[2604/1492]"
          >
            <Image
              src="/assets/hero/house-cutout.png"
              alt=""
              fill
              priority
              sizes="92vw"
              className="object-contain"
            />
          </div>
        </div>

        {/* Grounding cloud bank — sits AT the house base (z-30, above the
            house's z-20), swallowing the cutout's hard edge so it reads as
            emerging from cloud. On motion-safe scroll the pair parts (index 0
            left, 1 right) as the house lifts off. */}
        {GROUND_CLOUDS.map(({ className, pos }, i) => (
          <div
            key={i}
            data-hero-mground
            aria-hidden
            className={`absolute z-30 ${className}`}
            style={bandStyle(pos)}
          />
        ))}

        {/* Bottom-anchored brand lockup: wordmark (fit width) → tagline →
            subcopy → CTA. */}
        <div className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center gap-4 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center">
          <svg
            viewBox={LOGO_VIEWBOX}
            role="img"
            aria-label="Frontier Infra"
            className="w-[84vw] max-w-[440px] text-white [filter:drop-shadow(0_2px_16px_rgba(20,40,60,0.35))]"
          >
            {LOGO_PATHS.map(({ letter, d }, i) => (
              <path key={`${letter}-${i}`} d={d} fill="currentColor" />
            ))}
          </svg>
          <h1 className="text-lg font-medium tracking-tight text-white [text-shadow:0_1px_12px_rgba(20,40,60,0.4)]">
            Find Your Next Frontier
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-white/90 [text-shadow:0_1px_10px_rgba(20,40,60,0.4)]">
            Homes, land, and infrastructure — curated for the way you want to
            live.
          </p>
          <a
            href="#why-us"
            className="mt-1 rounded-full bg-white px-7 py-3 text-sm font-medium text-slate-900 shadow-[0_6px_24px_rgba(10,30,50,0.25)]"
          >
            Explore Properties
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
