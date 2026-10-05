"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export interface HoldToConfirmButtonProps {
  onConfirm: () => void;
  holdDurationMs?: number;
  label?: string;
  confirmLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function HoldToConfirmButton({
  onConfirm,
  holdDurationMs = 600,
  label = "Hold to delete",
  confirmLabel = "Confirmed",
  className = "",
  disabled = false,
}: HoldToConfirmButtonProps) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const cancelHold = useCallback(() => {
    if (confirmed) return;
    setHolding(false);
    setProgress(0);
    startTimeRef.current = null;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, [confirmed]);

  const completeHold = useCallback(() => {
    setHolding(false);
    setProgress(1);
    setConfirmed(true);
    onConfirm();
    setTimeout(() => {
      setConfirmed(false);
      setProgress(0);
    }, 1500);
  }, [onConfirm]);

  const tick = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const nextProgress = Math.min(elapsed / holdDurationMs, 1);
      setProgress(nextProgress);

      if (nextProgress >= 1) {
        completeHold();
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    },
    [holdDurationMs, completeHold]
  );

  const startHold = useCallback(() => {
    if (disabled || confirmed) return;
    setHolding(true);
    startTimeRef.current = null;
    animFrameRef.current = requestAnimationFrame(tick);
  }, [disabled, confirmed, tick]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      disabled={disabled || confirmed}
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !holding) {
          e.preventDefault();
          startHold();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          cancelHold();
        }
      }}
      className={`relative overflow-hidden inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-[var(--radius-sm)] font-sans text-sm font-medium transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)] focus-visible:ring-offset-2 ${
        confirmed
          ? "bg-[var(--color-danger)] text-white"
          : "bg-[var(--surface-2)] text-[var(--color-danger)] border border-[var(--color-danger)]/40 hover:bg-[var(--color-danger)]/10"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      aria-label={confirmed ? confirmLabel : `${label} (hold for 600 milliseconds to confirm)`}
      aria-pressed={holding}
    >
      {/* 600ms progress fill overlay */}
      <span
        className="absolute inset-0 bg-[var(--color-danger)]/25 transition-none origin-left pointer-events-none"
        style={{
          transform: `scaleX(${progress})`,
        }}
        aria-hidden="true"
      />

      <span className="relative z-10 flex items-center gap-2">
        {confirmed ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>{confirmLabel}</span>
          </>
        ) : (
          <>
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                holding ? "bg-[var(--color-danger)] scale-125 transition-transform" : "bg-[var(--color-danger)]/40"
              }`}
            />
            <span>{holding ? "Keep holding..." : label}</span>
          </>
        )}
      </span>
    </button>
  );
}
