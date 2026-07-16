"use client";
/**
 * Section 8 — Features (MOTION-SPEC.md §3.8, dark #151717, continues Services).
 *
 * Spec structure and triggers:
 * - title: lineWipe with the dark tint `rgba(21,23,23,.8)`, once
 * - three photo cards (Mortgage/Property/Construction in the reference):
 *   clipWipe + fadeUp, once, as each card enters
 *
 * Imagery per ASSETS.md §3.8 mapping (Mortgage/Property/Construction slots).
 */
import Image from "next/image";
import {
  useReveal,
  lineWipe,
  lineWipeTrigger,
  clipWipe,
  fadeUp,
} from "@/lib/motion";

const DARK_TINT = "rgba(21,23,23,0.8)";
const HOVER_EASE = "ease-[cubic-bezier(.16,1,.3,1)]";

const CARDS = [
  {
    title: "Financing",
    body: "Introductions to lenders who already understand HMDA-approved title structures — fewer surprises at underwriting.",
    image: "/assets/sections/pexels-pixabay-280239.webp",
    alt: "Empty fabric sofa inside a sunlit room",
  },
  {
    title: "Interiors",
    body: "Fit-out and design partners vetted to the same standard as the build, so handover day is move-in ready.",
    image: "/assets/sections/pexels-max-vakhtbovych-6265836.webp",
    alt: "Interior of a kitchen with modern furniture and appliances",
  },
  {
    title: "Construction",
    body: "In-house project management from groundbreaking to handover — one team accountable for the whole timeline.",
    image: "/assets/sections/pexels-airam-dato-on-31258538.webp",
    alt: "Construction cranes against a blue sky",
  },
];

function Card({ title, body, image, alt }: (typeof CARDS)[number]) {
  const imageRef = useReveal<HTMLDivElement>((el) => clipWipe(el));
  const textRef = useReveal<HTMLDivElement>((el) =>
    fadeUp(el.querySelectorAll("[data-fade]"))
  );

  return (
    <div>
      <div
        ref={imageRef}
        className="invisible relative aspect-[4/3] overflow-hidden rounded-2xl"
      >
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 768px) 30vw, 100vw"
          className={`object-cover transition-transform duration-[4000ms] ${HOVER_EASE} hover:scale-105`}
        />
      </div>
      <div ref={textRef} className="mt-6">
        <h3
          data-fade
          className="invisible text-xl font-semibold tracking-tight md:text-2xl"
        >
          {title}
        </h3>
        <p data-fade className="invisible mt-3 text-base leading-relaxed text-white/60">
          {body}
        </p>
      </div>
    </div>
  );
}

export default function Features() {
  const headerRef = useReveal<HTMLDivElement>(
    (el) => lineWipe(el, { color: DARK_TINT }),
    lineWipeTrigger
  );

  return (
    <section
      id="features"
      aria-label="Support beyond buying and selling"
      className="relative z-10 border-t border-white/10 bg-[#151717] py-24 text-white md:py-36"
    >
      <div ref={headerRef} className="invisible px-6 md:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/50">
          Beyond the transaction
        </p>
        <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
          Support that outlasts the closing table.
        </h2>
      </div>

      <div className="mt-16 grid gap-12 px-6 md:mt-24 md:grid-cols-3 md:gap-12 md:px-10">
        {CARDS.map((card) => (
          <Card key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}
