# MOTION-SPEC — findrealestate.com

Reverse-engineered motion design system of https://findrealestate.com/ (FIND Real Estate).
Sources: page HTML, all 36 Next.js chunks (deobfuscated animation modules), 11 CSS bundles, and a
1440px headless-browser scroll pass (65 screenshots at 200px steps, full page height 13,761px).

---

## 1. Stack summary

| Layer | Library | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | 15.5.7 | Deployed on Vercel |
| Animation core | GSAP | 3.13.0 | Registered globally |
| Scroll triggers | ScrollTrigger | 3.13.0 | No pinning used anywhere |
| Text splitting | GSAP SplitText | 3.13.0 | Words + lines modes (no chars) |
| SVG line draw | GSAP DrawSVGPlugin | 3.13.0 | Hero logo outline only |
| Custom curves | GSAP CustomEase | 3.13.0 | Menu curtain only |
| Smooth scroll | Lenis (`lenis/react`) | 1.3.17 | Desktop only — disabled on touch |
| Carousel | Swiper | ~11 | Testimonials only (`slidesPerView: 1`, bullet pagination) |
| WebGL | **None** | — | No Three.js/OGL; "smoke"/"clouds" are static PNGs moved with transforms |
| Page transitions | **None** | — | YouTube-style loading line at top during route change; each page re-runs its mount reveals |

**Smooth-scroll wiring** (layout chunk): `<ReactLenis root options={{ autoRaf: false }}>`, RAF driven by
`gsap.ticker.add(t => lenis.raf(t * 1000))` with `gsap.ticker.lagSmoothing(0)` so ScrollTrigger and Lenis
share one clock. On touch devices (`ScrollTrigger.isTouch`) Lenis is not mounted at all — native scroll.
Overlays/modals set `data-lenis-prevent` and lock `body` overflow. Lenis options are otherwise defaults
(`lerp: 0.1`, `wheelMultiplier: 1`, `duration: undefined`).

**Accessibility note:** only the toast library respects `prefers-reduced-motion`. The GSAP system has no
reduced-motion guard (a gap worth fixing in our build).

---

## 2. Global motion language

**Easing (two families):**
- **GSAP reveals:** `expo.out` (fade-ups, hero), `power4.out` (word reveals), `power3.out` (clip/line wipes),
  `none` (scrubbed parallax), `power1.out` (footer scrub). Never ease-in for entrances.
- **CSS micro-interactions:** `cubic-bezier(.16, 1, .3, 1)` (≈ expo-out; 17 uses — the house style for
  hovers at 0.75–1s), `cubic-bezier(.5, 1, .89, 1)` for subtle fades, and springy overshoot curves
  `cubic-bezier(.34, 3.56, .64, 1)` / `(.34, 5.56, .64, 1)` at 0.7s for playful pops (icons, round buttons).
- **One CustomEase:** `.76, 0, .2, 1` — symmetric in/out, used only for the menu curtain (0.7s).

**Duration range:** in-view reveals are *long* — 2s is the standard reveal duration (the expo/power tails
make it feel much faster). Hero intro layers run 3–5s. Counters 1.5s. UI/hover CSS transitions 0.2–0.9s.
Menu curtain 0.7s.

**Stagger style:** two modes — fixed `0.1s` per item (words ≤5, list items, fades), or total-window
`{ amount: 0.4 }` for word sequences >5 words and `{ amount: 0.15 }` for clip/line wipes. One special:
footer logo letters stagger `{ each: 0.1, from: "end" }` (draws right-to-left).

**Trigger philosophy:** almost everything is **triggered once** (`once: true`, default start ≈ element
entering viewport). Scrub is reserved for four things: the hero cinematic (`scrub: 0.1` — near-locked),
ambient parallax (`scrub: 1.5` — loose/floaty), the arrows section (`scrub: 3` — very loose), and the
footer reveal (`scrub: true`). **No pinning anywhere** — the hero achieves its "pinned" feel with a
~3,600px-tall section whose visual composite stays fixed-position while the scrub timeline plays.

