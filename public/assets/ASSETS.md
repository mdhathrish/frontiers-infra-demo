# Asset credits

All photos and videos sourced from [Pexels](https://www.pexels.com) (free license, no
attribution legally required — credited here anyway). Wordmark SVGs are client-provided
brand assets, not from Pexels.

Originals live in `raw/` (gitignored, local only). Optimized/curated versions used in the
site live in `hero/`, `sections/`, and `videos/`.

## Hero

| File | Source | Photographer | Intended use |
|---|---|---|---|
| `hero/house-cutout.png` | [pexels.com/photo/323775](https://www.pexels.com/photo/low-angle-view-of-balcony-against-sky-323775/) | Expect Best | Background-removed house cutout for the hero cinematic (MOTION-SPEC §3.1) — the layer the FIND logo draws over and masks into |
| `hero/sky.webp` | [pexels.com/photo/33683957](https://www.pexels.com/photo/fluffy-white-clouds-against-blue-sky-33683957/) | jiale MA | Hero "sky bg" layer (§3.1) — `scale 1.1 → 1` on load |

## Sections

| File | Source | Photographer | Intended section |
|---|---|---|---|
| `sections/pexels-max-vakhtbovych-7031595.webp` | [7031595](https://www.pexels.com/photo/contemporary-villa-against-cloudy-blue-sky-7031595/) | Max Vakhtbovych | Why-us (§3.2) — supporting still |
| `sections/pexels-abid-ali-10647324.webp` | [10647324](https://www.pexels.com/photo/white-and-brown-concrete-building-near-the-swimming-pool-10647324/) | Abid Ali | Arrows chevron row (§3.3) |
| `sections/pexels-min-an-740587.webp` | [740587](https://www.pexels.com/photo/white-and-gray-concrete-buildings-with-green-trees-under-green-sky-740587/) | Min An | Arrows chevron row (§3.3) |
| `sections/pexels-derwin-edwards-10854904.webp` | [10854904](https://www.pexels.com/photo/drone-shot-of-green-trees-and-houses-10854904/) | Derwin Edwards | Arrows chevron row (§3.3) |
| `sections/pexels-curtis-adams-3935327.webp` | [3935327](https://www.pexels.com/photo/photo-of-an-empty-room-3935327/) | Curtis Adams | Steps section backdrop (§3.4) |
| `sections/pexels-kindel-media-9716228.webp` | [9716228](https://www.pexels.com/photo/drone-shot-of-a-residential-area-9716228/) | Kindel Media | For Agents — aerial image slot (§3.5) |
| `sections/pexels-max-vakhtbovych-8082328.webp` | [8082328](https://www.pexels.com/photo/beautiful-villa-seen-from-front-yard-8082328/) | Max Vakhtbovych | For Agents — secondary image slot (§3.5); no agent portrait was sourced this pass |
| `sections/pexels-sharath-g-31737859.webp` | [31737859](https://www.pexels.com/photo/modern-luxurious-home-exterior-at-night-31737859/) | Sharath G. | Testimonials — mood accent (§3.6) |
| `sections/pexels-ph-t-tr-ng-38000582.webp` | [38000582](https://www.pexels.com/photo/contrasting-urban-architecture-facades-38000582/) | Phát Trương | Services — Rent (§3.7) |
| `sections/pexels-max-vakhtbovych-7031604.webp` | [7031604](https://www.pexels.com/photo/courtyard-of-modern-villa-with-glass-walls-7031604/) | Max Vakhtbovych | Services — Buy/Sell (§3.7) |
| `sections/pexels-airam-dato-on-31258538.webp` | [31258538](https://www.pexels.com/photo/construction-cranes-against-a-blue-sky-31258538/) | Airam Dato-on | Features — Construction card (§3.8) |
| `sections/pexels-max-vakhtbovych-6265836.webp` | [6265836](https://www.pexels.com/photo/interior-of-kitchen-with-modern-furniture-and-appliances-6265836/) | Max Vakhtbovych | Features — Property card (§3.8) |
| `sections/pexels-pixabay-280239.webp` | [280239](https://www.pexels.com/photo/empty-fabric-sofa-inside-room-280239/) | Pixabay | Features — Mortgage card (§3.8) |
| `sections/pexels-max-vakhtbovych-6585757.webp` | [6585757](https://www.pexels.com/photo/apartment-interior-with-bed-near-windows-with-curtains-6585757/) | Max Vakhtbovych | Latest posts — thumbnail (§3.9) |
| `sections/pexels-artbovich-7031405.webp` | [7031405](https://www.pexels.com/photo/modern-residential-house-facade-in-countryside-7031405/) | Max Vakhtbovych | Spare — snowy villa, alternate hero-cutout candidate not otherwise used in a section |
| `sections/pexels-binyaminmellish-106399.webp` | [106399](https://www.pexels.com/photo/house-lights-turned-on-106399/) | Binyamin Mellish | Spare — dusk suburban home, alternate hero-cutout candidate not otherwise used in a section |

## Videos

| File | Source | Photographer | Size | Intended section |
|---|---|---|---|---|
| `videos/pexels-video-aerial-drone-house-12240430.mp4` | [12240430](https://www.pexels.com/video/houses-in-residential-district-drone-footage-12240430/) | Joerg Schlagheck | 5.2 MB | Why-us — full-width video preview, parallax zoom (§3.2) |
| `videos/pexels-video-modern-architecture-856662.mp4` | [856662](https://www.pexels.com/video/time-lapse-video-of-reflection-of-sky-856662/) | Pixabay | 1.2 MB | Outro — background video, parallax zoom (§3.10) |

Both videos are SD quality and under the 10MB git budget, so neither needed a gitignore
carve-out.

## Curation notes

72 photo candidates were downloaded across 9 queries via `scripts/fetch-assets.mjs` and
visually reviewed against the brief: premium, editorial, airy, clean skies, warm neutral
grading, strong single-subject composition. 14 were kept; 58 were rejected for ornate/gilded
staging, oversaturated color grading, cluttered multi-subject framing, or dated
apartment-block aesthetics that didn't match the reference site's language.

The hero cutout was generated with `rembg` — the default `u2net` model produced a soft halo
on the curved roof edge and a hard rectangular clip through the balcony glass, so it was
regenerated with `isnet-general-use`, which resolved both issues.
