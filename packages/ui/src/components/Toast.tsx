"use client";

import React, { createContext, useContext, useState, useCallback, useId, useRef, useEffect, type ReactNode } from "react";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  durationMs?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onUndo?: () => void;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => string;
  dismissToast: (id: string) => void;
  toasts: ToastItem[];
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

const toastTypeStyles: Record<
  ToastType,
  { border: string; dot: string; role: "status" | "alert" }
> = {
  info: {
    border: "border-[var(--color-info)]",
    dot: "bg-[var(--color-info)]",
    role: "status",
  },
  success: {
    border: "border-[var(--color-success)]",
    dot: "bg-[var(--color-success)]",
    role: "status",
  },
  warning: {
    border: "border-[var(--color-warn)]",
    dot: "bg-[var(--color-warn)]",
    role: "alert",
  },
  error: {
    border: "border-[var(--color-danger)]",
    dot: "bg-[var(--color-danger)]",
    role: "alert",
  },
};

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const style = toastTypeStyles[toast.type];
  const duration = toast.durationMs ?? 4000;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef(Date.now());

  // Swipe-to-dismiss state
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (duration <= 0) return;
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, remainingTimeRef.current);
  }, [duration, onDismiss, toast.id]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.touches[0]?.clientX ?? touchStartX.current;
    const delta = currentX - touchStartX.current;
    if (delta > 0) {
      setSwipeX(delta);
    }
  };

  const handleTouchEnd = () => {
    if (swipeX > 60) {
      onDismiss(toast.id);
    }
    setSwipeX(0);
    touchStartX.current = null;
  };

  return (
    <div
      role={style.role}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: swipeX > 0 ? `translateX(${swipeX}px)` : undefined,
        opacity: swipeX > 0 ? Math.max(0, 1 - swipeX / 120) : undefined,
        transition: swipeX === 0 ? "transform 200ms ease, opacity 200ms ease" : "none",
      }}
      className={`pointer-events-auto border ${style.border} bg-[var(--surface-3)] p-3.5 rounded-[var(--radius-md)] shadow-[var(--elevation-3)] flex items-start justify-between gap-3 text-sm text-[var(--text-1)] select-none animate-in fade-in slide-in-from-bottom-3 duration-[var(--motion-duration-base)]`}
    >
      <div className="flex flex-col gap-1 pr-2">
        <span className="font-semibold text-xs uppercase tracking-wide flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${style.dot}`} aria-hidden="true" />
          {toast.title}
        </span>
        {toast.description && <span className="text-xs text-[var(--text-2)]">{toast.description}</span>}
        <div className="flex items-center gap-3 mt-1.5">
          {toast.onUndo && (
            <button
              type="button"
              onClick={() => {
                toast.onUndo?.();
                onDismiss(toast.id);
              }}
              className="text-xs font-mono font-medium text-[var(--color-accent)] hover:underline min-h-[32px] flex items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)]"
            >
              Undo
            </button>
          )}
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                onDismiss(toast.id);
              }}
              className="text-xs font-mono font-medium text-[var(--color-accent)] hover:underline min-h-[32px] flex items-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)]"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-[var(--text-3)] hover:text-[var(--text-1)] p-2 rounded-[var(--radius-sm)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idPrefix = useId();

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newItem: ToastItem = { ...toast, id };

      // Queue management: enforce max 3 active toasts
      setToasts((prev) => {
        const next = [...prev, newItem];
        return next.length > 3 ? next.slice(-3) : next;
      });

      return id;
    },
    [idPrefix]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, toasts }}>
      {children}
      <aside
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </aside>
    </ToastContext.Provider>
  );
}
