"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@scrappy/ui";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Structured error logging (Constitution Rule 2)
    console.error("[SCRAPPY ERROR BOUNDARY]:", error);
  }, [error]);

  const traceId = error.digest || `digest-${Date.now().toString(16)}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 flex items-center justify-center text-[var(--color-danger)] mb-6 shadow-xs">
        <AlertOctagon size={32} />
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-xs font-mono font-medium mb-3">
        <span>APPLICATION EXCEPTION DETECTED</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-display font-semibold text-[var(--text-1)] tracking-tight">
        Runtime Error Encountered
      </h1>

      <p className="text-xs sm:text-sm text-[var(--text-3)] mt-3 font-mono max-w-md leading-relaxed">
        {error.message || "A rendering or data extraction fault occurred in this view. Diagnostics have been recorded."}
      </p>

      <div className="mt-4 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[11px] text-[var(--text-3)]">
        TRACE ID: <span className="text-[var(--text-1)] select-all">{traceId}</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
        <Button
          variant="primary"
          size="sm"
          onClick={reset}
          className="min-h-[42px] font-mono text-xs font-semibold gap-1.5"
        >
          <RotateCcw size={14} />
          <span>Retry Operation</span>
        </Button>
        <Link href="/">
          <Button variant="secondary" size="sm" className="min-h-[42px] font-mono text-xs gap-1.5">
            <Home size={14} />
            <span>Return Home</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
