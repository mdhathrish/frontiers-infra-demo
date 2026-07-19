/**
 * Motion preset library — the six timeline factories from MOTION-SPEC.md §2.1.
 *
 * Every factory returns a paused-able gsap timeline; attach it to a
 * ScrollTrigger via `useReveal` (which applies the trigger rules from the
 * spec: once-by-default, scrub reserved and passed explicitly).
 *
 * Global language (spec §2), SLOWED DOWN throughout this file (deliberately
 * off-spec, at the user's request — everything outside the hero should read
 * as slower/buttery rather than the spec's snappier 2s baseline; the hero
 * cinematic in hero.ts is intentionally untouched). Two rounds of tuning:
 * durations alone weren't enough — power4/expo "out" curves front-load
 * nearly all visible motion into the first fraction of a second no matter
 * how long the tween nominally runs, so the softer `power2.out` replaces
 * them for word/image/line reveals, spreading the motion across the whole
 * duration instead of resolving it almost instantly.
 * - reveals are ~3.6s, power2.out (never ease-in for entrances)
 * - staggers: fixed ~0.22s per item, or total-window { amount: 0.85 } for
 *   word sequences >5 words / { amount: 0.4 } for clip & line wipes
 * - hygiene: willChange set before / reset after, clearProps on clip-paths
 *
 * Static fallback: every factory checks `motionStatic()` (reduced motion OR
 * <768px viewport, per the project's mobile rule) and resolves to an
 * instant-set of the final state (empty timeline, no motion).
 */
import {
  gsap,
  SplitText,
  motionStatic,
  prefersReducedMotion,
  mobileMotion,
} from "./gsap";

/** Timeline plus an optional cleanup that reverts DOM mutations (SplitText wrappers, injected overlay divs). `useReveal` calls it on unmount. */
export type PresetTimeline = gsap.core.Timeline & { cleanup?: () => void };

const REVEAL_DURATION = 3.6;

/** Mobile-pass duration for the simple fadeUp every content preset degrades to
 *  below 768px — short and buttery, no SplitText, no clip-path (spec §5 /
 *  CLAUDE.md: "simple fadeUp once-triggers … no scrub, no pinning"). */
const MOBILE_REVEAL_DURATION = 0.9;

/**
 * The single reveal every content preset (word/line/clip/fade) collapses to on
 * a <768px viewport: targets rise `y 20 → 0` while fading in, once. No layout-
 * thrashing SplitText, no clip-path — cheap enough for low-end phones and
 * identical across sections so mobile reads as one system, not a downscaled
 * desktop. Reduced-motion users never reach here (they instant-set instead).
 */
function mobileFadeUp(targets: gsap.DOMTarget): PresetTimeline {
  const tl = gsap.timeline() as PresetTimeline;
  const els = gsap.utils.toArray<Element>(targets);
  if (!els.length) return tl;
  gsap.set(els, { willChange: "transform" });
  tl.fromTo(
    els,
    { y: 20, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: MOBILE_REVEAL_DURATION,
      ease: "power2.out",
      stagger: 0.1,
    }
  );
  tl.eventCallback("onComplete", () => {
    gsap.set(els, { willChange: "auto" });
  });
  return tl;
}

/** Merge several presets into one timeline (all starting at 0), preserving their cleanups. */
export function compose(...presets: PresetTimeline[]): PresetTimeline {
  const tl = gsap.timeline() as PresetTimeline;
  presets.forEach((p) => tl.add(p, 0));
  tl.cleanup = () => presets.forEach((p) => p.cleanup?.());
  return tl;
}

/**
 * wordMask — headline word reveal (spec §4.1).
 *
 * Double SplitText(type: "words"): the first split's word spans become
 * overflow masks (padding 0.15em / margin -0.15em cancel out visually but
 * keep descenders inside the mask); the second split's spans slide
 * y 115% → 0 over 2s power4.out.
 *
 * Markup may ship `visibility: hidden` (e.g. Tailwind `invisible`) — the
 * factory reveals the container once initial states are applied.
 */
export function wordMask(
  target: Element,
  {
    duration = REVEAL_DURATION,
    ease = "power2.out",
    stagger,
  }: {
    duration?: number;
    ease?: string;
    stagger?: number | gsap.StaggerVars;
  } = {}
): PresetTimeline {
  const tl = gsap.timeline() as PresetTimeline;
  if (prefersReducedMotion()) {
    gsap.set(target, { autoAlpha: 1 });
    return tl;
  }
  if (mobileMotion()) return mobileFadeUp(target);
  const masks = new SplitText(target, { type: "words" });
  const words = new SplitText(target, { type: "words" });
  gsap.set(masks.words, {
    display: "inline-block",
    overflow: "hidden",
    padding: "0.15em",
    margin: "-0.15em",
  });
  gsap.set(words.words, { display: "inline-block", willChange: "transform" });
  gsap.set(target, { autoAlpha: 1 });
  tl.fromTo(
    words.words,
    { yPercent: 115 },
    {
      yPercent: 0,
      duration,
      ease,
      stagger: stagger ?? (words.words.length > 5 ? { amount: 0.85 } : 0.22),
    }
  );
  tl.eventCallback("onComplete", () => {
    gsap.set(words.words, { willChange: "auto" });
  });
  tl.cleanup = () => {
    words.revert();
    masks.revert();
  };
  return tl;
}

