"use client";

import { useCallback } from "react";

/**
 * Safely executes a state mutation or DOM update wrapped in the browser View Transitions API.
 * Gracefully falls back to direct invocation if unsupported or under prefers-reduced-motion.
 */
export function startSafeViewTransition(updateFn: () => void | Promise<void>): void {
  if (
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    typeof (document as any).startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    (document as any).startViewTransition(updateFn);
  } else {
    updateFn();
  }
}

export function useSafeViewTransition() {
  const transition = useCallback((updateFn: () => void | Promise<void>) => {
    startSafeViewTransition(updateFn);
  }, []);

  return { startTransition: transition };
}