**Hygiene pattern in every preset:** `set(el, { willChange: "transform" })` before the tween, reset to
`"auto"` after; `clearProps` on clip-paths; sections ship with `visibility: hidden` inline and are revealed
by their timelines (no flash of unanimated content).

### 2.1 The preset library (their shared animation module)

All section reveals are built from ~9 reusable factory functions (each returns a GSAP timeline; a paired
wrapper attaches a `ScrollTrigger` with `once: true` unless noted):

| Preset | What it does | Config |
|---|---|---|
| **wordReveal** | Double `SplitText(type:"words")` — outer span = mask (`overflow: hidden`, `padding: 0.15em; margin: -0.15em` to avoid descender clipping), inner span tweens `y: "115%" → "0%"` | dur 2, `power4.out`, stagger `>5 words ? {amount:.4} : .1` |
| **clipReveal** | `clipPath: inset(0 100% 0 0) → inset(0 0% 0 0)` (wipes L→R; variant `inset(0 0 0 100%)` wipes R→L) | dur 2, `power3.out`, stagger `{amount:.15}`, `clearProps` |
| **fadeUp** | `y: 70 → 0` + separate opacity tween `0 → 1` over just 0.1s (motion outlasts the fade) | dur 2, `expo.out`, stagger .1 |
| **fadeFromX** | same as fadeUp but `x: 70 → 0` | identical |
| **lineWipe** ("ScrubbedText") | `SplitText(type:"lines")`; injects an overlay `div` per line (bg = section background color at opacity .9, inset `top:10%/bottom:-10%`), then `scaleX: 1 → 0`, `transformOrigin: "right center"` — text sits dimmed under a tint and un-highlights L→R | dur 2, `power3.out`, stagger `{amount:.15}`; trigger `start: "top bottom-=200px", end: "center center"`, plays once (not actually scrubbed despite the name) |
| **counter** | tweens a proxy number and rewrites `innerText` (locale-formatted, decimals preserved) | dur 1.5, `expo.out` (`power2.inOut` for ≤2 digits) |
| **parallax** | `y: "10%" → "-10%"` (configurable, optional scale/opacity) | ease `none`, **scrub 1.5**, `start: "top bottom", end: "bottom top"` |
| **fadeIn** | opacity `0 → 1`; exposed as a `<FadeIn delay={0.5}>` wrapper component | dur 1, stagger .1 |

`ScrubbedText` is a React component: `<ScrubbedText color="rgba(241,241,241,0.8)">` — the color prop is the
overlay tint and always matches the section background (white sections `rgba(255,255,255,.8)`, off-white
`rgba(241,241,241,.8)`, dark `rgba(21,23,23,.8)`).

---

## 3. Section-by-section breakdown (1440px)

Page order: hero → why-us → arrows → steps ("Real Estate, Rewired") → for-agents → testimonials →
services → features → latest-posts → outro → footer.

### 3.1 Hero — "Find What Moves You" (~3,600px tall, the signature moment)

**Load timeline** (paused; kicked off `setTimeout 200ms → requestAnimationFrame`; section starts
`visibility: hidden`):
| Time | Target | Animation |
|---|---|---|
| 0 | section | `autoAlpha 0 → 1`, 0.6s |
| 0 | H1 | wordReveal, dur 2, stagger .1 |
| 0 | sky bg | `scale 1.1 → 1`, dur 5, `expo.out` |
| 0 | house | `y "50%" → 0`, dur 3, `expo.out` |
| 0.1 | clouds composite | `y "100%" → 0`, dur 4, `expo.out` |
| 0.2 | smoke/cloud PNGs | opacity 0→1 (0.6s) + `y "10%" → 0` (dur 3, `expo.out`) |
| 0.4 | subcopy + CTA | fadeUp |