/**
 * clipWipe — media/box reveal via clip-path (spec §2.1 clipReveal).
 *
 * inset(0 100% 0 0) → inset(0 0% 0 0) wipes L→R over 2s power3.out;
 * `from: "right"` uses the inset(0 0 0 100%) variant (wipes R→L).
 * clearProps removes the clip-path when done.
 */
export function clipWipe(
  targets: gsap.DOMTarget,
  { from = "left" }: { from?: "left" | "right" } = {}
): PresetTimeline {
  const tl = gsap.timeline() as PresetTimeline;
  if (prefersReducedMotion()) {
    gsap.set(targets, { autoAlpha: 1 });
    return tl;
  }
  if (mobileMotion()) return mobileFadeUp(targets);
  gsap.set(targets, { autoAlpha: 1 });
  tl.fromTo(
    targets,
    { clipPath: from === "right" ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
    {
      clipPath: "inset(0 0% 0 0%)",
      duration: REVEAL_DURATION,
      ease: "power2.out",
      stagger: { amount: 0.4 },
      clearProps: "clipPath",
    }
  );
  return tl;
}

/**
 * fadeUp — content block entrance (spec §2.1).
 *
 * y 70 → 0 over 2s expo.out, with a *separate* 0.1s opacity tween so the
 * motion outlasts the fade. `direction: "x"` gives the fadeFromX variant.
 */
export function fadeUp(
  targets: gsap.DOMTarget,
  {
    direction = "y",
    duration = REVEAL_DURATION,
    ease = "power2.out",
    stagger = 0.22,
    fadeDuration = 0.4,
  }: {
    direction?: "x" | "y";
    duration?: number;
    ease?: string;
    stagger?: number;
    fadeDuration?: number;
  } = {}
): PresetTimeline {
  const tl = gsap.timeline() as PresetTimeline;
  const els = gsap.utils.toArray<Element>(targets);
  if (prefersReducedMotion()) {
    gsap.set(els, { autoAlpha: 1 });
    return tl;
  }
  if (mobileMotion()) return mobileFadeUp(els);
  gsap.set(els, { willChange: "transform" });
  tl.fromTo(
    els,
    direction === "x" ? { x: 70 } : { y: 70 },
    {
      ...(direction === "x" ? { x: 0 } : { y: 0 }),
      duration,
      ease,
      stagger,
    },
    0
  ).fromTo(
    els,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: fadeDuration, ease: "none", stagger },
    0
  );
  tl.eventCallback("onComplete", () => {
    gsap.set(els, { willChange: "auto" });
  });
  return tl;
}

/**
 * lineWipe — the "ScrubbedText" highlight pattern (spec §2.1 / §4.2).
 *
 * SplitText(type: "lines"); injects one overlay div per line (bg = the
 * section's background color at ~0.8 alpha, inset top 10% / bottom -10%),
 * then scales each overlay X → 0 from the right so the text un-dims L→R.
 * 2s power3.out, { amount: 0.15 } stagger. Plays once — pair with
 * `lineWipeTrigger` for the spec's trigger window.
 *
 * `color` MUST match the section background: white rgba(255,255,255,.8),
 * off-white rgba(241,241,241,.8), dark rgba(21,23,23,.8).
 */
