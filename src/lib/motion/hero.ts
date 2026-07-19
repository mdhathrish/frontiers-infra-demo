/**
 * Hero cinematic — MOTION-SPEC.md §3.1 ("Find What Moves You", ~3,600px).
 *
 * The section's default (server-rendered) markup is the STATIC COMPOSED hero:
 * sky + clouds + house + headline + solid wordmark, everything visible. That
 * markup is the fallback for <768px viewports and prefers-reduced-motion —
 * `mountHero` simply doesn't animate in those cases (spec §5 "fix what they
 * got wrong": the original had no reduced-motion guard).
 *
 * On desktop, `mountHero` builds two timelines:
 *
 * 1. Load timeline (spec §3.1 table) — section autoAlpha in (0.6s), headline
 *    wordMask, sky settles scale 1.1 → 1 (5s expo.out), house rises
 *    y 50% → 0 (3s expo.out), clouds fade/rise at +0.2, subcopy + CTA
 *    fadeUp at +0.4. Kicked off ~200ms after mount like the reference.
 *
 * 2. Scroll scrub — `scrub: 0.1` (tight), `top top → bottom top`, no pin:
 *    the stage is `position: sticky` inside the tall section, replicating the
 *    reference's fixed-composite trick. Normalized positions:
 *    | 0 → 1       | house y → -40%, scale → 1.3; sky scale → 1.15         |
 *    | 0 → 1       | clouds part: left x → -15%, right x → +15%, mid → -8% |
 *    | 0 → 0.2     | title block y → 20%, scale → .9, fades out            |
 *    | 0.10 → 0.40 | 13 logo letters stroke-draw in staggered sequence     |
 *    | 0.38 → 0.48 | letter fills fade in (drawn wordmark solidifies)      |
 *    | 0.52 → 0.72 | crossfade: drawn wordmark → house-image-masked        |
 *    |             | wordmark; house layer fades out                       |
 *    | → 1         | end state: masked wordmark floating over sky/clouds   |
 *
 *    Everything lands by ~0.72 — the sticky stage starts scrolling away at
 *    progress ≈ 0.75 (900px viewport), so the composite is complete before
 *    it departs.
 *
 * 3. Ambient cloud drift — every cloud layer loops a slow sine yoyo drift
 *    (x ±2–4%, slight y, 20–40s cycles, each layer its own speed/direction)
 *    from load, independent of scroll. Skipped for reduced motion along with
 *    everything else.
 *
 * Multiple systems tween the SAME visual layers, so layers that share a
 * transform are split into outer/inner wrappers: house and sky (outer =
 * scrub, inner = intro), and each cloud (outer = ambient loop, inner =
 * intro fade/rise + scrub parting) — nesting lets the ambient drift and the
 * scroll-driven ±15% parting ADD instead of fighting over one transform.
 *
 * Elements are located via `data-hero="<name>"` attributes; subcopy/CTA
 * fadeUp items via `data-hero-fade`.
 */
import { gsap, prefersReducedMotion } from "./gsap";
import { wordMask, fadeUp } from "./presets";

/** Spec §2: the hero is one of the four sanctioned scrub uses — near-locked. */
export const HERO_SCRUB = 0.1;

/** Spec §3.1 scrub trigger: full tall-section range, no pin. */
export const HERO_SCRUB_TRIGGER = {
  start: "top top",
  end: "bottom top",
  scrub: HERO_SCRUB,
} as const;

const DESKTOP = "(min-width: 768px)";

/** Ambient cloud drift — one infinite sine yoyo per layer, each with its own
 *  speed and direction so the bank never moves as one sheet. Tuned to be
 *  clearly felt within a few seconds of watching, not just measurable. */
const AMBIENT_DRIFT = [
  { xPercent: 7, yPercent: -2.5, duration: 12 }, // cloud-l
  { xPercent: -6, yPercent: 2, duration: 16 }, // cloud-m
  { xPercent: -8, yPercent: -2, duration: 19 }, // cloud-r
] as const;

/** Mobile pass: the one cheap ambient touch that works on phones — the same
 *  slow sine drift applied to the mobile hero's cloud puffs. Transform-only,
 *  no scroll coupling; skipped entirely under reduced motion (mountHero bails
 *  before any matchMedia runs). */
const MOBILE_DRIFT = [
  { xPercent: 6, yPercent: -3, duration: 14 },
  { xPercent: -7, yPercent: 3, duration: 18 },
  { xPercent: 5, yPercent: -2, duration: 22 },
] as const;

