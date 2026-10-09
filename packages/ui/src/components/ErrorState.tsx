"use client";

import type { ReactNode } from "react";
import { Button } from "./Button.js";
import { ScrappyLogo } from "../brand/ScrappyLogo.js";

export interface ErrorStateProps {
  title?: string;
  message: string;
  errorCode?: string;
  traceId?: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = "An unexpected error occurred",
  message,
  errorCode,
  traceId,
  onRetry,
  action,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`p-6 border border-[#F2685B]/30 rounded-[4px] bg-[#0F1217] flex flex-col items-center text-center max-w-md mx-auto ${className}`}
    >
      <div className="mb-3">
        <ScrappyLogo state="error" size={36} showLabel={false} />
      </div>
      <h3 className="text-sm font-semibold text-[#D6DBE3]">{title}</h3>
      <p className="text-xs text-[#98A2B3] mt-1.5 mb-3 leading-relaxed">{message}</p>

      {(errorCode || traceId) && (
        <div className="w-full bg-[#141922] border border-[#262E3C] rounded px-2.5 py-1.5 text-[11px] font-mono text-[#5B677C] mb-4 text-left flex flex-col gap-0.5 select-all">
          {errorCode && <div>Error Code: <span className="text-[#98A2B3]">{errorCode}</span></div>}
          {traceId && <div>Trace ID: <span className="text-[#98A2B3]">{traceId}</span></div>}
        </div>
      )}

      <div className="flex items-center gap-2">
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Retry operation
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}
