"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, ChevronRightIcon } from "@scrappy/ui";

export interface CommandItem {
  id: string;
  category: "Navigation" | "Actions" | "Products";
  title: string;
  subtitle: string;
  href?: string;
  action?: () => void;
  shortcut?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const toggleTheme = useCallback(() => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("scrappy-theme", next);
    window.dispatchEvent(new Event("scrappy:theme-changed"));
  }, []);

  const toggleDensity = useCallback(() => {
    const current = document.documentElement.getAttribute("data-density") || "comfortable";
    const next = current === "comfortable" ? "compact" : "comfortable";
    document.documentElement.setAttribute("data-density", next);
    localStorage.setItem("scrappy-density", next);
    window.dispatchEvent(new Event("scrappy:density-changed"));
  }, []);

  const toggleSidebar = useCallback(() => {
    window.dispatchEvent(new CustomEvent("scrappy:toggle-sidebar"));
  }, []);

  const openShortcuts = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }));
  }, []);

  const commands: CommandItem[] = [
    // Navigation
    { id: "nav-compare", category: "Navigation", title: "Compare Catalog", subtitle: "Search and compare prices across 500+ verified items", href: "/compare", shortcut: "g c" },
    { id: "nav-watchlist", category: "Navigation", title: "Watchlist & Alerts", subtitle: "Tracked products, drop triggers, and history graphs", href: "/watchlist", shortcut: "g w" },
    { id: "nav-extract", category: "Navigation", title: "Visual Extract Studio", subtitle: "Three-step scraper: URL check, point & capture, verify", href: "/extract", shortcut: "g e" },
    { id: "nav-alerts", category: "Navigation", title: "Alerts & Notifications", subtitle: "Rule builder, webhook triggers, and active channels", href: "/alerts", shortcut: "g a" },
    { id: "nav-settings", category: "Navigation", title: "Settings & Workspaces", subtitle: "Tenancy, API keys, notification preferences", href: "/settings", shortcut: "g s" },
    { id: "nav-status", category: "Navigation", title: "System Status", subtitle: "Live source adapter health scores and circuit breakers", href: "/status" },
    { id: "nav-docs", category: "Navigation", title: "API Documentation", subtitle: "REST endpoints, HMAC webhook signatures, schemas", href: "/docs" },
    { id: "nav-kit", category: "Navigation", title: "UI Primitives Kit", subtitle: "Explore Phase 0 design tokens and 13 UI primitives", href: "/dev/kit" },
    { id: "nav-icons", category: "Navigation", title: "Icon Set & Micro-interactions", subtitle: "42 bespoke 24px/1.5-stroke icons and animations", href: "/dev/icons" },
    { id: "nav-motion", category: "Navigation", title: "Motion & Scroll Studio", subtitle: "NumberTick odometer, hold-to-confirm, ambient mesh", href: "/dev/motion" },
    
    // Quick Actions
    { id: "act-theme", category: "Actions", title: "Toggle Theme", subtitle: "Switch between Ink (Dark) and Paper (Light) themes", action: toggleTheme, shortcut: "t" },
    { id: "act-density", category: "Actions", title: "Toggle UI Density", subtitle: "Switch between Comfortable and Compact data display", action: toggleDensity },
    { id: "act-sidebar", category: "Actions", title: "Toggle Sidebar", subtitle: "Collapse to icons-only or expand with navigation labels", action: toggleSidebar, shortcut: "[" },
    { id: "act-shortcuts", category: "Actions", title: "Keyboard Shortcuts Sheet", subtitle: "View all global keyboard shortcuts and sequence chords", action: openShortcuts, shortcut: "?" },

    // Catalog Products (Labeled sample preview)
    { id: "cat-iphone16", category: "Products", title: "Apple iPhone 16 Pro 128GB", subtitle: "Lowest ₹1,19,900 · 3 stores compared", href: "/compare/prod-apple-iphone-16-pro" },
    { id: "cat-macbook-m3", category: "Products", title: "Apple MacBook Air M3 (16GB, 512GB)", subtitle: "Lowest ₹1,34,900 · 4 stores compared", href: "/compare/prod-macbook-air-m3" },
    { id: "cat-sony-xm5", category: "Products", title: "Sony WH-1000XM5 Noise-Canceling", subtitle: "Lowest ₹28,990 · 4 stores compared", href: "/compare/prod-sony-wh-1000xm5" },
    { id: "cat-s24", category: "Products", title: "Samsung Galaxy S24 Ultra 256GB", subtitle: "Lowest ₹1,09,999 · 2 stores compared", href: "/compare/prod-samsung-galaxy-s24" },
  ];

  // Global keydown listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scrappy:open-command-palette", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scrappy:open-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  // Focus trap, scroll lock, and initial focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement | null;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      setTimeout(() => inputRef.current?.focus(), 40);
      setSelectedIndex(0);
      setQuery("");
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.subtitle.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (cmd: CommandItem) => {
    setIsOpen(false);
    if (cmd.action) {
      cmd.action();
    } else if (cmd.href) {
      router.push(cmd.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredCommands[selectedIndex]!);
    }
  };

  return (
    <>
      {/* Trigger Button in Shell */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-1)] border border-[var(--border-default)] hover:border-[var(--border-strong)] text-xs font-mono text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]"
        aria-label="Open command palette (Press ⌘K or /)"
      >
        <SearchIcon size={16} className="text-[var(--text-3)]" />
        <span className="hidden md:inline">Search or command...</span>
        <kbd className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-2)]">
          ⌘K
        </kbd>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[var(--surface-overlay)] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[var(--surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--elevation-3)] overflow-hidden font-sans"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--surface-2)]">
              <SearchIcon size={20} className="text-[var(--color-accent)] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a product, tool, or action..."
                className="w-full bg-transparent text-sm text-[var(--text-1)] outline-none placeholder-[var(--text-3)] font-mono"
              />
              <span className="text-[11px] font-mono text-[var(--text-3)] shrink-0">
                ESC to close
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-[var(--text-3)]">
                  No matching commands or products found.
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={() => handleSelect(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] flex items-center justify-between transition-colors min-h-[44px] ${
                        isSelected
                          ? "bg-[var(--surface-3)] text-[var(--text-1)] border border-[var(--border-strong)]"
                          : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text-1)] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRightIcon
                          size={16}
                          className={`shrink-0 transition-transform ${
                            isSelected ? "text-[var(--color-accent)] translate-x-0.5" : "text-[var(--text-3)]"
                          }`}
                        />
                        <div>
                          <div className="text-xs font-medium text-[var(--text-1)]">
                            {cmd.title}
                          </div>
                          <div className="text-[11px] font-mono text-[var(--text-3)]">
                            {cmd.subtitle}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {cmd.shortcut && (
                          <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-3)]">
                            {cmd.shortcut}
                          </kbd>
                        )}
                        <span className="text-[10px] font-mono text-[var(--text-3)] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border-subtle)]">
                          {cmd.category}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="px-4 py-2.5 bg-[var(--surface-0)] border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-3)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="text-[var(--text-2)]">↑</kbd> <kbd className="text-[var(--text-2)]">↓</kbd> Navigate
                </span>
                <span>
                  <kbd className="text-[var(--text-2)]">Enter</kbd> Select
                </span>
              </div>
              <span>Press <kbd className="text-[var(--text-2)]">?</kbd> for all shortcuts</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
