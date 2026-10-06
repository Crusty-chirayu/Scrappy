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
    typeof (document as unknown as { startViewTransition?: (cb: () => void | Promise<void>) => unknown }).startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const docWithTransition = document as unknown as { startViewTransition: (cb: () => void | Promise<void>) => unknown };
    docWithTransition.startViewTransition(updateFn);
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
