"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ScrappyLogo,
  ChevronLeftIcon,
  ChevronRightIcon,
  Tooltip,
  ToastProvider,
} from "@scrappy/ui";
import { CommandPalette } from "./CommandPalette";
import { NotificationCenter } from "./NotificationCenter";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { OfflineBanner } from "./OfflineBanner";

interface NavItem {
  label: string;
  href: string;
  shortcut: string;
  icon: (props: { size?: number; className?: string }) => React.JSX.Element;
}

// Compare Icon
function CompareNavIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}

// Watchlist Icon
function WatchlistNavIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// Extract Icon
function ExtractNavIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

// Alerts Icon
function AlertsNavIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// Me / Settings Icon
function MeNavIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// Intelligence Icon
function IntelligenceNavIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { label: "Compare", href: "/compare", shortcut: "g c", icon: CompareNavIcon },
  { label: "Intelligence", href: "/intelligence", shortcut: "g i", icon: IntelligenceNavIcon },
  { label: "Watchlist", href: "/watchlist", shortcut: "g w", icon: WatchlistNavIcon },
  { label: "Extract", href: "/extract", shortcut: "g e", icon: ExtractNavIcon },
  { label: "Alerts", href: "/alerts", shortcut: "g a", icon: AlertsNavIcon },
  { label: "Settings", href: "/settings", shortcut: "g s", icon: MeNavIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(true);
  const lastScrollY = useRef(0);

  // Restore sidebar state & density
  useEffect(() => {
    try {
      const storedSidebar = localStorage.getItem("scrappy-sidebar-collapsed");
      if (storedSidebar !== null) {
        setIsCollapsed(storedSidebar === "true");
      }
      const storedDensity = localStorage.getItem("scrappy-density");
      if (storedDensity === "compact") {
        setIsCompact(true);
        document.documentElement.setAttribute("data-density", "compact");
      }
    } catch {}

    const handleToggleSidebar = () => {
      setIsCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem("scrappy-sidebar-collapsed", String(next));
        } catch {}
        return next;
      });
    };

    const handleDensityChanged = () => {
      const current = document.documentElement.getAttribute("data-density");
      setIsCompact(current === "compact");
    };

    window.addEventListener("scrappy:toggle-sidebar", handleToggleSidebar);
    window.addEventListener("scrappy:density-changed", handleDensityChanged);
    return () => {
      window.removeEventListener("scrappy:toggle-sidebar", handleToggleSidebar);
      window.removeEventListener("scrappy:density-changed", handleDensityChanged);
    };
  }, []);

  // Handle mobile bottom nav hide on scroll-down, show on scroll-up
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (delta > 30 && currentY > 80) {
        // Scrolling down -> hide bottom bar
        setShowMobileNav(false);
      } else if (delta < -15 || currentY <= 40) {
        // Scrolling up -> show bottom bar
        setShowMobileNav(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("scrappy-sidebar-collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const toggleDensity = () => {
    const next = !isCompact;
    setIsCompact(next);
    const densityVal = next ? "compact" : "comfortable";
    document.documentElement.setAttribute("data-density", densityVal);
    try {
      localStorage.setItem("scrappy-density", densityVal);
    } catch {}
    window.dispatchEvent(new Event("scrappy:density-changed"));
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[var(--surface-0)] text-[var(--text-1)] font-sans flex flex-col antialiased">
        {/* Skip Link for WCAG 2.2 AA */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[var(--surface-1)] focus:border-2 focus:border-[var(--border-focus)] focus:text-[var(--text-1)] focus:font-mono focus:text-xs focus:rounded-[var(--radius-sm)] focus:shadow-[var(--elevation-3)]"
        >
          Skip to main content
        </a>

        {/* Global Keyboard Shortcut Handlers & Modal */}
        <KeyboardShortcuts />

        {/* Top Header Bar */}
        <header
          role="banner"
          className="border-b border-[var(--border-default)] px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sticky top-0 z-40 bg-[var(--surface-0)]/95 backdrop-blur-md transition-colors"
        >
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] rounded-[var(--radius-sm)]"
              aria-label="SCRAPPY Homepage"
            >
              <ScrappyLogo state="idle" size={24} variant="combined" />
            </Link>

            {/* Sidebar toggle button (desktop) - only on app routes */}
            {!isLanding && (
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                className="hidden md:flex items-center justify-center min-h-[36px] min-w-[36px] rounded-[var(--radius-sm)] hover:bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors border border-transparent hover:border-[var(--border-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                aria-label={isCollapsed ? "Expand sidebar (Press [)" : "Collapse sidebar (Press [)"}
                title={isCollapsed ? "Expand sidebar ([)" : "Collapse sidebar ([)"}
              >
                {isCollapsed ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
              </button>
            )}

            {/* Landing page nav links */}
            {isLanding && (
              <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 ml-4 text-xs font-mono text-[var(--text-2)]">
                <Link href="/compare" className="inline-flex items-center min-h-[32px] px-2.5 py-1 rounded-[var(--radius-sm)] hover:text-[var(--text-1)] hover:bg-[var(--surface-1)] transition-colors">
                  Compare
                </Link>
                <Link href="/intelligence" className="inline-flex items-center min-h-[32px] px-2.5 py-1 rounded-[var(--radius-sm)] hover:text-[var(--text-1)] hover:bg-[var(--surface-1)] transition-colors">
                  Intelligence
                </Link>
                <Link href="/extract" className="inline-flex items-center min-h-[32px] px-2.5 py-1 rounded-[var(--radius-sm)] hover:text-[var(--text-1)] hover:bg-[var(--surface-1)] transition-colors">
                  Extract
                </Link>
                <Link href="/pricing" className="inline-flex items-center min-h-[32px] px-2.5 py-1 rounded-[var(--radius-sm)] hover:text-[var(--text-1)] hover:bg-[var(--surface-1)] transition-colors">
                  Pricing
                </Link>
                <Link href="/docs" className="inline-flex items-center min-h-[32px] px-2.5 py-1 rounded-[var(--radius-sm)] hover:text-[var(--text-1)] hover:bg-[var(--surface-1)] transition-colors">
                  Docs
                </Link>
              </nav>
            )}

            {/* App views product switcher (Compare | Intelligence | Extract segmented control) */}
            {!isLanding && (
              <div className="hidden lg:flex items-center p-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border-subtle)] font-mono text-xs ml-2">
                <Link
                  href="/compare"
                  className={`px-2.5 py-1 rounded-[4px] transition-colors ${
                    pathname?.startsWith("/compare")
                      ? "bg-[var(--surface-1)] text-[var(--text-1)] font-semibold shadow-[var(--elevation-1)]"
                      : "text-[var(--text-3)] hover:text-[var(--text-1)]"
                  }`}
                >
                  Compare
                </Link>
                <Link
                  href="/intelligence"
                  className={`px-2.5 py-1 rounded-[4px] transition-colors ${
                    pathname?.startsWith("/intelligence")
                      ? "bg-[var(--surface-1)] text-[var(--text-1)] font-semibold shadow-[var(--elevation-1)]"
                      : "text-[var(--text-3)] hover:text-[var(--text-1)]"
                  }`}
                >
                  Intelligence
                </Link>
                <Link
                  href="/extract"
                  className={`px-2.5 py-1 rounded-[4px] transition-colors ${
                    pathname?.startsWith("/extract")
                      ? "bg-[var(--surface-1)] text-[var(--text-1)] font-semibold shadow-[var(--elevation-1)]"
                      : "text-[var(--text-3)] hover:text-[var(--text-1)]"
                  }`}
                >
                  Extract
                </Link>
              </div>
            )}
          </div>

          {/* Center Search / Command Palette Trigger */}
          <div className="hidden sm:block flex-1 max-w-md mx-2 sm:mx-6">
            <CommandPalette />
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Provenance Tag */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--surface-1)] border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--text-2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
              <span>Live, verified 4m ago</span>
            </div>

            {/* Plan / Usage Meter Pill */}
            <Link
              href="/pricing"
              className="hidden lg:flex items-center min-h-[32px] gap-2 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--surface-1)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] font-mono text-[11px] text-[var(--text-2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
              aria-label="Plan usage: Free tier, 12 of 20 watches used"
            >
              <span className="font-semibold text-[var(--text-1)]">Free</span>
              <span className="text-[var(--text-3)]">·</span>
              <span>12/20 watches</span>
            </Link>

            {/* Density Switcher */}
            <Tooltip content={isCompact ? "Switch to comfortable density" : "Switch to compact density"}>
              <button
                type="button"
                onClick={toggleDensity}
                className="hidden sm:flex items-center justify-center min-h-[36px] min-w-[36px] rounded-[var(--radius-sm)] hover:bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors border border-transparent hover:border-[var(--border-subtle)] font-mono text-[11px] px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
                aria-label={`UI Density: ${isCompact ? "Compact" : "Comfortable"}`}
              >
                {isCompact ? "Compact" : "Comfort"}
              </button>
            </Tooltip>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <NotificationCenter />

            {/* Workspace Switcher */}
            <WorkspaceSwitcher />
          </div>
        </header>

        <OfflineBanner />

        {/* Core Layout: Sidebar + Main Stage */}
        <div className="flex-1 flex overflow-hidden">
          {/* Collapsible Sidebar (Desktop) - only rendered on app routes */}
          {!isLanding && (
            <aside
              aria-label="Sidebar Navigation"
              className={`hidden md:flex flex-col border-r border-[var(--border-default)] bg-[var(--surface-1)] transition-all duration-200 shrink-0 ${
                isCollapsed ? "w-16" : "w-60"
              }`}
            >
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                const IconComponent = item.icon;

                const linkContent = (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] ${
                      isActive
                        ? "bg-[var(--surface-2)] text-[var(--color-accent)] font-medium border border-[var(--border-default)]"
                        : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] border border-transparent"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <IconComponent
                      size={20}
                      className={isActive ? "text-[var(--color-accent)]" : "text-[var(--text-3)]"}
                    />
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between text-xs font-mono">
                        <span>{item.label}</span>
                        <kbd className="text-[10px] font-mono text-[var(--text-2)] px-1 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border-subtle)]">
                          {item.shortcut}
                        </kbd>
                      </div>
                    )}
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.href} content={`${item.label} (${item.shortcut})`} position="right">
                      {linkContent}
                    </Tooltip>
                  );
                }

                return <div key={item.href}>{linkContent}</div>;
              })}
            </nav>

            {/* Sidebar Bottom Footer Info */}
            {!isCollapsed && (
              <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--surface-2)]/40 font-mono text-[11px] text-[var(--text-3)] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Daily Quota</span>
                  <span className="text-[var(--text-2)] font-semibold">60%</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--color-accent)] rounded-full w-[60%]" />
                </div>
                <div className="text-[10px] text-[var(--text-3)] pt-1 flex items-center justify-between">
                  <span>Press ? for keys</span>
                  <span>v1.0.0</span>
                </div>
              </div>
            )}
          </aside>
        )}

          {/* Main Content Area */}
          <main
            id="main-content"
            role="main"
            className="flex-1 overflow-y-auto pb-20 md:pb-8 focus:outline-none"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>

        {/* Mobile Bottom Tab Bar with Sliding Active Indicator */}
        <nav
          aria-label="Mobile Navigation"
          className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-1)]/95 backdrop-blur-md border-t border-[var(--border-default)] transition-transform duration-200 px-2 ${
            showMobileNav ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
        >
          <div className="flex items-center justify-around h-14 relative">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center min-h-[44px] min-w-[52px] rounded-[var(--radius-sm)] transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] ${
                    isActive ? "text-[var(--color-accent)]" : "text-[var(--text-3)] hover:text-[var(--text-1)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <IconComponent size={20} />
                  <span className="text-[10px] font-mono mt-0.5 font-medium">
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="absolute -bottom-1 w-6 h-0.5 bg-[var(--color-accent)] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Desktop Global Footer (only on app routes, landing has its own rich footer) */}
        {!isLanding && (
          <footer className="hidden md:block border-t border-[var(--border-default)] px-6 py-6 text-xs text-[var(--text-3)] bg-[var(--surface-0)] font-mono">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ScrappyLogo state="idle" size={16} variant="mark" />
                <span className="text-[var(--text-1)] font-semibold">SCRAPPY</span>
                <span>— The Web Product &amp; Price Graph</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/compare" className="hover:text-[var(--text-1)] transition-colors">Compare</Link>
                <span>·</span>
                <Link href="/watchlist" className="hover:text-[var(--text-1)] transition-colors">Watchlist</Link>
                <span>·</span>
                <Link href="/extract" className="hover:text-[var(--text-1)] transition-colors">Extract</Link>
                <span>·</span>
                <Link href="/dev/kit" className="hover:text-[var(--text-1)] transition-colors">Kit</Link>
                <span>·</span>
                <Link href="/dev/icons" className="hover:text-[var(--text-1)] transition-colors">Icons</Link>
                <span>·</span>
                <Link href="/dev/motion" className="hover:text-[var(--text-1)] transition-colors">Motion</Link>
                <span>·</span>
                <Link href="/legal/terms" className="hover:text-[var(--text-1)] transition-colors">Terms</Link>
              </div>
            </div>
          </footer>
        )}
      </div>
    </ToastProvider>
  );
}
