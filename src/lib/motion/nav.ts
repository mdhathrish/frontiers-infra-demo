/**
 * Nav chrome motion — MOTION-SPEC.md §3.12 (burger menu) + the scrolled-state
 * background toggle.
 *
 * `mountNav` — toggles `data-solid` on the header once the page scrolls past
 * the hero (the header's own CSS handles the visual transition). This is a
 * legibility state change, not an animation, so it runs at every viewport
 * width and under reduced motion.
 *
 * `createMenuController` — the menu curtain choreography (spec §3.12):
 * - open: backdrop `scaleY 0 → 1` from the top, 0.7s `CustomEase(.76,0,.2,1)`;
 *   nav links wordMask starting at +0.4s (0.1s apart); secondary items fadeIn
 *   at +0.6s
 * - close: reverse — content fades, backdrop `scaleY → 0` with the same ease
 * - locks body scroll while open (markup must carry `data-lenis-prevent`)
 * - static fallback (reduced motion / <768px): instant show/hide
 *
 * Elements are located via `data-menu="<name>"`: backdrop · content ·
 * link (each) · secondary (each).
 */
import { gsap, ScrollTrigger, CustomEase, motionStatic } from "./gsap";
import { wordMask, fadeIn, type PresetTimeline } from "./presets";

/** Spec §2: the one CustomEase — symmetric in/out, menu curtain only. */
export const MENU_CURTAIN_EASE = "0.76, 0, 0.2, 1";
const CURTAIN_DURATION = 0.7;

/**
 * Header background toggle: transparent over the hero, solid (`data-solid`)
 * once the hero's bottom passes the header. Returns a cleanup.
 */
export function mountNav(
  header: HTMLElement,
  hero: Element | null
): () => void {
  const st = ScrollTrigger.create({
    trigger: hero ?? document.body,
    // Fire when the hero's bottom edge crosses the header's bottom edge —
    // i.e. the first content section is about to slide under the nav.
    start: hero ? () => `bottom top+=${header.offsetHeight}` : "top -400",
    onEnter: () => header.setAttribute("data-solid", ""),
    onLeaveBack: () => header.removeAttribute("data-solid"),
  });
  return () => st.kill();
}

export interface MenuController {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
  destroy: () => void;
}

export function createMenuController(overlay: HTMLElement): MenuController {
  const backdrop = overlay.querySelector<HTMLElement>('[data-menu="backdrop"]');
  const content = overlay.querySelector<HTMLElement>('[data-menu="content"]');
  const links = Array.from(
    overlay.querySelectorAll<HTMLElement>('[data-menu="link"]')
  );
  const secondary = overlay.querySelectorAll<HTMLElement>(
    '[data-menu="secondary"]'
  );

  let openTl: PresetTimeline | null = null;
  let closeTl: gsap.core.Timeline | null = null;
  let open = false;

  const lockBody = (locked: boolean) => {
    document.body.style.overflow = locked ? "hidden" : "";
  };

  /** Built lazily on first open so SplitText measures laid-out fonts. */
  const buildOpen = (): PresetTimeline => {
    const ease = CustomEase.create("menuCurtain", MENU_CURTAIN_EASE);
    const tl = gsap.timeline({ paused: true }) as PresetTimeline;
    const linkTls = links.map((link) => wordMask(link));
    tl.set(overlay, { autoAlpha: 1 }, 0)
      .set(content, { autoAlpha: 1 }, 0)
      .fromTo(
        backdrop,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: CURTAIN_DURATION,
          ease,
          transformOrigin: "center top",
        },
        0
      );
    linkTls.forEach((linkTl, i) => tl.add(linkTl, 0.4 + i * 0.1));
    tl.add(fadeIn(secondary), 0.6);
    tl.cleanup = () => linkTls.forEach((linkTl) => linkTl.cleanup?.());
    return tl;
  };

  /** Spec: close = backdrop scaleY → 0 + fade, same ease. */
  const buildClose = (): gsap.core.Timeline => {
    const ease = CustomEase.create("menuCurtain", MENU_CURTAIN_EASE);
    return gsap
      .timeline({ paused: true })
      .to(content, { autoAlpha: 0, duration: 0.25 }, 0)
      .to(
        backdrop,
        {
          scaleY: 0,
          duration: CURTAIN_DURATION,
          ease,
          transformOrigin: "center top",
        },
        0.05
      )
      .set(overlay, { autoAlpha: 0 });
  };

  return {
    open() {
      if (open) return;
      open = true;
      lockBody(true);
      if (motionStatic()) {
        gsap.set([overlay, content, ...links, ...secondary], { autoAlpha: 1 });
        return;
      }
      closeTl?.kill();
      openTl ??= buildOpen();
      openTl.restart();
    },
    close() {
      if (!open) return;
      open = false;
      lockBody(false);
      if (motionStatic()) {
        gsap.set(overlay, { autoAlpha: 0 });
        return;
      }
      openTl?.pause();
      closeTl?.kill();
      closeTl = buildClose();
      closeTl.play();
    },
    isOpen: () => open,
    destroy() {
      lockBody(false);
      openTl?.kill();
      openTl?.cleanup?.();
      closeTl?.kill();
    },
  };
}
