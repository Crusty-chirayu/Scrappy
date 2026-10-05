"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, Button } from "@scrappy/ui";

export interface ShortcutGroup {
  category: string;
  items: {
    keys: string[];
    description: string;
  }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    category: "Navigation",
    items: [
      { keys: ["g", "c"], description: "Go to Compare" },
      { keys: ["g", "w"], description: "Go to Watchlist" },
      { keys: ["g", "e"], description: "Go to Extract Studio" },
      { keys: ["g", "a"], description: "Go to Alerts" },
      { keys: ["g", "s"], description: "Go to Settings" },
    ],
  },
  {
    category: "General",
    items: [
      { keys: ["⌘ / Ctrl", "K"], description: "Open Command Palette" },
      { keys: ["/"], description: "Focus search or open command palette" },
      { keys: ["?"], description: "Open Keyboard Shortcuts" },
      { keys: ["["], description: "Toggle sidebar collapse" },
      { keys: ["t"], description: "Toggle theme (Dark / Light)" },
      { keys: ["Esc"], description: "Close modal / popover" },
    ],
  },
  {
    category: "Product & Compare Actions",
    items: [
      { keys: ["w"], description: "Watch current product (Product page)" },
      { keys: ["c"], description: "Add to side-by-side comparison" },
    ],
  },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [gPending, setGPending] = useState(false);

  const toggleTheme = useCallback(() => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("scrappy-theme", next);
    window.dispatchEvent(new Event("scrappy:theme-changed"));
  }, []);

  const toggleSidebar = useCallback(() => {
    window.dispatchEvent(new CustomEvent("scrappy:toggle-sidebar"));
  }, []);

  useEffect(() => {
    let chordTimer: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside an input, textarea, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check for '?' key to open shortcut modal
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // '/' key to focus search / open palette
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("scrappy:open-command-palette"));
        return;
      }

      // '[' key to toggle sidebar
      if (e.key === "[" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // 't' key to toggle theme
      if (e.key.toLowerCase() === "t" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // 'w' key to watch current product (if on product route)
      if (e.key.toLowerCase() === "w" && !e.metaKey && !e.ctrlKey && pathname?.startsWith("/compare/")) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("scrappy:watch-current-product"));
        return;
      }

      // 'g' key chord navigation
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey) {
        setGPending(true);
        if (chordTimer) clearTimeout(chordTimer);
        chordTimer = setTimeout(() => setGPending(false), 1200);
        return;
      }

      if (gPending) {
        setGPending(false);
        if (chordTimer) clearTimeout(chordTimer);

        switch (e.key.toLowerCase()) {
          case "c":
            e.preventDefault();
            router.push("/compare");
            break;
          case "w":
            e.preventDefault();
            router.push("/watchlist");
            break;
          case "e":
            e.preventDefault();
            router.push("/extract");
            break;
          case "a":
            e.preventDefault();
            router.push("/alerts");
            break;
          case "s":
            e.preventDefault();
            router.push("/settings");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (chordTimer) clearTimeout(chordTimer);
    };
  }, [gPending, pathname, router, toggleSidebar, toggleTheme]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <span className="font-mono text-xs text-[var(--text-3)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
              Press ? to toggle
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2 font-mono text-xs">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category} className="space-y-2">
              <h4 className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider">
                {group.category}
              </h4>
              <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] bg-[var(--surface-1)]">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 text-[var(--text-1)]"
                  >
                    <span>{item.description}</span>
                    <div className="flex items-center gap-1.5">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 rounded bg-[var(--surface-2)] border border-[var(--border-default)] text-[10px] text-[var(--text-2)] font-semibold shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-mono text-[var(--text-3)]">
              Esc to dismiss
            </span>
            <Button variant="secondary" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
