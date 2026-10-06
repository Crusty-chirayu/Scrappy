"use client";

import React, { useEffect } from "react";
import { Button } from "@scrappy/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PricingError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[PricingError]", error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center" role="alert">
      <div className="w-12 h-12 rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)] mx-auto flex items-center justify-center font-bold text-lg mb-4">
        !
      </div>
      <h1 className="text-xl font-bold text-[var(--text-1)] mb-2">
        Pricing Service Unavailable
      </h1>
      <p className="text-xs text-[var(--text-3)] mb-6 font-mono">
        Unable to load live currency rates or subscription tiers.
      </p>
      <Button variant="primary" onClick={reset}>
        Retry Loading Plans
      </Button>
    </div>
  );
}