**Scroll scrub** — `start: "top top", end: "bottom top"`, **`scrub: 0.1`** (tight), no pin (tall section +
fixed composite). Normalized timeline positions:
| Progress | Animation |
|---|---|
| 0 → 1 | house + sky: `y → "-40%"`, `scale → 1.3` (slow zoom-in as you scroll) |
| 0 → 1 | cloud bank rises to `y: 0%`; left cloud `x → "-15%"`, right cloud `x → "+15%"` (clouds part) |
| 0 → 1 | title block `y → "20%"`, `scale → 0.9`, opacity → 0 within first ~20% |
| 0.10 → 0.40 | **FIND logo SVG (14 paths) `drawSVG: "0%" → "100%"`** — outline draws over the house |
| 0.28 | outline fades out (0.2) |
| 0.30 | solid logo (house-image-masked "FIND Real Estate" wordmark) fades in; house layer fades out |
| → 1 | end state: masked logo floating over pure sky/smoke |

Reading: house rises → you scroll → clouds part, logo literally draws itself over the building, then the
building *becomes* the logo (image clipped inside the letterforms), ending on sky. All raster + SVG — no WebGL.

### 3.2 Why-us — "Why FIND" (white)
- Heading + paragraph: **lineWipe** (triggered ~200px before entering, once).
- Full-width city **video** preview: **parallax zoom** `scale 1 → 1.1`, `scrub: 1.5`, plus **clipReveal** on entry.

### 3.3 Arrows section — "This isn't just about real estate." (white)
- Title: lineWipe.
- Chevron-masked image row (`clip-path` arrow shapes): all rows except the first
  `fromTo x: "-10%", scale: .8, opacity: .1 → x: 0, scale: 1, opacity: 1`, `stagger: .2`,
  **scrubbed** — `scrub: 3`, `start: "top bottom", end: "center center"` (chevrons drift in lazily,
  settle by mid-viewport).

### 3.4 Steps — "Real Estate, Rewired." (white)
- Title + "Start Your Search" CTA column: lineWipe + fadeUp.
- Numbered steps (01/02/03): **fadeUp per item, once**, sequential as they enter.

### 3.5 For Agents — "Don't Rent Your Career. Own It." (white)
- Above-image text: lineWipe. Images (aerial + agent photo): clipReveal. Body copy fadeUp + "Join The
  Movement" CTA (that CTA block uses the R→L clip variant `inset(0 0 0 100%)`).

### 3.6 Testimonials — "Don't Take Our Word for It." (off-white #f1f1f1)
- Title: lineWipe (`rgba(241,241,241,.8)` tint).
- Photo: clipReveal. Quotes: **Swiper**, `slidesPerView: 1`, clickable bullet pagination, no autoplay
  detected; slide change animated by Swiper defaults (300ms translate).

### 3.7 Services — "How FIND Can Help You" / Buy / Sell / Rent (dark #151717)
- Headings & brief: lineWipe with dark tint `rgba(21,23,23,.8)`.
- Giant Buy/Sell/Rent words + row items: fadeUp/wordReveal per row, once, as each row enters.

### 3.8 Features — "Support Beyond Buying and Selling" (dark)
- Title: lineWipe; three photo cards (Mortgage/Property/Construction): clipReveal + fadeUp, once.

### 3.9 Latest posts — "Blog & Resources" (off-white)
- Title: lineWipe. Each post row: thumbnail **clipReveal from the right** (`inset(0 0 0 100%) → 0%`),
  text fadeUp, once per row.

### 3.10 Outro — "Find You. We'll Help You Get There." (video bg)
- Background video: **parallax zoom** `scale 1 → 1.1` (scrub 1.5) + clipReveal on the media frame.
- Headline: lineWipe (white tint).

### 3.11 Footer (dark)
- Whole content block: **scrubbed slide-up** — `y: "-40%" → "0%"`, `scale: .98 → 1`, opacity in over first
  30%, `power1.out`, `scrub: true`, `start: "top bottom", end: "bottom bottom"` — classic
  "footer parked behind the page" reveal. **Desktop only** (`gsap.matchMedia("(min-width: 768px)")`).
- Giant FIND logo: SVG paths fadeUp `y: 20`, `stagger: { each: .1, from: "end" }`, once.

### 3.12 Overlays / chrome
- **Burger menu:** backdrop `scaleY 0 → 1` from top, 0.7s, `CustomEase(".76, 0, .2, 1")`; nav links
  wordReveal at +0.4s; secondary items fadeIn at +0.6s. Close = reverse (scaleY → 0 + fade, same ease).
  Locks body scroll + `data-lenis-prevent`.
