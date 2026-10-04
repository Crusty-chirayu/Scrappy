"use client";

import { useState, useEffect } from "react";
import { Button, Input, ToastProvider, useToast } from "@scrappy/ui";
import { ProductDetail } from "@scrappy/db";

function ProductActionsInner({ product }: { product: ProductDetail }) {
  const { showToast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(
    String(Math.round((product.lowestPricePaise * 0.9) / 100)),
  );
  const [channel, setChannel] = useState<"in_app" | "email">("in_app");

  // Load persisted watchlist state on mount from Supabase
  useEffect(() => {
    let mounted = true;
    fetch(`/api/watchlist?productId=${encodeURIComponent(product.id)}`)
      .then((res) => (res.ok ? res.json() : { isWatchlisted: false }))
      .then((data) => {
        if (mounted && data.isWatchlisted !== undefined) {
          setIsSaved(data.isWatchlisted);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [product.id]);

  const toggleWatchlist = async () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      if (nextSaved) {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        if (!res.ok) throw new Error("Persistence error");
        showToast({
          type: "success",
          title: "Added to Watchlist",
          description: `Persisted to Supabase: tracking ${product.title}`,
        });
      } else {
        const res = await fetch(`/api/watchlist?productId=${encodeURIComponent(product.id)}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Persistence error");
        showToast({
          type: "info",
          title: "Removed from Watchlist",
        });
      }
    } catch {
      setIsSaved(!nextSaved);
      showToast({
        type: "error",
        title: "Sync Error",
        description: "Could not update watchlist in database",
      });
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(targetPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast({
        type: "error",
        title: "Invalid Price",
        description: "Please enter a valid positive target price",
      });
      return;
    }

    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          targetPricePaise: Math.round(priceNum * 100),
          notificationChannel: channel,
        }),
      });

      if (!res.ok) throw new Error("Alert creation error");

      setIsAlertModalOpen(false);
      showToast({
        type: "success",
        title: "Price Alert Active",
        description: `Persisted to Supabase: Alert active when price drops below ₹${priceNum.toLocaleString("en-IN")}`,
      });
    } catch {
      showToast({
        type: "error",
        title: "Alert Error",
        description: "Could not persist alert to database",
      });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant={isSaved ? "primary" : "secondary"}
          size="sm"
          onClick={toggleWatchlist}
          aria-label={isSaved ? "Remove from watchlist" : "Add to watchlist"}
        >
          {isSaved ? "★ In Watchlist" : "☆ Watchlist"}
        </Button>

        <Button variant="secondary" size="sm" onClick={() => setIsAlertModalOpen(true)}>
          🔔 Set Alert
        </Button>
      </div>

      {/* Alert Modal */}
      {isAlertModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Set Price Drop Alert"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm bg-[#0F1217] border border-[#262E3C] rounded-[4px] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#262E3C] mb-4">
              <h3 className="text-sm font-bold text-white">Create Price Drop Alert</h3>
              <button
                type="button"
                onClick={() => setIsAlertModalOpen(false)}
                className="text-[#98A2B3] hover:text-white p-1"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="flex flex-col gap-4">
              <div>
                <span className="text-xs text-[#98A2B3] block mb-1">Product:</span>
                <span className="text-xs font-semibold text-white line-clamp-1">
                  {product.title}
                </span>
                <span className="text-[11px] text-[#5B677C] block mt-0.5">
                  Current lowest: ₹{Math.round(product.lowestPricePaise / 100).toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <Input
                  label="Target Alert Price (₹)"
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  helperText="You will be notified as soon as any store hits this price"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#98A2B3] block mb-1">
                  Notification Channel:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setChannel("in_app")}
                    className={`py-1.5 px-3 rounded-[2px] border text-center transition-colors ${
                      channel === "in_app"
                        ? "border-[#C6F135] bg-[#C6F135]/10 text-[#C6F135] font-semibold"
                        : "border-[#262E3C] bg-[#141922] text-[#98A2B3]"
                    }`}
                  >
                    In-App Notification
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel("email")}
                    className={`py-1.5 px-3 rounded-[2px] border text-center transition-colors ${
                      channel === "email"
                        ? "border-[#C6F135] bg-[#C6F135]/10 text-[#C6F135] font-semibold"
                        : "border-[#262E3C] bg-[#141922] text-[#98A2B3]"
                    }`}
                  >
                    Email Alert
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1A202B]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAlertModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Alert
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function ProductClientActions({ product }: { product: ProductDetail }) {
  return (
    <ToastProvider>
      <ProductActionsInner product={product} />
    </ToastProvider>
  );
}
