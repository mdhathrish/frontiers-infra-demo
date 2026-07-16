# Frontiers Infra — Real Estate Demo

Project rules for building this demo. Follow these strictly.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- GSAP 3.13 + ScrollTrigger + SplitText
- Lenis (smooth scroll)
- Tailwind CSS

## Animation Rules

- All animations MUST use presets from `src/lib/motion/` — never inline GSAP configs inside components.
- Layout and section order follow `MOTION-SPEC.md`. Read the relevant spec section before building any section.
- Lenis smooth scroll is desktop-only, driven by `gsap.ticker`.
- Every animated element needs a `prefers-reduced-motion` fallback.
- Below 768px: static composed fallbacks, no scroll-driven effects unless the spec section says otherwise.

## Assets

- All imagery/fonts must be open-source or client-provided — never hotlink or copy assets from the reference site.

## Git Workflow

- Never commit directly to `main`; work on the `demo-build` branch.
