"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-[#2D1B00] border-b border-[#F59E0B]/50 px-4 py-2 text-xs text-[#F59E0B] flex items-center justify-between"
    >
      <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
        <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
        <span className="font-semibold uppercase tracking-wider text-[10px]">
          OFFLINE MODE ACTIVE
        </span>
        <span className="text-[#D6DBE3]">
          — You are currently disconnected. SCRAPPY is serving cached local catalog data. Realtime updates and extraction runs will resume once connectivity is restored.
        </span>
      </div>
    </div>
  );
}
