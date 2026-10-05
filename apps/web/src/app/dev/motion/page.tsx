"use client";

import React, { useState } from "react";
import {
  NumberTick,
  HoldToConfirmButton,
  Accordion,
  AmbientMesh,
  ScrollProgressBar,
  StaggerList,
  startSafeViewTransition,
  ScrappyLogo,
  Badge,
  Card,
  Button,
} from "@scrappy/ui";

export default function MotionVerificationPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [currentPrice, setCurrentPrice] = useState(48999);
  const [prevPrice, setPrevPrice] = useState<number | undefined>(undefined);
  const [staggerKey, setStaggerKey] = useState(0);
  const [deletedCount, setDeletedCount] = useState(0);
  const [showAmbient, setShowAmbient] = useState(true);

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("no-ambient")) {
      setShowAmbient(false);
    }
  }, []);

  const toggleTheme = () => {
    startSafeViewTransition(() => {
      const next = theme === "dark" ? "light" : "dark";
      setTheme(next);
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("scrappy-theme", next);
    });
  };

  const simulatePriceDrop = () => {
    setPrevPrice(currentPrice);
    setCurrentPrice((p) => Math.max(1000, p - 3500));
  };

  const simulatePriceRise = () => {
    setPrevPrice(currentPrice);
    setCurrentPrice((p) => p + 2200);
  };

  const resetPrice = () => {
    setPrevPrice(currentPrice);
    setCurrentPrice(48999);
  };

  const accordionItems = [
    {
      id: "motion-1",
      title: "Why does Scrappy use CSS Grid for accordions instead of maxHeight?",
      content:
        "Animating maxHeight causes layout thrash, forces continuous style recalculations, and feels jittery when content height doesn't match the hardcoded ceiling. The CSS grid-template-rows (0fr -> 1fr) technique transitions intrinsic height natively at 60fps with zero layout shift.",
    },
    {
      id: "motion-2",
      title: "What are the hard performance bounds on ambient loops?",
      content:
        "Every ambient loop is strictly constrained to transform and opacity on GPU layers. It automatically disconnects via IntersectionObserver when offscreen and halts completely when document.hidden is true. Total Lighthouse CPU penalty is under 2%.",
    },
    {
      id: "motion-3",
      title: "How does the View Transitions API degrade for unsupported browsers?",
      content:
        "Browsers without document.startViewTransition support execute state mutations directly without blocking. Additionally, users with prefers-reduced-motion: reduce bypass transition pseudo-elements to maintain instantaneous response.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[var(--surface-0)] text-[var(--text-1)] font-sans antialiased selection:bg-[var(--color-accent-soft)]">
      {/* Top thin accent scroll progress bar */}
      <ScrollProgressBar heightPx={3} />

      {/* Living Ambient Drift Mesh */}
      {showAmbient && <AmbientMesh />}

      {/* Sticky Header with 8px blur transition */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--surface-0)]/80 border-b border-[var(--border-subtle)] transition-all px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScrappyLogo size={24} variant="mark" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold tracking-wider text-[var(--text-1)]">
                  SCRAPPY
                </span>
                <span className="text-xs text-[var(--text-3)] font-mono">/dev/motion</span>
                <Badge variant="outline" size="sm">SLICE B VERIFICATION</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-xs font-mono text-[var(--text-2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme (with View Transition)`}
            >
              <span>{theme === "dark" ? "🌙 Dark" : "☀️ Light"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-12">
        {/* Intro Banner */}
        <div className="space-y-3">
          <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text-1)] font-medium tracking-tight">
            Motion, Physics &amp; Scroll Systems
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-[var(--text-2)] leading-relaxed">
            Every transition in Scrappy is physically grounded and causality-driven. Motion explains
            state transitions rather than decorating them, with strict 600ms ceilings, GPU-composited
            layers, and immediate reduced-motion overrides.
          </p>
        </div>

        {/* Section 1: NumberTick Odometer */}
        <section aria-labelledby="section-odometer" className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <div>
              <h2 id="section-odometer" className="text-lg font-semibold text-[var(--text-1)]">
                1. Odometer Price Ticks &amp; 600ms Directional Flash
              </h2>
              <p className="text-xs text-[var(--text-3)]">
                Odometer roll on price change with 600ms fading green/red flash and directional delta arrow.
              </p>
            </div>
            <Badge variant="outline" size="sm">Tabular Mono</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 md:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--border-subtle)]">
                <div>
                  <div className="text-xs font-mono text-[var(--text-3)] uppercase tracking-wider">
                    Sony WH-1000XM5 Noise-Canceling Headphones
                  </div>
                  <div className="text-sm text-[var(--text-2)] mt-0.5">
                    Source: Croma • Verified 2m ago (Sample data)
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-[var(--text-3)] font-mono">Current Observed Price</div>
                  <div className="text-3xl font-bold">
                    <NumberTick
                      value={currentPrice}
                      previousValue={prevPrice}
                      currency="₹"
                      className="text-3xl font-mono text-[var(--text-1)]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" size="sm" onClick={simulatePriceDrop}>
                  Simulate Price Drop (-₹3,500)
                </Button>
                <Button variant="secondary" size="sm" onClick={simulatePriceRise}>
                  Simulate Price Hike (+₹2,200)
                </Button>
                <Button variant="ghost" size="sm" onClick={resetPrice}>
                  Reset to ₹48,999
                </Button>
              </div>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-1)]">Choreography Rules</h3>
              <ul className="text-xs text-[var(--text-2)] space-y-2 list-disc list-inside">
                <li><strong className="text-[var(--text-1)]">Green flash:</strong> Triggered strictly when new price &lt; prior price.</li>
                <li><strong className="text-[var(--text-1)]">Red flash:</strong> Triggered strictly when new price &gt; prior price.</li>
                <li><strong className="text-[var(--text-1)]">600ms fade:</strong> Color flash settles to transparent smoothly.</li>
                <li><strong className="text-[var(--text-1)]">Lakh grouping:</strong> Full <code className="font-mono">en-IN</code> rupee formatting.</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Section 2: Hold-to-Confirm Safety */}
        <section aria-labelledby="section-hold" className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <div>
              <h2 id="section-hold" className="text-lg font-semibold text-[var(--text-1)]">
                2. Destructive Action Safety: Hold to Confirm
              </h2>
              <p className="text-xs text-[var(--text-3)]">
                Irreversible destructive actions use a 600ms continuous progress fill before confirming.
              </p>
            </div>
            <Badge variant="outline" size="sm">600ms Kinetic Fill</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 md:col-span-2 space-y-4">
              <p className="text-sm text-[var(--text-2)]">
                Press and hold either via pointer down or keyboard (<kbd className="font-mono px-1 py-0.5 bg-[var(--surface-3)] rounded border border-[var(--border-default)]">Space</kbd> / <kbd className="font-mono px-1 py-0.5 bg-[var(--surface-3)] rounded border border-[var(--border-default)]">Enter</kbd>).
                Releasing prior to 600ms aborts execution instantly with zero state change.
              </p>

              <div className="flex items-center gap-4 pt-2">
                <HoldToConfirmButton
                  label="Hold to Delete Watch Rule"
                  confirmLabel="Rule Deleted"
                  holdDurationMs={600}
                  onConfirm={() => setDeletedCount((c) => c + 1)}
                />

                <span className="text-xs font-mono text-[var(--text-3)]">
                  Deletions confirmed: <strong className="text-[var(--text-1)]">{deletedCount}</strong>
                </span>
              </div>
            </Card>

            <Card className="p-6 space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-1)]">Accessibility &amp; Safety</h3>
              <ul className="text-xs text-[var(--text-2)] space-y-2 list-disc list-inside">
                <li>Non-blocking: Aborts on pointer leave, mouse up, or key release.</li>
                <li>Clear ARIA instructions stating the 600ms duration.</li>
                <li>Dynamic check icon feedback on completion.</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Section 3: Staggered Entrance */}
        <section aria-labelledby="section-stagger" className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <div>
              <h2 id="section-stagger" className="text-lg font-semibold text-[var(--text-1)]">
                3. List Stagger Choreography (40ms Steps, Max 8 Items)
              </h2>
              <p className="text-xs text-[var(--text-3)]">
                Related items enter from direction of cause with 40ms offset, capped at 8 items to prevent fatigue.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setStaggerKey((k) => k + 1)}>
              Replay Entrance
            </Button>
          </div>

          <StaggerList key={staggerKey} stepMs={40} maxItems={8} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { store: "Amazon.in", price: "₹48,999", stock: "In Stock", delta: "-₹2,000" },
              { store: "Flipkart", price: "₹49,499", stock: "In Stock", delta: "-₹1,500" },
              { store: "Croma", price: "₹48,990", stock: "Best Price", delta: "-₹2,010" },
              { store: "Reliance Digital", price: "₹50,990", stock: "In Stock", delta: "0" },
              { store: "Tata CLiQ", price: "₹51,490", stock: "Low Stock", delta: "+₹500" },
              { store: "Vijay Sales", price: "₹49,990", stock: "In Stock", delta: "-₹1,010" },
              { store: "Poorvika", price: "₹52,000", stock: "In Stock", delta: "+₹1,000" },
              { store: "Sangeetha", price: "₹52,490", stock: "In Stock", delta: "+₹1,490" },
            ].map((offer, idx) => (
              <div
                key={idx}
                className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border-default)] space-y-2 hover:border-[var(--color-accent)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-1)]">{offer.store}</span>
                  <Badge variant={idx === 2 ? "accent" : "outline"} size="sm">{offer.stock}</Badge>
                </div>
                <div className="text-lg font-mono font-bold text-[var(--text-1)]">{offer.price}</div>
                <div className="text-xs font-mono text-[var(--text-3)]">Delta vs avg: {offer.delta}</div>
              </div>
            ))}
          </StaggerList>
        </section>

        {/* Section 4: Accordion Grid-Rows Physics */}
        <section aria-labelledby="section-accordion" className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <div>
              <h2 id="section-accordion" className="text-lg font-semibold text-[var(--text-1)]">
                4. Smooth Accordion Expand (CSS Grid Rows 0fr &rarr; 1fr)
              </h2>
              <p className="text-xs text-[var(--text-3)]">
                Animates intrinsic dimensions with zero layout thrash and complete keyboard arrow navigation.
              </p>
            </div>
            <Badge variant="outline" size="sm">Zero Layout Shift</Badge>
          </div>

          <Accordion items={accordionItems} defaultExpandedIds={["motion-1"]} />
        </section>

        {/* Section 5: Long Scroll Demo for Scroll Timeline & Header Blur */}
        <section aria-labelledby="section-scroll" className="space-y-4 pt-6">
          <div className="border-b border-[var(--border-subtle)] pb-2">
            <h2 id="section-scroll" className="text-lg font-semibold text-[var(--text-1)]">
              5. Scroll Timeline &amp; Header Blur Verification Area
            </h2>
            <p className="text-xs text-[var(--text-3)]">
              Scroll down to observe the top 3px accent scrollbar fill and header background glass blur.
            </p>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4].map((block) => (
              <Card key={block} className="p-6 space-y-2">
                <div className="text-xs font-mono text-[var(--color-accent)]">SCROLL MILESTONE 0{block}</div>
                <h3 className="text-base font-semibold text-[var(--text-1)]">
                  Continuous Scroll Timeline Benchmark Step {block}
                </h3>
                <p className="text-sm text-[var(--text-2)] leading-relaxed">
                  Scrappy utilizes CSS <code className="font-mono">animation-timeline: scroll()</code> where available,
                  decoupling scroll-linked animation work from the main JavaScript thread. In browsers without native
                  timeline support, a passive scroll listener coordinates the transform progress.
                </p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[var(--border-subtle)] py-8 px-4 sm:px-8 bg-[var(--surface-1)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-3)]">
          <div>Scrappy Design Engineering • Slice B Motion &amp; Scroll Verification</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-price-down)] animate-[live-pulse_2s_infinite]" />
            <span>GPU Composited &bull; Prefers-Reduced-Motion Safe</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
