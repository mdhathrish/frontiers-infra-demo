"use client";
/**
 * /motion-test — one demo block per motion preset, placeholder content only.
 * Generous spacer between blocks so each trigger can be observed cleanly.
 */
import {
  useReveal,
  compose,
  wordMask,
  clipWipe,
  fadeUp,
  lineWipe,
  lineWipeTrigger,
  parallax,
  parallaxTrigger,
  counter,
} from "@/lib/motion";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-10 font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
      {children}
    </p>
  );
}

function Spacer() {
  return <div aria-hidden className="h-[70vh]" />;
}

function WordMaskDemo() {
  const ref = useReveal<HTMLElement>((el) =>
    wordMask(el.querySelector("h2")!)
  );
  return (
    <section ref={ref} className="px-8">
      <Label>
        wordMask — double SplitText, y 115% → 0, 2s power4.out, once
      </Label>
      <h2 className="invisible max-w-4xl text-6xl font-semibold leading-tight">
        Find what moves you forward every single day
      </h2>
    </section>
  );
}

function ClipWipeDemo() {
  const ref = useReveal<HTMLElement>((el) =>
    compose(
      clipWipe(el.querySelectorAll("[data-clip]")),
      clipWipe(el.querySelector("[data-clip-right]")!, { from: "right" })
    )
  );
  return (
    <section ref={ref} className="px-8">
      <Label>
        clipWipe — inset(0 100% 0 0) → 0, 2s power3.out, stagger amount .15;
        last box is the from-right variant
      </Label>
      <div className="grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
        <div data-clip className="invisible h-48 rounded bg-emerald-600" />
        <div data-clip className="invisible h-48 rounded bg-emerald-700" />
        <div data-clip className="invisible h-48 rounded bg-emerald-800" />
        <div data-clip-right className="invisible h-48 rounded bg-neutral-800" />
      </div>
    </section>
  );
}

function FadeUpDemo() {
  const ref = useReveal<HTMLElement>((el) =>
    fadeUp(el.querySelectorAll("[data-fade]"))
  );
  return (
    <section ref={ref} className="px-8">
      <Label>
        fadeUp — y 70 → 0 over 2s expo.out, opacity in over just 0.1s,
        stagger 0.1, once
      </Label>
      <div className="flex max-w-4xl flex-col gap-4">
        {["01 — First item", "02 — Second item", "03 — Third item"].map(
          (text) => (
            <div
              key={text}
              data-fade
              className="rounded border border-neutral-200 bg-neutral-50 p-8 text-xl font-medium"
            >
              {text}
            </div>
          )
        )}
      </div>
    </section>
  );
}

function LineWipeDemo() {
  const ref = useReveal<HTMLElement>(
    (el) =>
      lineWipe(el.querySelector("p[data-lines]")!, {
        color: "rgba(241,241,241,0.8)",
      }),
    lineWipeTrigger
  );
  return (
    <section ref={ref} className="bg-[#f1f1f1] px-8 py-24">
      <Label>
        lineWipe — per-line overlay (section bg color) scaling X → 0 from the
        right, 2s power3.out, trigger top bottom-=200px → center center, once
      </Label>
      <p data-lines className="max-w-2xl text-3xl font-medium leading-snug">
        This paragraph is split into lines. Each line sits dimmed beneath a
        tinted overlay that matches the section background, and the overlays
        wipe away left to right so the text appears to highlight itself as it
        enters the viewport.
      </p>
    </section>
  );
}

function ParallaxDemo() {
  const ref = useReveal<HTMLElement>(
    (el) =>
      parallax(el.querySelector("[data-parallax]")!, {
        fromY: "15%",
        toY: "-15%",
      }),
    parallaxTrigger
  );
  return (
    <section ref={ref} className="px-8">
      <Label>
        parallax — y 15% → -15%, ease none, scrub 1.5, top bottom → bottom top
      </Label>
      <div className="mx-auto h-[70vh] max-w-4xl overflow-hidden rounded bg-neutral-100">
        <div
          data-parallax
          className="mx-auto mt-[10vh] h-[50vh] max-w-xl rounded bg-gradient-to-b from-sky-500 to-indigo-700"
        />
      </div>
    </section>
  );
}

function CounterDemo() {
  const ref = useReveal<HTMLElement>((el) =>
    compose(
      counter(el.querySelector("[data-counter-big]")!, { to: 12480.5 }),
      counter(el.querySelector("[data-counter-small]")!, { to: 42 })
    )
  );
  return (
    <section ref={ref} className="px-8">
      <Label>
        counter — 1.5s count-up, expo.out (power2.inOut when ≤2 digits),
        locale-formatted, decimals preserved
      </Label>
      <div className="flex max-w-4xl gap-16">
        <div>
          <div data-counter-big className="text-7xl font-semibold tabular-nums">
            0
          </div>
          <p className="mt-2 text-sm text-neutral-500">to: 12480.5</p>
        </div>
        <div>
          <div
            data-counter-small
            className="text-7xl font-semibold tabular-nums"
          >
            0
          </div>
          <p className="mt-2 text-sm text-neutral-500">to: 42 (≤2 digits)</p>
        </div>
      </div>
    </section>
  );
}

export default function MotionTestPage() {
  return (
    <main className="bg-white pb-[50vh] text-neutral-900">
      <header className="flex h-screen flex-col justify-center px-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-400">
          src/lib/motion — preset test page
        </p>
        <h1 className="mt-4 text-5xl font-semibold">
          Scroll to step through each preset.
        </h1>
        <p className="mt-4 max-w-xl text-neutral-500">
          Everything triggers once by default; parallax is the only scrubbed
          block. With prefers-reduced-motion set, every block renders
          instantly and Lenis is disabled.
        </p>
      </header>

      <WordMaskDemo />
      <Spacer />
      <ClipWipeDemo />
      <Spacer />
      <FadeUpDemo />
      <Spacer />
      <LineWipeDemo />
      <Spacer />
      <ParallaxDemo />
      <Spacer />
      <CounterDemo />
    </main>
  );
}
