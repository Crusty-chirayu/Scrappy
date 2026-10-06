"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button, ErrorState } from "@scrappy/ui";

export default function WatchlistError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[WatchlistError]", {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="p-8 rounded-[var(--radius-lg)] bg-[var(--surface-1)] border border-[var(--border-default)] shadow-[var(--elevation-2)] text-center">
        <ErrorState
          title="Failed to Load Watchlist"
          message={error.message || "An error occurred while loading your tracked product list."}
          errorCode={error.digest || "ERR_WATCHLIST_FETCH"}
          onRetry={reset}
        />
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" onClick={() => reset()}>
            Retry
          </Button>
          <Link href="/compare">
            <Button variant="secondary">
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
