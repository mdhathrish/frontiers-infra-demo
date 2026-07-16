"use client";
/**
 * Footer (MOTION-SPEC.md §3.11, dark #151717).
 *
 * Spec structure and triggers:
 * - whole content block: footerReveal — scrubbed slide-up, `scrub: true`,
 *   `top bottom → bottom bottom` (footerRevealTrigger). Desktop-only for
 *   free via `motionStatic()` gating <768px (spec §5: skip the original's
 *   per-breakpoint matchMedia, make it responsive by default).
 * - giant wordmark: footerLogoReveal — the spec's one special stagger,
 *   `{ each: 0.1, from: "end" }`, once, independent of the outer scrub.
 *
 * Provides the `#contact` anchor the header's "Enquire" CTA and menu
 * "Contact" link already point at.
 */
import {
  useReveal,
  footerReveal,
  footerRevealTrigger,
  footerLogoReveal,
} from "@/lib/motion";
import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/sections/heroLogoPaths";

const HOVER_EASE = "ease-[cubic-bezier(.16,1,.3,1)]";

const EXPLORE_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "Why Us", href: "#why-us" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "How It Works", href: "#how-it-works" },
];

const COMPANY_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Features", href: "#features" },
  { label: "Resources", href: "#resources" },
  { label: "Testimonials", href: "#testimonials" },
];

function LinkColumn({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/40">
        {heading}
      </p>
      <ul className="mt-6 flex flex-col gap-3">
        {links.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className={`text-sm text-white/70 transition-colors duration-500 ${HOVER_EASE} hover:text-white`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const scrubRef = useReveal<HTMLDivElement>(
    (el) => footerReveal(el),
    footerRevealTrigger
  );
  const wordmarkRef = useReveal<HTMLDivElement>((el) =>
    footerLogoReveal(el.querySelectorAll("path"))
  );

  return (
    <footer
      id="contact"
      aria-label="Contact and site links"
      className="relative z-10 overflow-hidden bg-[#151717] text-white"
    >
      <div ref={scrubRef} className="px-6 pt-24 pb-10 md:px-10 md:pt-32 md:pb-14">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/40">
              Frontier Infra
            </p>
            <p className="mt-6 max-w-xs text-base leading-relaxed text-white/70">
              Financial District, Gachibowli
              <br />
              Hyderabad, Telangana 500032
            </p>
            <p className="mt-6 text-base text-white/70">
              <a
                href="mailto:hello@frontierinfra.in"
                className={`transition-colors duration-500 ${HOVER_EASE} hover:text-white`}
              >
                hello@frontierinfra.in
              </a>
              <br />
              <a
                href="tel:+914045250000"
                className={`transition-colors duration-500 ${HOVER_EASE} hover:text-white`}
              >
                +91 40 4525 0000
              </a>
            </p>
          </div>

          <LinkColumn heading="Explore" links={EXPLORE_LINKS} />
          <LinkColumn heading="Company" links={COMPANY_LINKS} />

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/40">
              Follow
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              <li>
                <a
                  href="#"
                  className={`text-sm text-white/70 transition-colors duration-500 ${HOVER_EASE} hover:text-white`}
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`text-sm text-white/70 transition-colors duration-500 ${HOVER_EASE} hover:text-white`}
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div ref={wordmarkRef} className="mt-20 md:mt-28">
          <svg
            viewBox={LOGO_VIEWBOX}
            role="img"
            aria-label="Frontier Infra"
            className="w-full text-white"
          >
            {LOGO_PATHS.map(({ letter, d }, i) => (
              <path key={`${letter}-${i}`} d={d} fill="currentColor" />
            ))}
          </svg>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Frontier Infra. All rights reserved.</p>
          <p>Imagery: Pexels photographers — see ASSETS.md</p>
        </div>
      </div>
    </footer>
  );
}
