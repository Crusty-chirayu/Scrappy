"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ProductDetail } from "@scrappy/db";
import { Button, useToast, BellIcon, CheckIcon, CopyIcon } from "@scrappy/ui";
import { WatchProductModal } from "./WatchProductModal";
import { StickyMiniHeader } from "./StickyMiniHeader";

interface ProductClientActionsProps {
  product: ProductDetail;
}

export function ProductClientActions({ product }: ProductClientActionsProps) {
  const { showToast } = useToast();
  const [isWatchModalOpen, setIsWatchModalOpen] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Check if product is already in watchlist on mount
  useEffect(() => {
    let mounted = true;
    fetch(`/api/watchlist?productId=${encodeURIComponent(product.id)}`)
      .then((res) => (res.ok ? res.json() : { isWatchlisted: false }))
      .then((data) => {
        if (mounted && data.isWatchlisted !== undefined) {
          setIsWatching(data.isWatchlisted);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [product.id]);

  // Keyboard shortcut 'w' to watch product (Brief Section 10: "w to watch on a product page")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === "w" || e.key === "W") {
        e.preventDefault();
        setIsWatchModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      showToast({
        type: "success",
        title: "Link Copied",
        description: "Direct canonical link copied to clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      showToast({
        type: "info",
        title: "Share URL",
        description: window.location.href,
      });
    }
  }, [showToast]);

  const handleWatchSuccess = useCallback((_targetPaise: number) => {
    setIsWatching(true);
  }, []);

  return (
    <>
      {/* Sticky Mini Header when scrolled */}
      <StickyMiniHeader
        productTitle={product.title}
        category={product.category}
        lowestPricePaise={product.lowestPricePaise}
        isWatching={isWatching}
        onOpenWatchModal={() => setIsWatchModalOpen(true)}
      />

      {/* Hero Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Watch Button with Keyboard Shortcut Hint */}
        <Button
          type="button"
          variant={isWatching ? "secondary" : "primary"}
          size="md"
          onClick={() => setIsWatchModalOpen(true)}
          className="min-h-[44px] min-w-[44px] px-4 font-mono text-xs flex items-center gap-2 group"
          title="Watch this product for price drops (Shortcut: W)"
        >
          {isWatching ? (
            <>
              <CheckIcon size={16} className="text-[var(--color-success)]" />
              <span>Watching Active</span>
            </>
          ) : (
            <>
              <BellIcon size={16} className="group-hover:scale-110 transition-transform" />
              <span>Watch this product</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[10px] text-[var(--text-3)] border border-[var(--border-subtle)] font-mono ml-1">
                W
              </kbd>
            </>
          )}
        </Button>

        {/* Copy Share Link Button */}
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleCopyLink}
          className="min-h-[44px] min-w-[44px] px-3 font-mono text-xs flex items-center gap-1.5"
          title="Copy canonical product URL"
        >
          {isCopied ? (
            <>
              <CheckIcon size={16} className="text-[var(--color-success)]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <CopyIcon size={16} />
              <span>Share</span>
            </>
          )}
        </Button>
      </div>

      {/* Watch Modal Dialog */}
      <WatchProductModal
        open={isWatchModalOpen}
        onOpenChange={setIsWatchModalOpen}
        productId={product.id}
        productTitle={product.title}
        currentPricePaise={product.lowestPricePaise}
        priceHistory={product.priceHistory}
        onWatchSuccess={handleWatchSuccess}
      />
    </>
  );
}
