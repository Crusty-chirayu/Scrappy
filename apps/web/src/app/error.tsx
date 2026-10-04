"use client";

import { useEffect } from "react";
import { ErrorState } from "@scrappy/ui";

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 flex items-center justify-center">
      <ErrorState
        title="Application Exception Detected"
        message={error.message || "A rendering or data extraction fault occurred in this view."}
        errorCode="ERR_CLIENT_BOUNDARY"
        traceId={error.digest || `digest-${Date.now().toString(16)}`}
        onRetry={reset}
      />
    </div>
  );
}
