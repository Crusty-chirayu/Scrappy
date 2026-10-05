"use client";

import React, { useState, useEffect } from "react";
import { Button, BellIcon, CheckIcon } from "@scrappy/ui";

interface StickyMiniHeaderProps {
  productTitle: string;
  category: string;
  lowestPricePaise: number;
  isWatching: boolean;
  onOpenWatchModal: () => void;
}

export function StickyMiniHeader({
  productTitle,
  category,
  lowestPricePaise,
  isWatching,
  onOpenWatchModal,
}: StickyMiniHeaderProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger sticky mini-header once user scrolls past top hero (340px)
      const scrolled = window.scrollY > 340;
      setIsVisible(scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Product quick action summary"
      className="fixed top-0 left-0 right-0 z-20 bg-[var(--surface-0)]/95 backdrop-blur-md border-b border-[var(--border-default)] shadow-[var(--elevation-2)] transition-transform duration-200 animate-in slide-in-from-top-2"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Thumbnail & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 text-xs font-mono font-bold text-[var(--color-accent)]">
            {category.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold text-[var(--text-1)] truncate font-sans">
              {productTitle}
            </h2>
            <div className="text-[11px] font-mono text-[var(--text-3)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
              <span>Verified Store Offers</span>
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-mono text-[var(--text-3)] uppercase block leading-none">
              Best Price
            </span>
            <span className="text-sm sm:text-base font-bold font-mono text-[var(--color-success)] tabular-nums">
              ₹{Math.round(lowestPricePaise / 100).toLocaleString("en-IN")}
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            variant={isWatching ? "secondary" : "primary"}
            onClick={onOpenWatchModal}
            className="min-h-[44px] min-w-[44px] px-3.5 py-1.5 font-mono text-xs flex items-center gap-1.5"
          >
            {isWatching ? (
              <>
                <CheckIcon size={16} className="text-[var(--color-success)]" />
                <span>Watching</span>
              </>
            ) : (
              <>
                <BellIcon size={16} />
                <span>Watch</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
