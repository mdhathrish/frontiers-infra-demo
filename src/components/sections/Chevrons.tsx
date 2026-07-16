"use client";
/**
 * Section 3 — the arrows/chevron section (MOTION-SPEC.md §3.3, white bg).
 *
 * Spec structure and triggers:
 * - title: lineWipe (white tint), once
 * - chevron-masked image row: every chevron except the first drifts in
 *   `x -10% / scale .8 / opacity .1 → identity`, stagger .2 — SCRUBBED,
 *   `scrub: 3`, `top bottom → center center` (chevrons drift in lazily and
 *   settle by mid-viewport)
 * - captions: fadeUp, once
 *
 * Imagery per ASSETS.md §3.3 mapping. Image hover zoom per spec §3.12
 * (`transform 4s`, expo-out curve).
 */
import Image from "next/image";
import {
  useReveal,
  lineWipe,
  lineWipeTrigger,
  chevronDrift,
  chevronTrigger,
  fadeUp,
} from "@/lib/motion";

const WHITE_TINT = "rgba(255,255,255,0.8)";
const HOVER_EASE = "ease-[cubic-bezier(.16,1,.3,1)]";

/** Right-pointing chevron with a matching notch so the row interlocks. */
const CHEVRON_CLIP =
  "polygon(0% 0%, 78% 0%, 100% 50%, 78% 100%, 0% 100%, 22% 50%)";

const CHEVRONS = [
  {
    src: "/assets/sections/pexels-abid-ali-10647324.webp",
    alt: "Modern residence with a pool",
    place: "Kokapet",
    kind: "Signature residences",
  },
  {
    src: "/assets/sections/pexels-min-an-740587.webp",
    alt: "Low-rise buildings among green trees",
    place: "Tellapur",
    kind: "Curated land parcels",
  },
  {
    src: "/assets/sections/pexels-derwin-edwards-10854904.webp",
    alt: "Aerial view of houses and trees",
    place: "ORR West",
    kind: "Growth-corridor infrastructure",
  },
];

export default function Chevrons() {
  const titleRef = useReveal<HTMLDivElement>(
    (el) => lineWipe(el, { color: WHITE_TINT }),
    lineWipeTrigger
  );
  const rowRef = useReveal<HTMLDivElement>(
    (el) => chevronDrift(el.querySelectorAll("[data-chevron]")),
    chevronTrigger
  );
  // Captions sit near the page's end (nothing below this section yet), so
  // the default `top bottom-=200px` start could never be reached at max
  // scroll — fire on viewport entry instead (spec §5: keep offsets so fast
  // scrollers don't outrun reveals, but never strand content unrevealed).
  const captionRef = useReveal<HTMLDivElement>(
    (el) => fadeUp(el.querySelectorAll("[data-fade]")),
    { start: "top bottom" }
  );

  return (
    <section
      id="portfolio"
      aria-label="Portfolio directions"
      className="relative z-10 bg-white pb-24 text-slate-900 md:pb-36"
    >
      <div ref={titleRef} className="invisible px-6 md:px-10">
        <h2 className="max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
          This isn&apos;t just about property.
        </h2>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-600">
          It&apos;s about position. Homes, land, and infrastructure along
          Hyderabad&apos;s growth corridors — assembled with the patience the
          city&apos;s next decade deserves.
        </p>
      </div>

      {/* Chevron row: first sits still, the rest drift in on the scrub. */}
      <div
        ref={rowRef}
        className="mt-16 flex items-stretch px-6 md:mt-24 md:px-10"
      >
        {CHEVRONS.map(({ src, alt }, i) => (
          <div
            key={src}
            data-chevron
            className={`group relative h-[220px] flex-1 overflow-hidden md:h-[420px] ${
              i > 0 ? "-ml-[10%]" : ""
            }`}
            style={{ clipPath: CHEVRON_CLIP }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 768px) 38vw, 45vw"
              className={`object-cover transition-transform duration-[4000ms] ${HOVER_EASE} group-hover:scale-105`}
            />
          </div>
        ))}
      </div>

      <div
        ref={captionRef}
        className="mt-10 grid grid-cols-3 gap-6 px-6 md:mt-14 md:px-10"
      >
        {CHEVRONS.map(({ place, kind }) => (
          <div key={place} data-fade className="invisible">
            <p className="text-sm font-semibold uppercase tracking-[0.15em]">
              {place}
            </p>
            <p className="mt-1 text-sm text-slate-500">{kind}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
