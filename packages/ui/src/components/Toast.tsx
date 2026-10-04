"use client";

import { createContext, useContext, useState, useCallback, useId, type ReactNode } from "react";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  durationMs?: number;
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

const toastTypeStyles: Record<ToastType, { border: string; bg: string; iconColor: string; role: "status" | "alert" }> = {
  info: { border: "border-[#5AA9FF]", bg: "bg-[#0F1217]", iconColor: "text-[#5AA9FF]", role: "status" },
  success: { border: "border-[#2FBF8A]", bg: "bg-[#0F1217]", iconColor: "text-[#2FBF8A]", role: "status" },
  warning: { border: "border-[#F5B544]", bg: "bg-[#0F1217]", iconColor: "text-[#F5B544]", role: "alert" },
  error: { border: "border-[#F2685B]", bg: "bg-[#0F1217]", iconColor: "text-[#F2685B]", role: "alert" },
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
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => {
          const style = toastTypeStyles[t.type];
          return (
            <div
              key={t.id}
              role={style.role}
              className={`pointer-events-auto border ${style.border} ${style.bg} p-3 rounded-[4px] shadow-lg flex items-start justify-between gap-3 text-sm text-[#D6DBE3] transition-transform animate-in fade-in slide-in-from-bottom-2 duration-150`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${style.iconColor} bg-current`} aria-hidden="true" />
                  {t.title}
                </span>
                {t.description && <span className="text-xs text-[#98A2B3]">{t.description}</span>}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Dismiss notification"
                className="text-[#5B677C] hover:text-[#D6DBE3] p-1 transition-colors rounded focus:outline-none focus:ring-1 focus:ring-[#C6F135]"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
