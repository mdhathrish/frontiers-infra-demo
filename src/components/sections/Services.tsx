"use client";
/**
 * Section 7 — Services (MOTION-SPEC.md §3.7, dark #151717).
 *
 * The reference site's Buy/Sell/Rent triad becomes Homes/Land/Infrastructure
 * here — the three verticals already named in the hero copy and nav menu.
 *
 * Spec structure and triggers:
 * - heading & brief: lineWipe with the dark tint `rgba(21,23,23,.8)`, once
 * - giant word rows: wordMask on the giant word + fadeUp on the row items,
 *   once per row, as each row enters (each row is its own component
 *   instance, so each gets its own ScrollTrigger)
 * - imagery per ASSETS.md §3.7 mapping (Homes, Infrastructure only — Land
 *   stays text-forward, matching its Chevrons-section copy)
 * - counter stats (spec §2.1 preset): the spec's page order has no
 *   standalone stats section, so these are folded in here, where "how we
 *   help" meets scale — Projects Delivered, Sq Ft Developed, Families Housed
 */
import Image from "next/image";
import {
  useReveal,
  compose,
  lineWipe,
  lineWipeTrigger,
  wordMask,
  clipWipe,
  fadeUp,
  counter,
} from "@/lib/motion";

const DARK_TINT = "rgba(21,23,23,0.8)";

const STATS: { to: number; decimals?: number; suffix: string; label: string }[] = [
  { to: 42, suffix: "", label: "Projects delivered" },
  { to: 3.2, decimals: 1, suffix: "M sq ft", label: "Developed" },
  { to: 900, suffix: "", label: "Families housed" },
];

function Stat({ to, decimals, suffix, label }: (typeof STATS)[number]) {
  const ref = useReveal<HTMLDivElement>((el) =>
    counter(el.querySelector("[data-count]")!, { to, decimals })
  );
  return (
    <div ref={ref}>
      <p className="text-4xl font-semibold tabular-nums tracking-tight md:text-5xl">
        <span data-count>0</span>
        {suffix ? <span className="ml-1 text-2xl md:text-3xl">{suffix}</span> : null}
      </p>
      <p className="mt-2 text-sm uppercase tracking-[0.15em] text-white/50">
        {label}
      </p>
    </div>
  );
}

function ServiceRow({
  word,
  items,
  image,
  alt,
}: {
  word: string;
  items: string[];
  image?: string;
  alt?: string;
}) {
  const rowRef = useReveal<HTMLDivElement>((el) =>
    compose(
      wordMask(el.querySelector("[data-word]")!),
      fadeUp(el.querySelectorAll("[data-item]"))
    )
  );
  const imageRef = useReveal<HTMLDivElement>((el) => clipWipe(el));

  return (
    <div
      className={`grid gap-8 border-t border-white/10 py-12 md:items-center md:gap-16 md:py-16 ${
        image ? "md:grid-cols-[2fr_1fr]" : "md:grid-cols-1"
      }`}
    >
      <div ref={rowRef}>
        {/* Below md, size to the viewport width so the longest word
            ("INFRASTRUCTURE") never clips the edge; the desktop clamp only
            takes over at md+ where there's room for the big display size. */}
        <h3
          data-word
          className="invisible text-[8.5vw] md:text-[clamp(3rem,9vw,7rem)] font-semibold uppercase leading-[0.95] tracking-tight"
        >
          {word}
        </h3>
        <div className="mt-6 flex flex-col gap-2">
          {items.map((item) => (
            <p
              key={item}
              data-item
              className="invisible max-w-xl text-base leading-relaxed text-white/60 md:text-lg"
            >
              {item}
            </p>
          ))}
        </div>
      </div>
      {image ? (
        <div
          ref={imageRef}
          className="invisible relative aspect-[4/3] overflow-hidden md:aspect-square"
        >
          <Image
            src={image}
            alt={alt ?? ""}
            fill
            sizes="(min-width: 768px) 30vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}

export default function Services() {
  const headerRef = useReveal<HTMLDivElement>(
    (el) => lineWipe(el, { color: DARK_TINT }),
    lineWipeTrigger
  );

  return (
    <section
      id="services"
      aria-label="How Frontier Infra can help you"
      className="relative z-10 bg-[#151717] py-24 text-white md:py-36"
    >
      <div ref={headerRef} className="invisible px-6 md:px-10">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/50">
          How we help
        </p>
        <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
          Three ways we work with Hyderabad&apos;s growth.
        </h2>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-8 px-6 md:mt-24 md:grid-cols-3 md:gap-12 md:px-10">
        {STATS.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-16 px-6 md:mt-24 md:px-10">
        <ServiceRow
          word="Homes"
          items={[
            "Signature villas, ready and under-construction.",
            "Kokapet · Tellapur · Financial District.",
          ]}
          image="/assets/sections/pexels-max-vakhtbovych-7031604.webp"
          alt="Courtyard of a modern villa with glass walls"
        />
        <ServiceRow
          word="Land"
          items={[
            "HMDA-approved plots, title-verified before listing.",
            "ORR West · Tellapur · Kokapet corridor.",
          ]}
        />
        <ServiceRow
          word="Infrastructure"
          items={[
            "Roads, drainage, and utilities delivered ahead of possession.",
            "Every corridor we develop, we build for first.",
          ]}
          image="/assets/sections/pexels-ph-t-tr-ng-38000582.webp"
          alt="Contrasting urban architecture facades"
        />
      </div>
    </section>
  );
}
