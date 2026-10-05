"use client";

import { createContext, useContext, useState, useCallback, useId, type ReactNode } from "react";

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

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idPrefix = useId();

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const duration = toast.durationMs ?? 4000;
      const newItem: ToastItem = { ...toast, id };

      setToasts((prev) => [...prev, newItem]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [idPrefix, dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, toasts }}>
      {children}
      <aside
        aria-label="Notifications"
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => {
          const style = toastTypeStyles[t.type];
          return (
            <div
              key={t.id}
              role={style.role}
              className={`pointer-events-auto border ${style.border} bg-[var(--surface-3)] p-3.5 rounded-[var(--radius-md)] shadow-[var(--elevation-3)] flex items-start justify-between gap-3 text-sm text-[var(--text-1)] animate-in fade-in slide-in-from-bottom-3 duration-[var(--motion-duration-base)]`}
            >
              <div className="flex flex-col gap-1 pr-2">
                <span className="font-semibold text-xs uppercase tracking-wide flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${style.dot}`} aria-hidden="true" />
                  {t.title}
                </span>
                {t.description && <span className="text-xs text-[var(--text-2)]">{t.description}</span>}
                {t.action && (
                  <button
                    type="button"
                    onClick={() => {
                      t.action?.onClick();
                      dismissToast(t.id);
                    }}
                    className="mt-2 text-xs font-mono font-medium text-[var(--color-accent)] hover:underline self-start focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)] min-h-[32px] flex items-center"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Dismiss notification"
                className="text-[var(--text-3)] hover:text-[var(--text-1)] p-2 rounded-[var(--radius-sm)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
}
