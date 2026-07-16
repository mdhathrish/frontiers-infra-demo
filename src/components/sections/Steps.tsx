"use client";
/**
 * Section 4 — "How It Works" (MOTION-SPEC.md §3.4 steps, white bg).
 *
 * Spec structure and triggers:
 * - title + CTA column: lineWipe (white tint) + fadeUp, once
 * - backdrop image (ASSETS.md §3.4 mapping): clipWipe on entry + parallax
 *   zoom `scale 1 → 1.08` (scrub 1.5), same outer/inner split as WhyUs
 * - numbered steps 01/02/03: fadeUp per item, once, sequential as they enter
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

const STEPS = [
  {
    n: "01",
    title: "Shortlist",
    body: "Browse verified plots and residences across Hyderabad's growth corridors, filtered to your brief.",
  },
  {
    n: "02",
    title: "Walk the Site",
    body: "Every parcel is walked, surveyed, and cross-checked against HMDA records before it reaches you.",
  },
  {
    n: "03",
    title: "Own It",
    body: "Documentation, registration, and handover — managed end to end, so ownership is the easy part.",
  },
];

export default function Steps() {
  const headerRef = useReveal<HTMLDivElement>(
    (el) => lineWipe(el, { color: WHITE_TINT }),
    lineWipeTrigger
  );
  const ctaRef = useReveal<HTMLDivElement>((el) =>
    fadeUp(el.querySelectorAll("[data-fade]"))
  );
  const imageClipRef = useReveal<HTMLDivElement>((el) => clipWipe(el));
  const imageZoomRef = useReveal<HTMLDivElement>(
    (el) => parallax(el, { fromY: 0, toY: 0, scale: [1, 1.08] }),
    parallaxTrigger
  );
  const listRef = useReveal<HTMLDivElement>((el) =>
    fadeUp(el.querySelectorAll("[data-step]"))
  );

  return (
    <section
      id="how-it-works"
      aria-label="How Frontier Infra works"
      className="relative z-10 bg-white py-24 text-slate-900 md:py-36"
    >
      <div className="grid gap-10 px-6 md:grid-cols-[1fr_auto] md:items-end md:px-10">
        <div ref={headerRef} className="invisible">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
            How it works
          </p>
          <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
            Buying land shouldn&apos;t feel like a leap of faith.
          </h2>
        </div>
        <div ref={ctaRef}>
          <a
            data-fade
            href="#contact"
            className={`invisible inline-block whitespace-nowrap rounded-full bg-slate-900 px-7 py-3 text-sm font-medium text-white transition-transform duration-700 ${HOVER_EASE} hover:scale-105`}
          >
            Book a Site Visit
          </a>
        </div>
      </div>

      <div
        ref={imageClipRef}
        className="invisible relative mt-16 aspect-[16/7] w-full overflow-hidden md:mt-24"
      >
        <div ref={imageZoomRef} className="absolute inset-0">
          <Image
            src="/assets/sections/pexels-curtis-adams-3935327.webp"
            alt="Empty sunlit room, ready for handover"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>

      <div
        ref={listRef}
        className="mt-16 grid gap-10 px-6 md:mt-24 md:grid-cols-3 md:gap-12 md:px-10"
      >
        {STEPS.map(({ n, title, body }) => (
          <div key={n} data-step className="invisible">
            <p className="text-sm font-semibold tabular-nums text-slate-400">
              {n}
            </p>
            <h3 className="mt-4 text-xl font-semibold tracking-tight md:text-2xl">
              {title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
