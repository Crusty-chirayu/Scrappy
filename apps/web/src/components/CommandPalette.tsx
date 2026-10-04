"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  category: "Navigation" | "Catalog" | "Tools" | "Documentation";
  title: string;
  subtitle: string;
  href: string;
}

const COMMANDS: CommandItem[] = [
  // Navigation
  { id: "nav-compare", category: "Navigation", title: "Compare Catalog", subtitle: "Search 500+ verified canonical products", href: "/compare" },
  { id: "nav-intelligence", category: "Navigation", title: "Market Intelligence", subtitle: "Competitor price monitors & repricing engine", href: "/intelligence" },
  { id: "nav-extract", category: "Navigation", title: "Visual Extract Studio", subtitle: "No-code to pro web scraping studio", href: "/extract" },
  { id: "nav-status", category: "Navigation", title: "System Status", subtitle: "Real-time adapter health & circuit breakers", href: "/status" },
  { id: "nav-docs", category: "Navigation", title: "API Documentation", subtitle: "REST endpoints, SDKs, and data models", href: "/docs" },
  // Catalog Items
  { id: "cat-iphone15", category: "Catalog", title: "Apple iPhone 15 (128 GB)", subtitle: "Canonical smartphone · Lowest ₹69,900", href: "/compare/prod-apple-iphone-15-128" },
  { id: "cat-iphone15pro", category: "Catalog", title: "Apple iPhone 15 Pro (128 GB)", subtitle: "Canonical smartphone · Lowest ₹1,27,990", href: "/compare/prod-apple-iphone-15-pro-128" },
  { id: "cat-s24", category: "Catalog", title: "Samsung Galaxy S24 5G (256 GB)", subtitle: "Canonical smartphone · Lowest ₹74,999", href: "/compare/prod-samsung-galaxy-s24-256" },
  { id: "cat-macbook", category: "Catalog", title: "Apple MacBook Air M3 (16GB, 512GB)", subtitle: "Canonical laptop · Lowest ₹1,34,900", href: "/compare/prod-apple-macbook-air-m3-16-512" },
  { id: "cat-sony-xm5", category: "Catalog", title: "Sony WH-1000XM5 Headphones", subtitle: "Canonical audio · Lowest ₹29,990", href: "/compare/prod-sony-wh-1000xm5" },
  // Tools
  { id: "tool-audit", category: "Tools", title: "Responsible Scraping Legal Policy", subtitle: "Ethical web scraping compliance principles", href: "/legal/responsible-scraping" },
  { id: "tool-terms", category: "Tools", title: "Terms of Service", subtitle: "Acceptable use and tenancy agreements", href: "/legal/terms" },
  { id: "tool-privacy", category: "Tools", title: "Privacy Policy", subtitle: "Data protection and telemetry policies", href: "/legal/privacy" },
];

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      setQuery("");
    }
  }, [isOpen]);

  const filteredCommands = COMMANDS.filter((cmd) => {
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
    router.push(cmd.href);
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
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
      {/* Trigger Button in Header */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-[#141922] border border-[#262E3C] hover:border-[#5B677C] text-xs font-mono text-[#98A2B3] transition-colors"
        aria-label="Open command palette"
      >
        <svg className="w-3.5 h-3.5 text-[#5B677C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <span className="hidden sm:inline">Search or command...</span>
        <kbd className="px-1.5 py-0.5 rounded bg-[#0A0C0F] border border-[#262E3C] text-[10px] text-[#5B677C]">
          ⌘K
        </kbd>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[#0F1217] border border-[#262E3C] rounded-lg shadow-2xl overflow-hidden font-mono"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleListKeyDown}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#262E3C] bg-[#141922]">
              <svg className="w-4 h-4 text-[#C6F135]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a product, tool, or page..."
                className="w-full bg-transparent text-sm text-[#D6DBE3] outline-none placeholder-[#5B677C]"
              />
              <span className="text-[11px] text-[#5B677C]">ESC to close</span>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#5B677C]">
                  No matching commands or products found.
                </div>
              ) : (
                filteredCommands.map((cmd, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-3 py-2 rounded flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-[#1A202B] text-white border border-[#3B465A]"
                          : "text-[#98A2B3] hover:bg-[#141922] hover:text-[#D6DBE3] border border-transparent"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{cmd.title}</div>
                        <div className="text-[11px] text-[#5B677C]">{cmd.subtitle}</div>
                      </div>
                      <span className="text-[10px] text-[#5B677C] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#0A0C0F] border border-[#262E3C]">
                        {cmd.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Navigation Hints */}
            <div className="px-4 py-2 bg-[#0A0C0F] border-t border-[#262E3C] text-[10px] text-[#5B677C] flex items-center justify-between">
              <span>Use <kbd className="text-[#98A2B3]">↑</kbd> <kbd className="text-[#98A2B3]">↓</kbd> to navigate</span>
              <span><kbd className="text-[#98A2B3]">Enter</kbd> to select</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
