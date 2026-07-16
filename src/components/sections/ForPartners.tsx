"use client";
/**
 * Section 5 — "For Partners" (MOTION-SPEC.md §3.5 for-agents, white bg).
 *
 * Frontier Infra develops rather than brokers, so the reference site's
 * agent-recruitment section is adapted to its channel-partner network —
 * same career/partnership beat, same motion structure.
 *
 * Spec structure and triggers:
 * - above-image text: lineWipe (white tint), once
 * - images (aerial + secondary exterior, ASSETS.md §3.5 mapping — no agent
 *   portrait was sourced this pass, so the villa exterior stands in):
 *   clipWipe, stagger amount .15
 * - body copy: fadeUp, once
 * - CTA block: clipWipe from the right (`inset(0 0 0 100%)`), the spec's
 *   R→L variant
 */
import Image from "next/image";
import {
  useReveal,
  lineWipe,
  lineWipeTrigger,
  clipWipe,
  fadeUp,
} from "@/lib/motion";

const WHITE_TINT = "rgba(255,255,255,0.8)";
const HOVER_EASE = "ease-[cubic-bezier(.16,1,.3,1)]";

export default function ForPartners() {
  const titleRef = useReveal<HTMLDivElement>(
    (el) => lineWipe(el, { color: WHITE_TINT }),
    lineWipeTrigger
  );
  const imagesRef = useReveal<HTMLDivElement>((el) =>
    clipWipe(el.querySelectorAll("[data-clip]"))
  );
  const bodyRef = useReveal<HTMLDivElement>((el) =>
    fadeUp(el.querySelectorAll("[data-fade]"))
  );
  const ctaRef = useReveal<HTMLDivElement>((el) =>
    clipWipe(el, { from: "right" })
  );

  return (
    <section
      id="partners"
      aria-label="For channel partners"
      className="relative z-10 bg-white py-24 text-slate-900 md:py-36"
    >
      <div ref={titleRef} className="invisible px-6 md:px-10">
        <h2 className="max-w-4xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
          Don&apos;t just move property. Represent the standard we set.
        </h2>
      </div>

      <div
        ref={imagesRef}
        className="mt-16 grid gap-4 px-6 md:mt-24 md:grid-cols-2 md:gap-6 md:px-10"
      >
        <div
          data-clip
          className="invisible relative aspect-[4/3] overflow-hidden"
        >
          <Image
            src="/assets/sections/pexels-kindel-media-9716228.webp"
            alt="Aerial view of a residential development"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className={`object-cover transition-transform duration-[4000ms] ${HOVER_EASE} hover:scale-105`}
          />
        </div>
        <div
          data-clip
          className="invisible relative aspect-[4/3] overflow-hidden"
        >
          <Image
            src="/assets/sections/pexels-max-vakhtbovych-8082328.webp"
            alt="Villa exterior seen from the front yard"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className={`object-cover transition-transform duration-[4000ms] ${HOVER_EASE} hover:scale-105`}
          />
        </div>
      </div>

      <div className="mt-16 grid gap-10 px-6 md:mt-24 md:grid-cols-2 md:gap-20 md:px-10">
        <div ref={bodyRef}>
          <p
            data-fade
            className="invisible max-w-md text-lg leading-relaxed text-slate-600 md:text-xl"
          >
            Frontier Infra works with a small, vetted network of channel
            partners across Hyderabad — brokers who bring us buyers we&apos;re
            proud to hand documentation to. Full commission transparency,
            title-verified inventory, and a legal team that never leaves you
            exposed on a closing call.
          </p>
        </div>
        <div
          ref={ctaRef}
          className="invisible flex flex-col items-start justify-center gap-6 rounded-2xl bg-slate-50 p-10"
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Channel partners
          </p>
          <a
            href="#contact"
            className={`inline-block rounded-full bg-slate-900 px-7 py-3 text-sm font-medium text-white transition-transform duration-700 ${HOVER_EASE} hover:scale-105`}
          >
            Become a Partner
          </a>
        </div>
      </div>
    </section>
  );
}
