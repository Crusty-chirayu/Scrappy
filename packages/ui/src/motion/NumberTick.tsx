"use client";

import { useEffect, useRef, useState } from "react";

export interface NumberTickProps {
  value: number;
  previousValue?: number;
  currency?: string;
  className?: string;
  showDeltaIndicator?: boolean;
}

export function NumberTick({
  value,
  previousValue,
  currency = "₹",
  className = "",
  showDeltaIndicator = true,
}: NumberTickProps) {
  const [flashDirection, setFlashDirection] = useState<"down" | "up" | null>(null);
  const prevValRef = useRef(previousValue ?? value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value !== prevValRef.current) {
      const isDown = value < prevValRef.current;
      setFlashDirection(isDown ? "down" : "up");
      prevValRef.current = value;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setFlashDirection(null);
      }, 600);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value]);

  const formattedDigits = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);

  const delta = previousValue !== undefined ? value - previousValue : 0;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium tracking-tight rounded px-1.5 py-0.5 transition-colors duration-200 ${
        flashDirection === "down"
          ? "animate-[price-flash-down_600ms_ease-out_forwards]"
          : flashDirection === "up"
          ? "animate-[price-flash-up_600ms_ease-out_forwards]"
          : ""
      } ${className}`}
      aria-live="polite"
      aria-label={`${currency} ${formattedDigits}${delta !== 0 ? ` (${delta > 0 ? "+" : ""}${delta})` : ""}`}
    >
      <span className="text-sm opacity-80 select-none align-baseline">{currency}</span>
      <span
        key={value}
        className={`tabular-nums ${
          flashDirection === "down"
            ? "animate-[odometer-down_200ms_cubic-bezier(0.16,1,0.3,1)]"
            : flashDirection === "up"
            ? "animate-[odometer-up_200ms_cubic-bezier(0.16,1,0.3,1)]"
            : ""
        }`}
      >
        {formattedDigits}
      </span>
      {showDeltaIndicator && flashDirection && (
        <span
          className={`text-xs font-semibold select-none ${
            flashDirection === "down" ? "text-[var(--color-price-down)]" : "text-[var(--color-price-up)]"
          }`}
          aria-hidden="true"
        >
          {flashDirection === "down" ? "↓" : "↑"}
        </span>
      )}
    </span>
  );
}
