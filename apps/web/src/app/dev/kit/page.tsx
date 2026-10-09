"use client";

import React, { useState } from "react";
import {
  Button,
  IconButton,
  Input,
  Select,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  Tooltip,
  ToastProvider,
  useToast,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@scrappy/ui";

function KitContent() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [btnLoading, setBtnLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetSide, setSheetSide] = useState<"right" | "bottom">("right");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sortDir, setSortDir] = useState<"ascending" | "descending" | "none">("ascending");
  const [inputValue, setInputValue] = useState("Apple MacBook Pro 14");
  const [hasInputError, setHasInputError] = useState(false);
  const { showToast } = useToast();

  const toggleTheme = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("scrappy-theme", newTheme);
  };

  const handleSort = () => {
    setSortDir((prev) => (prev === "ascending" ? "descending" : "ascending"));
  };

  return (
    <div className="min-h-screen bg-[var(--surface-0)] text-[var(--text-1)] p-4 sm:p-8 max-w-7xl mx-auto space-y-12 transition-colors duration-150">
      {/* Top Header & Kit Controls */}
      <header className="border-b border-[var(--border)] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-[var(--text-1)]">
              SCRAPPY Component Kit
            </h1>
            <Badge variant="accent" dot>
              Phase 0 Rebuilt
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-2)] mt-1">
            Complete inventory of 13 accessible UI primitives and design tokens in both themes.
          </p>
        </div>

        {/* Theme and Density Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--radius-md)] p-1">
            <button
              type="button"
              onClick={() => toggleTheme("dark")}
              className={`min-h-[36px] px-3 text-xs font-mono rounded-[var(--radius-sm)] transition-colors ${
                theme === "dark"
                  ? "bg-[var(--surface-3)] text-[var(--text-1)] font-semibold shadow-xs"
                  : "text-[var(--text-2)] hover:text-[var(--text-1)]"
              }`}
            >
              INK (Dark)
            </button>
            <button
              type="button"
              onClick={() => toggleTheme("light")}
              className={`min-h-[36px] px-3 text-xs font-mono rounded-[var(--radius-sm)] transition-colors ${
                theme === "light"
                  ? "bg-[var(--surface-3)] text-[var(--text-1)] font-semibold shadow-xs"
                  : "text-[var(--text-2)] hover:text-[var(--text-1)]"
              }`}
            >
              PAPER (Light)
            </button>
          </div>

          <div className="flex items-center bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--radius-md)] p-1">
            <button
              type="button"
              onClick={() => setDensity("comfortable")}
              className={`min-h-[36px] px-3 text-xs font-mono rounded-[var(--radius-sm)] transition-colors ${
                density === "comfortable"
                  ? "bg-[var(--surface-3)] text-[var(--text-1)] font-semibold shadow-xs"
                  : "text-[var(--text-2)] hover:text-[var(--text-1)]"
              }`}
            >
              Comfortable
            </button>
            <button
              type="button"
              onClick={() => setDensity("compact")}
              className={`min-h-[36px] px-3 text-xs font-mono rounded-[var(--radius-sm)] transition-colors ${
                density === "compact"
                  ? "bg-[var(--surface-3)] text-[var(--text-1)] font-semibold shadow-xs"
                  : "text-[var(--text-2)] hover:text-[var(--text-1)]"
              }`}
            >
              Compact
            </button>
          </div>
        </div>
      </header>

      {/* SECTION 1: Design Tokens */}
      <section aria-labelledby="tokens-heading" className="space-y-6">
        <div>
          <h2 id="tokens-heading" className="text-xl font-semibold tracking-tight text-[var(--text-1)]">
            1. Design Tokens
          </h2>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Calibrated for strict WCAG 2.2 AA contrast compliance. Surfaces, texts, accents, and semantic indicators.
          </p>
        </div>

        {/* Surfaces & Colors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-0)] border border-[var(--border)]">
            <span className="text-[11px] font-mono text-[var(--text-2)]">surface-0</span>
            <p className="text-sm font-semibold mt-1">Canvas</p>
          </div>
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-1)] border border-[var(--border)]">
            <span className="text-[11px] font-mono text-[var(--text-2)]">surface-1</span>
            <p className="text-sm font-semibold mt-1">Container</p>
          </div>
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--border)]">
            <span className="text-[11px] font-mono text-[var(--text-2)]">surface-2</span>
            <p className="text-sm font-semibold mt-1">Elevated</p>
          </div>
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-3)] border border-[var(--border)]">
            <span className="text-[11px] font-mono text-[var(--text-2)]">surface-3</span>
            <p className="text-sm font-semibold mt-1">Card / Panel</p>
          </div>
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--surface-4)] border border-[var(--border)]">
            <span className="text-[11px] font-mono text-[var(--text-2)]">surface-4</span>
            <p className="text-sm font-semibold mt-1">Highlight / Popover</p>
          </div>
        </div>

        {/* Accent and Semantics */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold text-center text-xs">
            Accent (Brand Signal)
          </div>
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-success)] text-[var(--color-success-contrast)] font-semibold text-center text-xs">
            Success (Price ↓)
          </div>
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-danger)] text-[var(--color-danger-contrast)] font-semibold text-center text-xs">
            Danger (Price ↑)
          </div>
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-warn)] text-[var(--color-warn-contrast)] font-semibold text-center text-xs">
            Warning
          </div>
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--color-info)] text-[var(--color-info-contrast)] font-semibold text-center text-xs">
            Info
          </div>
          <div className="p-3.5 rounded-[var(--radius-md)] border border-[var(--border-strong)] text-[var(--text-1)] text-center text-xs font-mono">
            Border Strong
          </div>
        </div>

        {/* Typography Scale */}
        <div className="p-5 border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface-1)] space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)]">Typography Scale</h3>
          <div className="space-y-2">
            <p className="text-3xl font-display text-[var(--text-1)]">
              Display Headline — Bricolage Grotesque (Display Scale)
            </p>
            <p className="text-lg font-semibold text-[var(--text-1)]">
              UI Section Title — Geist Sans Medium (Text LG)
            </p>
            <p className="text-sm text-[var(--text-2)]">
              Body Copy — Balanced readability with 1.5 line height across dark and light palettes.
            </p>
            <p className="text-xl font-mono tabular-nums text-[var(--color-accent)] font-semibold">
              Prices in Geist Mono Tabular: ₹1,49,999.00 <span className="text-xs text-[var(--color-success)]">-18% ↓</span>
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Buttons & IconButtons */}
      <section aria-labelledby="buttons-heading" className="space-y-6">
        <div>
          <h2 id="buttons-heading" className="text-xl font-semibold tracking-tight text-[var(--text-1)]">
            2. Button &amp; IconButton
          </h2>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Variants (Primary, Secondary, Outline, Ghost, Danger), sizes, loading states, and 44px min touch targets.
          </p>
        </div>

        {/* Button Variants */}
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="secondary" disabled>Disabled</Button>
          <Button
            variant="primary"
            isLoading={btnLoading}
            loadingText="Processing..."
            onClick={() => {
              setBtnLoading(true);
              setTimeout(() => setBtnLoading(false), 2000);
            }}
          >
            {btnLoading ? "Processing..." : "Click to Load"}
          </Button>
        </div>

        {/* Button Sizes */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button size="sm" variant="secondary">Small (44px target)</Button>
          <Button size="md" variant="secondary">Medium (44px target)</Button>
          <Button size="lg" variant="primary">Large (48px target)</Button>
        </div>

        {/* IconButtons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <IconButton aria-label="Search items" variant="primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </IconButton>
          <IconButton aria-label="Notifications" variant="secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </IconButton>
          <IconButton aria-label="Settings" variant="outline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </IconButton>
          <IconButton aria-label="Loading action" isLoading variant="secondary">
            <span>X</span>
          </IconButton>
          <IconButton aria-label="Disabled action" disabled variant="outline">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </IconButton>
        </div>
      </section>

      {/* SECTION 3: Input & Select Form Controls */}
      <section aria-labelledby="inputs-heading" className="space-y-6">
        <div>
          <h2 id="inputs-heading" className="text-xl font-semibold tracking-tight text-[var(--text-1)]">
            3. Input &amp; Select
          </h2>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            44px min-height, focus rings, accessible labels, clearable triggers, and linked error states.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            id="demo-search"
            label="Product Search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            clearable
            onClear={() => setInputValue("")}
            helperText="Type any brand, SKU, or model name"
            iconPrefix={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />

          <Input
            id="demo-error"
            label="Barcode (EAN / UPC)"
            defaultValue="ABC-INVALID"
            errorMessage={hasInputError ? "Invalid standard EAN-13 barcode format (must be 13 digits)." : undefined}
            helperText={!hasInputError ? "Toggle error below to test validation state" : undefined}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setHasInputError((prev) => !prev)}
          >
            {hasInputError ? "Clear Input Error" : "Trigger Input Error"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <Select
            id="demo-store-select"
            label="Filter Retailer"
            helperText="Showing stores with active telemetry"
            options={[
              { value: "all", label: "All Stores (Amazon, Flipkart, Croma, Reliance)" },
              { value: "amazon", label: "Amazon India" },
              { value: "flipkart", label: "Flipkart" },
              { value: "croma", label: "Croma Electronics" },
            ]}
          />

          <Select
            id="demo-disabled-select"
            label="Restricted Region"
            disabled
            options={[{ value: "in", label: "India Only (Default Currency ₹)" }]}
          />
        </div>
      </section>

      {/* SECTION 4: Tabs & Badges */}
      <section aria-labelledby="tabs-badges-heading" className="space-y-6">
        <div>
          <h2 id="tabs-badges-heading" className="text-xl font-semibold tracking-tight text-[var(--text-1)]">
            4. Tabs &amp; Badges
          </h2>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Keyboard-accessible tablist with roving tabindex, status dot badges, and mono chips.
          </p>
        </div>

        <Tabs defaultValue="overview">
          <TabList aria-label="Demo tabs">
            <Tab value="overview">Overview</Tab>
            <Tab value="offers">Live Offers (4)</Tab>
            <Tab value="specs">Specifications</Tab>
            <Tab value="history">Price History</Tab>
            <Tab value="disabled" disabled>Unavailable</Tab>
          </TabList>
          <TabPanel value="overview">
            <p className="text-sm text-[var(--text-2)]">
              Overview panel: Showing top deals aggregated from 4 verified retailers with instant deduplication.
            </p>
          </TabPanel>
          <TabPanel value="offers">
            <p className="text-sm text-[var(--text-2)]">
              Offers panel: Lowest verified price is ₹1,49,999 on Flipkart with next-day express delivery.
            </p>
          </TabPanel>
          <TabPanel value="specs">
            <p className="text-sm text-[var(--text-2)]">
              Specifications panel: Apple M3 Pro, 18GB Unified Memory, 512GB SSD Storage, Space Black.
            </p>
          </TabPanel>
          <TabPanel value="history">
            <p className="text-sm text-[var(--text-2)]">
              Price History panel: Tracked for 90 days. All-time low was ₹1,44,999 during Republic Day sale.
            </p>
          </TabPanel>
        </Tabs>

        {/* Badges showcase */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="accent" dot>Lowest Price</Badge>
          <Badge variant="success" dot>Price Drop -12%</Badge>
          <Badge variant="warn" dot>Low Stock</Badge>
          <Badge variant="danger" dot>Out of Stock</Badge>
          <Badge variant="info">Verified Deal</Badge>
          <Badge variant="outline">Sample Data</Badge>
          <Badge variant="accent" size="sm">Small Tag</Badge>
        </div>
      </section>

      {/* SECTION 5: Cards & Overlays (Dialog, Sheet, Tooltip, Toast) */}
      <section aria-labelledby="cards-overlays-heading" className="space-y-6">
        <div>
          <h2 id="cards-overlays-heading" className="text-xl font-semibold tracking-tight text-[var(--text-1)]">
            5. Cards, Dialog, Sheet, Tooltip &amp; Toast
          </h2>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Surface elevation, accessible focus-trapped dialogs, slide-over sheets, and toasts with undo actions.
          </p>
        </div>

        {/* Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Elevation 1 with hairline separator</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-[var(--text-2)]">
                Structured container for static metrics, retailer offer summary, or specifications breakdown.
              </p>
            </CardContent>
            <CardFooter>
              <span className="text-xs font-mono text-[var(--text-3)]">Updated 10m ago</span>
              <Button size="sm" variant="outline">Details</Button>
            </CardFooter>
          </Card>

          <Card variant="interactive">
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>Hover lift and focus-within ring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--text-2)]">Amazon.in</p>
                  <p className="text-lg font-mono font-bold text-[var(--text-1)] mt-1">₹1,54,999</p>
                </div>
                <Badge variant="success" dot>In Stock</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <span className="text-xs text-[var(--color-success)] font-medium">Free Delivery</span>
              <Button size="sm" variant="primary">View Offer</Button>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Overlay Triggers</CardTitle>
              <CardDescription>Test modals, drawers, and toasts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {/* Dialog Trigger */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger>
                    <Button size="sm" variant="secondary">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Price Alert</DialogTitle>
                      <DialogDescription>
                        We will notify you immediately when the price drops below your target threshold.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <Input id="target-price" label="Target Price (₹)" defaultValue="1,45,000" />
                      <Select
                        id="channel-select"
                        label="Notification Channel"
                        options={[
                          { value: "email", label: "Email (Instant)" },
                          { value: "push", label: "In-App Notification" },
                        ]}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose>
                        <Button variant="ghost">Cancel</Button>
                      </DialogClose>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setDialogOpen(false);
                          showToast({
                            type: "success",
                            title: "Price Alert Active",
                            description: "Tracking Apple MacBook Pro for drops below ₹1,45,000.",
                            action: {
                              label: "Undo",
                              onClick: () => {
                                showToast({
                                  type: "info",
                                  title: "Alert Cancelled",
                                  description: "Price alert was successfully removed.",
                                });
                              },
                            },
                          });
                        }}
                      >
                        Confirm Alert
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Sheet Trigger */}
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen} side={sheetSide}>
                  <SheetTrigger>
                    <Button size="sm" variant="outline">Open Sheet ({sheetSide})</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filter Specifications</SheetTitle>
                      <SheetDescription>
                        Narrow results by storage, RAM, screen size, and verified retailer.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 py-4">
                      <Input id="brand-filter" label="Brand" defaultValue="Apple" />
                      <Select
                        id="ram-filter"
                        label="RAM"
                        options={[
                          { value: "16", label: "16GB or Higher" },
                          { value: "32", label: "32GB Unified" },
                        ]}
                      />
                    </div>
                    <SheetFooter>
                      <SheetClose>
                        <Button variant="ghost">Close</Button>
                      </SheetClose>
                      <Button variant="primary" onClick={() => setSheetOpen(false)}>Apply Filters</Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Side toggle for Sheet */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] font-mono text-[var(--text-3)]">Drawer side:</span>
                <button
                  type="button"
                  onClick={() => setSheetSide("right")}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded-[var(--radius-sm)] transition-colors ${
                    sheetSide === "right"
                      ? "bg-[var(--surface-4)] text-[var(--text-1)] font-semibold border border-[var(--border-strong)]"
                      : "text-[var(--text-2)] hover:text-[var(--text-1)]"
                  }`}
                >
                  Right
                </button>
                <button
                  type="button"
                  onClick={() => setSheetSide("bottom")}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded-[var(--radius-sm)] transition-colors ${
                    sheetSide === "bottom"
                      ? "bg-[var(--surface-4)] text-[var(--text-1)] font-semibold border border-[var(--border-strong)]"
                      : "text-[var(--text-2)] hover:text-[var(--text-1)]"
                  }`}
                >
                  Bottom
                </button>
              </div>

              {/* Tooltip Demonstration */}
              <div className="pt-2 flex items-center gap-2">
                <Tooltip content="Verified price from official retailer API" position="top">
                  <span className="text-xs font-mono text-[var(--color-accent)] underline cursor-help">
                    [?] Provenance Tooltip
                  </span>
                </Tooltip>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  showToast({
                    type: "warning",
                    title: "Source Stale",
                    description: "Reliance Digital adapter last checked 42m ago.",
                  })
                }
              >
                Trigger Toast
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* SECTION 6: Data Table & Skeletons */}
      <section aria-labelledby="table-heading" className="space-y-6">
        <div>
          <h2 id="table-heading" className="text-xl font-semibold tracking-tight text-[var(--text-1)]">
            6. Table &amp; Skeleton Primitives
          </h2>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Accessible data grid with sortable headers, right-aligned numeric tabular digits, and loading skeletons.
          </p>
        </div>

        {/* Live Table */}
        <Table density={density} stickyHeader>
          <TableHeader>
            <TableRow>
              <TableHead sortDirection={sortDir} onSort={handleSort}>
                Store &amp; Seller
              </TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Freshness</TableHead>
              <TableHead align="right">Price (INR)</TableHead>
              <TableHead align="right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow isClickable>
              <TableCell dataLabel="Store & Seller">
                <div className="flex items-center gap-2 font-medium">
                  <span>Flipkart</span>
                  <Badge variant="accent" size="sm">Best Price</Badge>
                </div>
              </TableCell>
              <TableCell dataLabel="Condition">Brand New</TableCell>
              <TableCell dataLabel="Delivery">Tomorrow, by 11 AM</TableCell>
              <TableCell dataLabel="Freshness">
                <span className="text-xs text-[var(--text-2)]">Verified 4m ago</span>
              </TableCell>
              <TableCell dataLabel="Price (INR)" align="right" isNumeric>
                ₹1,49,999.00
              </TableCell>
              <TableCell dataLabel="Action" align="right">
                <Button size="sm" variant="primary">Buy</Button>
              </TableCell>
            </TableRow>

            <TableRow isClickable>
              <TableCell dataLabel="Store & Seller">
                <div className="flex items-center gap-2 font-medium">
                  <span>Amazon.in</span>
                  <Badge variant="outline" size="sm">Appario</Badge>
                </div>
              </TableCell>
              <TableCell dataLabel="Condition">Brand New</TableCell>
              <TableCell dataLabel="Delivery">Wednesday, Free</TableCell>
              <TableCell dataLabel="Freshness">
                <span className="text-xs text-[var(--text-2)]">Verified 18m ago</span>
              </TableCell>
              <TableCell dataLabel="Price (INR)" align="right" isNumeric>
                ₹1,54,990.00
              </TableCell>
              <TableCell dataLabel="Action" align="right">
                <Button size="sm" variant="outline">Buy</Button>
              </TableCell>
            </TableRow>

            <TableRow isClickable>
              <TableCell dataLabel="Store & Seller">
                <div className="flex items-center gap-2 font-medium">
                  <span>Croma</span>
                </div>
              </TableCell>
              <TableCell dataLabel="Condition">Brand New</TableCell>
              <TableCell dataLabel="Delivery">Store Pickup Ready</TableCell>
              <TableCell dataLabel="Freshness">
                <span className="text-xs text-[var(--text-2)]">Verified 1h ago</span>
              </TableCell>
              <TableCell dataLabel="Price (INR)" align="right" isNumeric>
                ₹1,59,900.00
              </TableCell>
              <TableCell dataLabel="Action" align="right">
                <Button size="sm" variant="outline">Buy</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Skeleton Placeholders */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-2)]">
            Skeleton Loading States (Reduced-Motion Compliant)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <div className="p-5 border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface-1)] space-y-4">
              <Skeleton height={24} width="50%" />
              <SkeletonText lines={4} />
              <div className="flex items-center gap-3 pt-2">
                <Skeleton height={44} width={120} rounded="md" />
                <Skeleton height={44} width={120} rounded="md" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function DevKitPage() {
  return (
    <ToastProvider>
      <KitContent />
    </ToastProvider>
  );
}