- **Modals (Radix):** CSS keyframes `overlayShow` / `contentShow` / `slideUp` / `slideDown`.
- **Hovers:** `transform .9s cubic-bezier(.16,1,.3,1)` (buttons, card lifts, round-button icon swaps);
  bouncy `.7s cubic-bezier(.34,3.56,.64,1)` overshoot on icons; image hover zooms
  `transform 4s` + `clip-path 1s` with the same expo-out curve.
- **Route change:** thin top loading line (YouTube-style keyframes), no exit/enter choreography.

---

## 4. Typography animation patterns

1. **Word-mask reveal** (headlines, nav): double SplitText into words; outer = overflow mask with
   `padding: 0.15em / margin: -0.15em` (prevents descender clipping — steal this detail); inner slides
   `y 115% → 0`, 2s `power4.out`, stagger .1 or `{amount:.4}`. Triggered once.
2. **Line highlight wipe** (`ScrubbedText` — their most-used body/heading pattern): split into lines,
   per-line background-colored overlay scales X to 0 from the right, so text "un-dims" left-to-right,
   2s `power3.out`, `{amount:.15}` stagger. Reads as a text-highlight effect; costs one div per line.
   Trigger window `top bottom-=200px → center center`, plays once.
3. **No character splits** anywhere. No masked clip-path text. Counters for numbers (1.5s, expo.out).
4. Em-spans (`.em`) get color contrast via CSS, not animation — the two-tone headline look
   ("Don't Take **Our Word** for It.") is static styling.

---

## 5. What we should replicate vs simplify

### Replicate as-is (high value, low risk)
- **The preset-module architecture**: one shared file of timeline factories (wordReveal, clipReveal,
  fadeUp, lineWipe, parallax, counter) + thin `once: true` ScrollTrigger wrappers. This is why the site
  feels coherent — every section composes the same 6 verbs. Build this first.
- **The global language**: 2s reveals on expo/power-out tails, 0.1s / `{amount:.15}` staggers,
  `cubic-bezier(.16,1,.3,1)` for all CSS hovers, trigger-once for content, scrub only for ambience.
- **Lenis + gsap.ticker wiring** exactly as they do it (`autoRaf: false`, `lagSmoothing(0)`,
  disable on touch, `data-lenis-prevent` on overlays). Note: SplitText and DrawSVG are free since GSAP 3.13.
- **lineWipe / ScrubbedText** — distinctive, cheap, and reusable across light/dark sections via the
  tint-color prop. Signature-worthy.
- **Footer scrubbed slide-up** and the word-mask reveal with the padding/margin descender trick.
- **willChange set/unset hygiene** and `visibility: hidden` + `autoAlpha` intro pattern.

### Simplify for our build
- **Hero cinematic**: theirs is ~7 layered art assets + a 14-path DrawSVG logo + an image-masked wordmark
  choreographed over 2.5 viewports. Unless we commission equivalent art, do a reduced version: one bg
  layer with scale/y scrub + headline parallax-fade + one signature moment (logo draw *or* mask reveal,
  not both). The `scrub: 0.1` tightness and `top top → bottom top` range are worth keeping.
- **Double SplitText** in wordReveal → single split with CSS `overflow: hidden` line wrappers does 95%
  of it with half the DOM.
- **Arrows scrub (`scrub: 3` + stagger)** → a triggered-once stagger reads nearly the same and avoids
  the half-revealed state slow scrollers see.
- **Counter locale formatting / decimal preservation** → only if we actually show stats.
- **Skip**: Swiper (one carousel doesn't justify the dependency — CSS scroll-snap or Embla), the
  per-breakpoint `matchMedia` footer gating (make ours responsive by default).

### Fix what they got wrong
- Add a `prefers-reduced-motion` guard that collapses all presets to simple fades — the original has none.
- Their scrubbed sections stall visibly if you stop mid-scroll (arrows section); prefer trigger-once
  where the animation carries meaning.
- Long 2s reveals + `once: true` means fast scrollers can outrun reveals; keep their trigger offsets
  (`top bottom-=200px`) so content starts animating before it's centered.