export function mountHero(section: HTMLElement): (() => void) | void {
  // Reduced motion: leave the static composed markup untouched.
  if (prefersReducedMotion()) return;

  const q = (name: string) =>
    section.querySelector<HTMLElement>(`[data-hero="${name}"]`);

  const sky = q("sky");
  const skyInner = q("sky-inner");
  const house = q("house");
  const houseInner = q("house-inner");
  const cloudL = q("cloud-l");
  const cloudM = q("cloud-m");
  const cloudR = q("cloud-r");
  const cloudLInner = q("cloud-l-inner");
  const cloudMInner = q("cloud-m-inner");
  const cloudRInner = q("cloud-r-inner");
  const title = q("title");
  const headline = q("headline");
  const drawn = section.querySelector<SVGSVGElement>(
    '[data-hero="wordmark-drawn"]'
  );
  const masked = section.querySelector<SVGSVGElement>(
    '[data-hero="wordmark-masked"]'
  );
  if (
    !sky || !skyInner || !house || !houseInner ||
    !cloudL || !cloudM || !cloudR ||
    !cloudLInner || !cloudMInner || !cloudRInner ||
    !title || !headline || !drawn || !masked
  ) {
    return;
  }

  // Outers carry the ambient loop; inners carry intro fade/rise + scrub.
  const clouds = [cloudL, cloudM, cloudR];
  const cloudInners = [cloudLInner, cloudMInner, cloudRInner];
  const letters = Array.from(
    drawn.querySelectorAll<SVGPathElement>(".logo-letter")
  );
  const fadeItems = section.querySelectorAll<HTMLElement>("[data-hero-fade]");

  const mm = gsap.matchMedia();

  // Below 768px nothing mounts — the static composed markup IS the hero.
  mm.add(DESKTOP, () => {
    const cleanups: (() => void)[] = [];

    // ---- Initial states. Section hides synchronously (before first paint,
    // via useGSAP's layout effect) so the un-animated composite never flashes.
    gsap.set(section, { autoAlpha: 0 });
    gsap.set([sky, house, ...clouds, ...cloudInners], {
      willChange: "transform",
    });
    // Letters go invisible for the draw phase: stroke fully offset, fill off.
    letters.forEach((path) => {
      const len = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: len,
        strokeDashoffset: len,
        fillOpacity: 0,
      });
    });
    gsap.set(masked, { autoAlpha: 0 });

    // ---- Load timeline (spec: setTimeout 200ms kick-off).
    // Explicit duration/ease/stagger overrides pin these to the original
    // spec numbers — the shared wordMask/fadeUp presets were slowed down
    // (and re-eased) site-wide for every OTHER section, but the hero
    // cinematic stays exactly as-is.
    const headlineTl = wordMask(headline, {
      duration: 2,
      ease: "power4.out",
      stagger: 0.1,
    });
    const subTl = fadeUp(fadeItems, {
      duration: 2,
      ease: "expo.out",
      stagger: 0.1,
      fadeDuration: 0.1,
    });
    cleanups.push(() => {
      headlineTl.cleanup?.();
      subTl.cleanup?.();
    });

    const intro = gsap.timeline({ delay: 0.2 });
    intro
      .to(section, { autoAlpha: 1, duration: 0.6 }, 0)
      .add(headlineTl, 0)
      .fromTo(
        skyInner,
        { scale: 1.1 },
        { scale: 1, duration: 5, ease: "expo.out" },
        0
      )
      .fromTo(
        houseInner,
        { yPercent: 50 },
        { yPercent: 0, duration: 3, ease: "expo.out" },
        0
      )
      .fromTo(
        cloudInners,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.6 },
        0.2
      )
      .fromTo(
        cloudInners,
        { yPercent: 10 },
        { yPercent: 0, duration: 3, ease: "expo.out" },
        0.2
      )
      .add(subTl, 0.4);

    // ---- Ambient drift: runs from load, through idle and scroll alike —
    // the scrub's ±15% parting on the inners rides on top of this. Each
    // loop starts at a different phase so the layers are visibly mid-drift
    // from the first frame instead of easing out of rest in unison.
    clouds.forEach((cloud, i) => {
      gsap
        .fromTo(
          cloud,
          { xPercent: -AMBIENT_DRIFT[i].xPercent, yPercent: -AMBIENT_DRIFT[i].yPercent },
          {
            ...AMBIENT_DRIFT[i],
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }
        )
        .progress(i * 0.35);
    });

    // ---- Scroll scrub (positions normalized 0–1 across the 3,600px range).
    const scrub = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: section, ...HERO_SCRUB_TRIGGER },
    });
    scrub
      .to(house, { yPercent: -40, scale: 1.3, duration: 1 }, 0)
      .to(sky, { scale: 1.15, duration: 1 }, 0)
      .to(cloudLInner, { xPercent: -15, duration: 1 }, 0)
      .to(cloudRInner, { xPercent: 15, duration: 1 }, 0)
      .to(cloudMInner, { xPercent: -8, duration: 0.7 }, 0)
      .to(title, { yPercent: 20, scale: 0.9, autoAlpha: 0, duration: 0.2 }, 0)
      // Stroke draw: each letter 0.15 long, staggered across 0.10 → 0.40.
      .to(
        letters,
        { strokeDashoffset: 0, duration: 0.15, stagger: { amount: 0.15 } },
        0.1
      )
      .to(
        letters,
        { fillOpacity: 1, duration: 0.08, stagger: { amount: 0.02 } },
        0.38
      )
      // Crossfade moment: drawn wordmark → masked wordmark, house dissolves.
      .to(drawn, { autoAlpha: 0, duration: 0.12 }, 0.52)
      .to(masked, { autoAlpha: 1, duration: 0.15 }, 0.52)
      .to(house, { autoAlpha: 0, duration: 0.18 }, 0.54);

    return () => cleanups.forEach((fn) => fn());
  });

  // Below 768px: the mobile composition in Hero.tsx IS the hero (reference-
  // parity layout — top-left copy block, house rising from the bottom edge).
  // Motion-safe phones get their own scroll cinematic — the section grows to
  // 260vh and the stage goes sticky (motion-safe: Tailwind variants), so
  // scrolling drives a scrub that mirrors the reference's mobile beats: the sky
  // zooms, the house lifts out of frame + scales up and dissolves, and the copy
  // block drifts up as it fades. Plus the ambient puff drift. Reduced motion
  // never reaches here (guarded at the top), so the static one-screen composite
  // is its fallback.
  mm.add("(max-width: 767px)", () => {
    const cleanups: (() => void)[] = [];

    // Ambient drift: each puff loops a slow sine yoyo, phase-offset so they're
    // mid-drift from the first frame.
    const puffs = Array.from(
      section.querySelectorAll<HTMLElement>("[data-hero-mcloud]")
    );
    if (puffs.length) {
      gsap.set(puffs, { willChange: "transform" });
      puffs.forEach((puff, i) => {
        const d = MOBILE_DRIFT[i % MOBILE_DRIFT.length];
        const t = gsap
          .fromTo(
            puff,
            { xPercent: -d.xPercent, yPercent: -d.yPercent },
            {
              xPercent: d.xPercent,
              yPercent: d.yPercent,
              duration: d.duration,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }
          )
          .progress(i * 0.3);
        cleanups.push(() => t.kill());
      });
    }

    // Scroll cinematic — same tight scrub + range as desktop. Each layer is
    // static markup (no ambient loop on these), so the scrub owns its transform
    // outright; no outer/inner split needed here.
    const msky = section.querySelector<HTMLElement>("[data-hero-msky]");
    const mhouse = section.querySelector<HTMLElement>("[data-hero-mhouse]");
    const mcopy = section.querySelector<HTMLElement>("[data-hero-mcopy]");
    if (msky && mhouse && mcopy) {
      gsap.set([msky, mhouse, mcopy], { willChange: "transform" });
      // House scales from its base (pinned to the bottom edge) so it grows
      // UPWARD out of frame, like the reference building rising on scroll.
      gsap.set(mhouse, { transformOrigin: "50% 100%" });
      const scrub = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section, ...HERO_SCRUB_TRIGGER },
      });
      scrub
        .to(msky, { scale: 1.14, duration: 1 }, 0)
        // House rises out of the frame + scales up over the full range…
        .to(mhouse, { yPercent: -60, scale: 1.28, duration: 1 }, 0)
        // …dissolving into the sky over the back half of the lift.
        .to(mhouse, { autoAlpha: 0, duration: 0.4 }, 0.55)
        // Copy block drifts up and fades over the first ~40% (the reference's
        // mobile text parallax) so the house owns the frame as you scroll.
        .to(mcopy, { yPercent: -30, autoAlpha: 0, duration: 0.4 }, 0);
      cleanups.push(() => {
        scrub.scrollTrigger?.kill();
        scrub.kill();
      });
    }

    return () => cleanups.forEach((fn) => fn());
  });

  return () => mm.revert();
}
