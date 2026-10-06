"use client";

import React, { useEffect } from "react";
import { Button } from "@scrappy/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ExtractError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Structured error logging per Rule 2
    console.error("[ExtractError]", {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center" role="alert">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)] mb-4 font-mono font-bold text-lg">
        !
      </div>
      <h1 className="text-xl font-bold text-[var(--text-1)] mb-2">
        Extraction Studio Fault
      </h1>
      <p className="text-sm text-[var(--text-3)] max-w-md mx-auto mb-6">
        An error occurred while compiling selectors or parsing DOM trees.
        {error.message && (
          <span className="block mt-2 font-mono text-xs text-[var(--color-danger)] bg-[var(--bg-2)] p-2 rounded border border-[var(--border-subtle)]">
            {error.message}
          </span>
        )}
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Reload Studio
        </Button>
        <Button variant="primary" onClick={reset}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
