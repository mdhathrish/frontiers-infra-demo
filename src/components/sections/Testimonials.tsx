"use client";
/**
 * Section 6 — Testimonials (MOTION-SPEC.md §3.6, off-white #f1f1f1).
 *
 * Spec structure and triggers:
 * - title: lineWipe with the off-white tint `rgba(241,241,241,.8)`, once
 * - mood photo: clipWipe, once
 * - quotes: the reference site uses Swiper; §5 simplification calls for
 *   skipping that dependency, so this is a native CSS scroll-snap track
 *   with fadeUp entrance on the cards (once) and plain-JS prev/next buttons
 */
import Image from "next/image";
import { useRef } from "react";
import {
  useReveal,
  lineWipe,
  lineWipeTrigger,
  clipWipe,
  fadeUp,
} from "@/lib/motion";

const OFF_WHITE_TINT = "rgba(241,241,241,0.8)";
const HOVER_EASE = "ease-[cubic-bezier(.16,1,.3,1)]";

const QUOTES = [
  {
    quote:
      "Frontier Infra walked me through every survey report before I signed. I've never felt that level of diligence from a developer.",
    name: "Ravi Teja",
    role: "Homeowner, Kokapet",
  },
  {
    quote:
      "The ORR West parcel we bought came with full documentation, no back-and-forth. Rare in this market.",
    name: "Ananya Reddy",
    role: "Investor",
  },
  {
    quote:
      "Six months from shortlist to registration, and every date they gave us held.",
    name: "Suresh & Meena Rao",
    role: "Homeowners, Tellapur",
  },
];

export default function Testimonials() {
  const titleRef = useReveal<HTMLDivElement>(
    (el) => lineWipe(el, { color: OFF_WHITE_TINT }),
    lineWipeTrigger
  );
  const photoRef = useReveal<HTMLDivElement>((el) => clipWipe(el));
  const cardsRef = useReveal<HTMLDivElement>((el) =>
    fadeUp(el.querySelectorAll("[data-fade]"))
  );
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-fade]") as HTMLElement | null;
    const amount = (card?.offsetWidth ?? 320) + 24;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section
      id="testimonials"
      aria-label="Client testimonials"
      className="relative z-10 bg-[#f1f1f1] py-24 text-slate-900 md:py-36"
    >
      <div ref={titleRef} className="invisible px-6 md:px-10">
        <h2 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
          Don&apos;t take our word for it.
        </h2>
      </div>

      <div className="mt-16 grid gap-10 px-6 md:mt-24 md:grid-cols-[minmax(0,340px)_1fr] md:gap-16 md:px-10">
        <div
          ref={photoRef}
          className="invisible relative aspect-[4/5] overflow-hidden"
        >
          <Image
            src="/assets/sections/pexels-sharath-g-31737859.webp"
            alt="Modern luxurious home exterior at night"
            fill
            sizes="(min-width: 768px) 30vw, 100vw"
            className="object-cover"
          />
        </div>

        {/* min-w-0: without it this grid/flex column refuses to shrink below
            its horizontal-scroll content, stretching the whole page (and the
            sibling photo) wider than the viewport on mobile. */}
        <div ref={cardsRef} className="flex min-w-0 flex-col">
          <div
            ref={trackRef}
            className="flex min-w-0 snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {QUOTES.map(({ quote, name, role }) => (
              <div
                key={name}
                data-fade
                className="invisible w-[85%] flex-none snap-start rounded-2xl bg-white p-8 md:w-[420px] md:p-10"
              >
                <p className="text-lg leading-relaxed text-slate-700 md:text-xl">
                  &ldquo;{quote}&rdquo;
                </p>
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.1em] text-slate-500">
                  {name} — {role}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => scrollByCard(-1)}
              className={`flex h-11 w-11 items-center justify-center rounded-full border border-slate-900/20 transition-transform duration-700 ${HOVER_EASE} hover:scale-105`}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => scrollByCard(1)}
              className={`flex h-11 w-11 items-center justify-center rounded-full border border-slate-900/20 transition-transform duration-700 ${HOVER_EASE} hover:scale-105`}
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