export function lineWipe(
  target: Element,
  { color = "rgba(255,255,255,0.8)" }: { color?: string } = {}
): PresetTimeline {
  const tl = gsap.timeline() as PresetTimeline;
  if (prefersReducedMotion()) {
    gsap.set(target, { autoAlpha: 1 });
    return tl;
  }
  if (mobileMotion()) return mobileFadeUp(target);
  gsap.set(target, { autoAlpha: 1 });
  // aria: "none" — the lineWipe target is a roleless wrapper div holding the
  // real h2/p. SplitText's default ("auto") moves an aria-label onto that div
  // (prohibited on a div with no role) and aria-hides the heading clones,
  // erasing every <h2> from the accessibility tree (a11y QA pass caught the
  // resulting H1→H3 heading-order skip + aria-prohibited-attr). "none" leaves
  // the cloned headings readable at their real level; the wordMask preset
  // keeps "auto" because its targets are already headings (h1/h3).
  const split = new SplitText(target, { type: "lines", aria: "none" });
  // SplitText 3.13 clones nested block elements (h2/p) once per visual line,
  // and every clone keeps its source's classes — including `mt-*` utilities —
  // so each continuation line would re-add its block's top margin and
  // permanently inflate the leading (and shift layout at mount). Zero the
  // margin on lines that continue the same source block (same tag + class
  // as the line before); each block's first line keeps its real margin.
  let prevKey: string | null = null;
  split.lines.forEach((line) => {
    const block = line.firstElementChild as HTMLElement | null;
    const key = block ? `${block.tagName}#${block.className}` : null;
    if (block && key !== null && key === prevKey) block.style.marginTop = "0";
    prevKey = key;
  });
  const overlays = split.lines.map((line) => {
    (line as HTMLElement).style.position = "relative";
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "absolute",
      left: "0",
      right: "0",
      top: "10%",
      bottom: "-10%",
      background: color,
      pointerEvents: "none",
      transformOrigin: "right center",
      willChange: "transform",
    });
    line.appendChild(overlay);
    return overlay;
  });
  tl.to(overlays, {
    scaleX: 0,
    duration: REVEAL_DURATION,
    ease: "power2.out",
    stagger: { amount: 0.4 },
  });
  tl.eventCallback("onComplete", () => {
    gsap.set(overlays, { willChange: "auto" });
  });
  tl.cleanup = () => {
    overlays.forEach((o) => o.remove());
    split.revert();
  };
  return tl;
}

/** Spec trigger window for lineWipe: starts ~200px before entering, once. */
export const lineWipeTrigger = {
  start: "top bottom-=200px",
  end: "center center",
} as const;

/**
 * parallax — ambient scrubbed drift (spec §2.1).
 *
 * y "10%" → "-10%" (configurable; optional scale/opacity), ease none.
 * Scrub lives on the trigger, not here — pass `parallaxTrigger` (scrub 1.5,
 * top bottom → bottom top) to `useReveal`.
 */
export function parallax(
  target: gsap.DOMTarget,
  {
    fromY = "10%",
    toY = "-10%",
    scale,
    opacity,
  }: {
    fromY?: string | number;
    toY?: string | number;
    scale?: [number, number];
    opacity?: [number, number];
  } = {}
): PresetTimeline {
  const tl = gsap.timeline() as PresetTimeline;
  if (motionStatic()) return tl;
  const fromVars: gsap.TweenVars = { y: fromY };
  const toVars: gsap.TweenVars = { y: toY, ease: "none" };
  if (scale) [fromVars.scale, toVars.scale] = scale;
  if (opacity) [fromVars.opacity, toVars.opacity] = opacity;
  gsap.set(target, { willChange: "transform" });
  tl.fromTo(target, fromVars, toVars);
  return tl;
}

/** Spec trigger for parallax: loose/floaty scrub over the full pass-through — slowed (higher scrub lag) for a buttery feel. */
export const parallaxTrigger = {
  scrub: 3.2,
  start: "top bottom",
  end: "bottom top",
} as const;

/**
 * fadeIn — plain opacity entrance (spec §2.1, their `<FadeIn>` wrapper).
 *
 * autoAlpha 0 → 1 over 1.6s (slowed from spec's 1s), stagger 0.15. Used for
 * low-emphasis items (menu secondary links, captions).
 */
export function fadeIn(
  targets: gsap.DOMTarget,
  { duration = 2.4 }: { duration?: number } = {}
): PresetTimeline {
  const tl = gsap.timeline() as PresetTimeline;
  const els = gsap.utils.toArray<Element>(targets);
  if (prefersReducedMotion()) {
    gsap.set(els, { autoAlpha: 1 });
    return tl;
  }
  if (mobileMotion()) {
    tl.fromTo(
      els,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.6, ease: "none", stagger: 0.08 }
    );
    return tl;
  }
  tl.fromTo(
    els,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration, ease: "none", stagger: 0.2 }
  );
  return tl;
}

/**
 * chevronDrift — the arrows-section row (spec §3.3).
 *
 * Every item EXCEPT the first drifts in from x -10% / scale .8 / opacity .1
 * to identity, stagger 0.2. Scrubbed — pair with `chevronTrigger` (scrub 3,
 * top bottom → center center) so the chevrons settle by mid-viewport.
 * Ease none: the scrub supplies the feel.
 */
