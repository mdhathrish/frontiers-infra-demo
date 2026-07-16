/**
 * Motion preset library — the six timeline factories from MOTION-SPEC.md §2.1.
 *
 * Every factory returns a paused-able gsap timeline; attach it to a
 * ScrollTrigger via `useReveal` (which applies the trigger rules from the
 * spec: once-by-default, scrub reserved and passed explicitly).
 *
 * Global language (spec §2):
 * - reveals are 2s on expo/power-out tails; never ease-in for entrances
 * - staggers: fixed 0.1s per item, or total-window { amount: 0.4 } for
 *   word sequences >5 words / { amount: 0.15 } for clip & line wipes
 * - hygiene: willChange set before / reset after, clearProps on clip-paths
 *
 * Reduced motion: every factory checks `prefersReducedMotion()` and resolves
 * to an instant-set of the final state (empty timeline, no motion).
 */
import { gsap, SplitText, prefersReducedMotion } from "./gsap";

/** Timeline plus an optional cleanup that reverts DOM mutations (SplitText wrappers, injected overlay divs). `useReveal` calls it on unmount. */
export type PresetTimeline = gsap.core.Timeline & { cleanup?: () => void };

const REVEAL_DURATION = 2;

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
export function wordMask(target: Element): PresetTimeline {
  const tl = gsap.timeline() as PresetTimeline;
  if (prefersReducedMotion()) {
    gsap.set(target, { autoAlpha: 1 });
    return tl;
  }
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
      duration: REVEAL_DURATION,
      ease: "power4.out",
      stagger: words.words.length > 5 ? { amount: 0.4 } : 0.1,
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
  gsap.set(targets, { autoAlpha: 1 });
  tl.fromTo(
    targets,
    { clipPath: from === "right" ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" },
    {
      clipPath: "inset(0 0% 0 0%)",
      duration: REVEAL_DURATION,
      ease: "power3.out",
      stagger: { amount: 0.15 },
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
  { direction = "y" }: { direction?: "x" | "y" } = {}
): PresetTimeline {
  const tl = gsap.timeline() as PresetTimeline;
  const els = gsap.utils.toArray<Element>(targets);
  if (prefersReducedMotion()) {
    gsap.set(els, { autoAlpha: 1 });
    return tl;
  }
  gsap.set(els, { willChange: "transform" });
  tl.fromTo(
    els,
    direction === "x" ? { x: 70 } : { y: 70 },
    {
      ...(direction === "x" ? { x: 0 } : { y: 0 }),
      duration: REVEAL_DURATION,
      ease: "expo.out",
      stagger: 0.1,
    },
    0
  ).fromTo(
    els,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.1, ease: "none", stagger: 0.1 },
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
  gsap.set(target, { autoAlpha: 1 });
  if (prefersReducedMotion()) return tl;
  const split = new SplitText(target, { type: "lines" });
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
    ease: "power3.out",
    stagger: { amount: 0.15 },
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
  if (prefersReducedMotion()) return tl;
  const fromVars: gsap.TweenVars = { y: fromY };
  const toVars: gsap.TweenVars = { y: toY, ease: "none" };
  if (scale) [fromVars.scale, toVars.scale] = scale;
  if (opacity) [fromVars.opacity, toVars.opacity] = opacity;
  gsap.set(target, { willChange: "transform" });
  tl.fromTo(target, fromVars, toVars);
  return tl;
}

/** Spec trigger for parallax: loose/floaty scrub over the full pass-through. */
export const parallaxTrigger = {
  scrub: 1.5,
  start: "top bottom",
  end: "bottom top",
} as const;

/**
 * counter — number count-up (spec §2.1).
 *
 * Tweens a proxy value and rewrites innerText, locale-formatted with
 * decimals preserved (inferred from `to` unless given). 1.5s expo.out,
 * power2.inOut for numbers of ≤2 digits.
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
  if (prefersReducedMotion()) {
    el.innerText = format(to);
    return tl;
  }
  const digits = Math.floor(Math.abs(to)).toString().length;
  const proxy = { value: from };
  el.innerText = format(from);
  tl.to(proxy, {
    value: to,
    duration: 1.5,
    ease: digits <= 2 ? "power2.inOut" : "expo.out",
    onUpdate: () => {
      el.innerText = format(proxy.value);
    },
  });
  return tl;
}
