"use client";
/**
 * Section 9 — Latest Posts / Blog & Resources (MOTION-SPEC.md §3.9, off-white).
 *
 * Spec structure and triggers:
 * - title: lineWipe (off-white tint), once
 * - each post row: thumbnail clipWipe from the right (`inset(0 0 0 100%) → 0%`),
 *   text fadeUp, once per row (each row is its own component instance, its
 *   own ScrollTrigger, per the spec's "as each row enters")
 *
 * Imagery: the dedicated latest-posts thumbnail (ASSETS.md §3.9) plus the
 * two explicitly-marked "spare" stills (alternate hero-cutout candidates
 * never used elsewhere) — reused rather than sourcing new assets.
 */
import Image from "next/image";
import {
  useReveal,
  lineWipe,
  lineWipeTrigger,
  clipWipe,
  fadeUp,
} from "@/lib/motion";

const OFF_WHITE_TINT = "rgba(241,241,241,0.8)";
const HOVER_EASE = "ease-[cubic-bezier(.16,1,.3,1)]";

const POSTS = [
  {
    title: "Reading an HMDA layout plan before you sign",
    excerpt:
      "The three approval stamps that matter, and the two that don't guarantee anything.",
    tag: "Buying Guide",
    image: "/assets/sections/pexels-max-vakhtbovych-6585757.webp",
    alt: "Apartment interior with a bed near curtained windows",
  },
  {
    title: "Why ORR West is Hyderabad's next decade",
    excerpt:
      "Tracking the road, water, and power investments landing along the corridor through 2030.",
    tag: "Market Notes",
    image: "/assets/sections/pexels-artbovich-7031405.webp",
    alt: "Modern residential house facade in the countryside",
  },
  {
    title: "What actually happens between booking and registration",
    excerpt:
      "A plain-language walk through the paperwork most buyers only see once.",
    tag: "Process",
    image: "/assets/sections/pexels-binyaminmellish-106399.webp",
    alt: "Suburban house with lights turned on at dusk",
  },
];

function PostRow({ title, excerpt, tag, image, alt }: (typeof POSTS)[number]) {
  const thumbRef = useReveal<HTMLDivElement>((el) =>
    clipWipe(el, { from: "right" })
  );
  const textRef = useReveal<HTMLDivElement>((el) =>
    fadeUp(el.querySelectorAll("[data-fade]"))
  );

  return (
    <div className="grid gap-6 border-t border-slate-900/10 py-10 md:grid-cols-[1fr_2fr] md:items-center md:gap-16 md:py-12">
      <div
        ref={thumbRef}
        className="invisible relative aspect-[4/3] overflow-hidden rounded-2xl"
      >
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 768px) 25vw, 100vw"
          className={`object-cover transition-transform duration-[4000ms] ${HOVER_EASE} hover:scale-105`}
        />
      </div>
      <div ref={textRef}>
        <p
          data-fade
          className="invisible text-xs font-semibold uppercase tracking-[0.15em] text-slate-500"
        >
          {tag}
        </p>
        <h3
          data-fade
          className="invisible mt-3 max-w-xl text-xl font-semibold tracking-tight md:text-2xl"
        >
          {title}
        </h3>
        <p data-fade className="invisible mt-3 max-w-xl text-base leading-relaxed text-slate-600">
          {excerpt}
        </p>
        <a
          data-fade
          href="#"
          className={`invisible mt-4 inline-block text-sm font-medium underline decoration-slate-300 underline-offset-4 transition-colors duration-500 ${HOVER_EASE} hover:decoration-slate-900`}
        >
          Read more
        </a>
      </div>
    </div>
  );
}

export default function LatestPosts() {
  const headerRef = useReveal<HTMLDivElement>(
    (el) => lineWipe(el, { color: OFF_WHITE_TINT }),
    lineWipeTrigger
  );

  return (
    <section
      id="resources"
      aria-label="Blog and resources"
      className="relative z-10 bg-[#f1f1f1] py-24 text-slate-900 md:py-36"
    >
      <div ref={headerRef} className="invisible px-6 md:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
          Resources
        </p>
        <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
          Field notes from Hyderabad&apos;s growth corridors.
        </h2>
      </div>

      <div className="mt-16 px-6 md:mt-24 md:px-10">
        {POSTS.map((post) => (
          <PostRow key={post.title} {...post} />
        ))}
      </div>
    </section>
  );
}
