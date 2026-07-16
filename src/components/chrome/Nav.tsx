"use client";
/**
 * Fixed site header + burger menu — MOTION-SPEC.md §3.12.
 *
 * Purely structural: the scrolled-state toggle lives in `mountNav` and the
 * curtain choreography in `createMenuController` (src/lib/motion/nav.ts).
 *
 * States:
 * - transparent over the hero (white text on sky)
 * - `data-solid` once scrolled past the hero — white bg, dark text (CSS
 *   transition, house bezier)
 * - menu open: curtain overlay under the header; header forced back to
 *   light-on-dark while the dark backdrop is up
 *
 * Hovers per spec §2/§3.12: masked text slide (`cubic-bezier(.16,1,.3,1)`,
 * 0.75s) on links, springy overshoot (`cubic-bezier(.34,3.56,.64,1)`) on the
 * burger, scale pop on the CTA pill.
 */
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import {
  gsap,
  mountNav,
  createMenuController,
  type MenuController,
} from "@/lib/motion";
import { LOGO_PATHS, LOGO_VIEWBOX } from "@/components/sections/heroLogoPaths";

gsap.registerPlugin(useGSAP);

const HOVER_EASE = "ease-[cubic-bezier(.16,1,.3,1)]";

const NAV_LINKS = [
  { label: "Why Us", href: "#why-us" },
  { label: "Portfolio", href: "#portfolio" },
];

const MENU_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "Homes", href: "#portfolio" },
  { label: "Land", href: "#portfolio" },
  { label: "Infrastructure", href: "#why-us" },
  { label: "Contact", href: "#contact" },
];

/** Masked two-span slide: copy glides up, its duplicate rises from below. */
function SlideLabel({ label }: { label: string }) {
  return (
    <span className="relative block overflow-hidden">
      <span
        className={`block transition-transform duration-700 ${HOVER_EASE} group-hover/link:-translate-y-full`}
      >
        {label}
      </span>
      <span
        aria-hidden
        className={`absolute inset-0 block translate-y-full transition-transform duration-700 ${HOVER_EASE} group-hover/link:translate-y-0`}
      >
        {label}
      </span>
    </span>
  );
}

export default function Nav() {
  const headerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<MenuController | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useGSAP(
    () => {
      if (!headerRef.current) return;
      return mountNav(headerRef.current, document.getElementById("hero"));
    },
    { scope: headerRef }
  );

  useGSAP(
    () => {
      if (!overlayRef.current) return;
      const controller = createMenuController(overlayRef.current);
      menuRef.current = controller;
      return () => {
        menuRef.current = null;
        controller.destroy();
      };
    },
    { scope: overlayRef }
  );

  useEffect(() => {
    if (menuOpen) menuRef.current?.open();
    else menuRef.current?.close();
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <header
        ref={headerRef}
        className={`group fixed inset-x-0 top-0 z-[100] text-white transition-[background-color,color,box-shadow] duration-500 ${HOVER_EASE} data-solid:bg-white/85 data-solid:text-slate-900 data-solid:backdrop-blur-md data-solid:shadow-[0_1px_0_rgba(15,23,42,0.08)] ${
          menuOpen
            ? "!bg-transparent !text-white !shadow-none !backdrop-blur-none"
            : ""
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 md:h-20 md:px-10">
          <a
            href="#hero"
            aria-label="Frontier Infra — home"
            onClick={() => setMenuOpen(false)}
            className={`transition-opacity duration-500 ${HOVER_EASE} hover:opacity-70`}
          >
            <svg
              viewBox={LOGO_VIEWBOX}
              className="h-[13px] w-auto md:h-4"
              fill="currentColor"
              aria-hidden
            >
              {LOGO_PATHS.map(({ letter, d }, i) => (
                <path key={`${letter}-${i}`} d={d} />
              ))}
            </svg>
          </a>

          <nav className="flex items-center gap-6 md:gap-9" aria-label="Primary">
            <div className="hidden items-center gap-9 text-sm font-medium md:flex">
              {NAV_LINKS.map(({ label, href }) => (
                <a key={label} href={href} className="group/link">
                  <SlideLabel label={label} />
                </a>
              ))}
            </div>
            <a
              href="#contact"
              className={`hidden rounded-full border border-white/40 px-5 py-2 text-sm font-medium transition-[transform,border-color] duration-700 ${HOVER_EASE} hover:scale-105 group-data-solid:border-slate-900/25 md:block ${
                menuOpen ? "!border-white/40" : ""
              }`}
            >
              Enquire
            </a>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center transition-transform duration-700 ease-[cubic-bezier(.34,3.56,.64,1)] hover:scale-110"
            >
              <span
                className={`absolute h-[1.5px] w-6 bg-current transition-transform duration-500 ${HOVER_EASE} ${
                  menuOpen ? "rotate-45" : "-translate-y-[4px]"
                }`}
              />
              <span
                className={`absolute h-[1.5px] w-6 bg-current transition-transform duration-500 ${HOVER_EASE} ${
                  menuOpen ? "-rotate-45" : "translate-y-[4px]"
                }`}
              />
            </button>
          </nav>
        </div>
      </header>

      {/* Menu curtain (spec §3.12). Starts invisible; the controller reveals
          it. data-lenis-prevent + body lock while open. */}
      <div
        id="site-menu"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        data-lenis-prevent
        className="invisible fixed inset-0 z-[90]"
      >
        <div
          data-menu="backdrop"
          className="absolute inset-0 origin-top bg-[#151717]"
        />
        <div
          data-menu="content"
          className="relative flex h-full flex-col justify-between px-6 pt-28 pb-10 text-white md:px-10 md:pt-36 md:pb-14"
        >
          <nav className="flex flex-col gap-1 md:gap-2" aria-label="Menu">
            {MENU_LINKS.map(({ label, href }) => (
              <a
                key={label}
                data-menu="link"
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`invisible w-fit text-[clamp(2.4rem,6.5vw,4.75rem)] leading-[1.08] font-semibold tracking-tight transition-colors duration-500 ${HOVER_EASE} hover:text-white/50`}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-8 text-sm text-white/60">
            <p data-menu="secondary" className="invisible">
              Financial District, Gachibowli
              <br />
              Hyderabad, Telangana 500032
            </p>
            <p data-menu="secondary" className="invisible">
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
            <p data-menu="secondary" className="invisible flex gap-6">
              <a
                href="#"
                className={`transition-colors duration-500 ${HOVER_EASE} hover:text-white`}
              >
                Instagram
              </a>
              <a
                href="#"
                className={`transition-colors duration-500 ${HOVER_EASE} hover:text-white`}
              >
                LinkedIn
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