export function chevronDrift(targets: gsap.DOMTarget): PresetTimeline {
  const tl = gsap.timeline() as PresetTimeline;
  const els = gsap.utils.toArray<Element>(targets);
  // Static fallback: items ship visible in markup — nothing to do.
  if (motionStatic() || els.length < 2) return tl;
  gsap.set(els, { willChange: "transform" });
  tl.fromTo(
    els.slice(1),
    { xPercent: -10, scale: 0.8, opacity: 0.1 },
    { xPercent: 0, scale: 1, opacity: 1, ease: "none", stagger: 0.45 }
  );
  return tl;
}

/** Spec §3.3 trigger for chevronDrift: very loose scrub, settled by mid-viewport — slowed further for a buttery drift. */
export const chevronTrigger = {
  scrub: 6,
  start: "top bottom",
  end: "center center",
} as const;

/**
 * footerReveal — the footer's scrubbed slide-up (spec §3.11).
 *
 * y "-40%" → "0%", scale .98 → 1, opacity fades in over just the first 30%
 * of the scrub range, power1.out. Pair with `footerRevealTrigger`
 * (scrub: true, top bottom → bottom bottom) — the classic "footer parked
 * behind the page" reveal. Desktop-only is handled for free: `motionStatic()`
 * already gates <768px, so no separate matchMedia is needed (spec §5 calls
 * out the original's per-breakpoint gating as unnecessary complexity).
 */
export function footerReveal(target: gsap.DOMTarget): PresetTimeline {
  const tl = gsap.timeline() as PresetTimeline;
  if (motionStatic()) {
    gsap.set(target, { autoAlpha: 1 });
    return tl;
  }
  gsap.set(target, { willChange: "transform" });
  tl.fromTo(
    target,
    { yPercent: -40, scale: 0.98 },
    { yPercent: 0, scale: 1, ease: "power1.out", duration: 2 },
    0
  ).fromTo(
    target,
    { autoAlpha: 0 },
    { autoAlpha: 1, ease: "none", duration: 0.65 },
    0
  );
  return tl;
}

/** Spec §3.11 trigger for footerReveal: true scrub, pinned to the footer's own span. */
export const footerRevealTrigger = {
  scrub: true,
  start: "top bottom",
  end: "bottom bottom",
} as const;

/**
 * footerLogoReveal — giant wordmark letters (spec §2 "one special" stagger).
 *
 * y 20 → 0 + fade, 2s expo.out, `stagger: { each: 0.1, from: "end" }` so the
 * letters draw right-to-left. Triggered once — pass plain paths/spans.
 */
export function footerLogoReveal(targets: gsap.DOMTarget): PresetTimeline {
  const tl = gsap.timeline() as PresetTimeline;
  const els = gsap.utils.toArray<Element>(targets);
  if (prefersReducedMotion()) {
    gsap.set(els, { autoAlpha: 1 });
    return tl;
  }
  if (mobileMotion()) {
    // SVG <path>s: fade only, no y-transform (px transforms on paths read as a
    // jitter against the user-unit viewBox). Right-to-left order preserved.
    tl.fromTo(
      els,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.8,
        ease: "power2.out",
        stagger: { each: 0.05, from: "end" },
      }
    );
    return tl;
  }
  gsap.set(els, { willChange: "transform" });
  tl.fromTo(
    els,
    { y: 20, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: REVEAL_DURATION,
      ease: "power2.out",
      stagger: { each: 0.22, from: "end" },
    }
  );
  tl.eventCallback("onComplete", () => {
    gsap.set(els, { willChange: "auto" });
  });
  return tl;
}

/**
 * counter — number count-up (spec §2.1).
 *
 * Tweens a proxy value and rewrites innerText, locale-formatted with
 * decimals preserved (inferred from `to` unless given). 2.2s (slowed from
 * spec's 1.5s) expo.out, power2.inOut for numbers of ≤2 digits.
 */
export function counter(
  target: Element,
  {
    to,
    from = 0,
    decimals,
    locale,
  }: { to: number; from?: number; decimals?: number; locale?: string }
): PresetTimeline {
  const el = target as HTMLElement;
  const places = decimals ?? (String(to).split(".")[1]?.length ?? 0);
  const format = (v: number) =>
    v.toLocaleString(locale, {
      minimumFractionDigits: places,
      maximumFractionDigits: places,
    });
  const tl = gsap.timeline() as PresetTimeline;
  gsap.set(el, { autoAlpha: 1 });
  // Counters count up on mobile too — cheap, and a nice sign of life. Only
  // reduced motion skips straight to the final value.
  if (prefersReducedMotion()) {
    el.innerText = format(to);
    return tl;
  }
  const digits = Math.floor(Math.abs(to)).toString().length;
  const proxy = { value: from };
  el.innerText = format(from);
  tl.to(proxy, {
    value: to,
    duration: 2.8,
    ease: digits <= 2 ? "power2.inOut" : "power2.out",
    onUpdate: () => {
      el.innerText = format(proxy.value);
    },
  });
  return tl;
}
