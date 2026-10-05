"use client";

import React, { createContext, useContext, useEffect, useId, useRef, useState, useCallback } from "react";

export type SheetSide = "right" | "left" | "bottom";

interface SheetContextValue {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  titleId: string;
  descriptionId: string;
  side: SheetSide;
}

const SheetContext = createContext<SheetContextValue | null>(null);

export interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SheetSide;
  children: React.ReactNode;
}

export function Sheet({ open: controlledOpen, onOpenChange, side = "right", children }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setIsOpen = useCallback(
    (val: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(val);
      }
      onOpenChange?.(val);
    },
    [controlledOpen, onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ isOpen, setIsOpen, titleId, descriptionId, side }}>
      {children}
    </SheetContext.Provider>
  );
}

export interface SheetTriggerProps {
  children: React.ReactElement<{
    onClick?: React.MouseEventHandler;
    "aria-haspopup"?: string;
    "aria-expanded"?: boolean;
  }>;
}

export function SheetTrigger({ children }: SheetTriggerProps) {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("SheetTrigger must be used within Sheet");

  const handleClick = (e: React.MouseEvent) => {
    children.props.onClick?.(e);
    ctx.setIsOpen(true);
  };

  return React.cloneElement(children, {
    onClick: handleClick,
    "aria-haspopup": "dialog",
    "aria-expanded": ctx.isOpen,
  });
}

const sideClasses: Record<SheetSide, string> = {
  right: "inset-y-0 right-0 h-full w-full max-w-md border-l animate-in slide-in-from-right duration-300",
  left: "inset-y-0 left-0 h-full w-full max-w-md border-r animate-in slide-in-from-left duration-300",
  bottom: "inset-x-0 bottom-0 max-h-[85vh] w-full border-t rounded-t-[var(--radius-lg)] animate-in slide-in-from-bottom duration-300",
};

export function SheetContent({
  children,
  className = "",
  initialFocusRef,
}: {
  children: React.ReactNode;
  className?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("SheetContent must be used within Sheet");

  const sheetRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Drag-to-dismiss state for mobile bottom sheets
  const [dragY, setDragY] = useState(0);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (ctx.side !== "bottom") return;
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (ctx.side !== "bottom" || touchStartY.current === null) return;
    const currentY = e.touches[0]?.clientY ?? touchStartY.current;
    const delta = currentY - touchStartY.current;
    if (delta > 0) {
      setDragY(delta);
    }
  };

  const handleTouchEnd = () => {
    if (ctx.side !== "bottom") return;
    if (dragY > 70) {
      ctx.setIsOpen(false);
    }
    setDragY(0);
    touchStartY.current = null;
  };

  useEffect(() => {
    if (!ctx.isOpen) return;

    // 1. Capture previously focused element
    previousFocus.current = document.activeElement as HTMLElement;

    // 2. Prevent layout shift from scrollbar removal
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    // 3. Set initial focus
    const timer = setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        const focusables = sheetRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables && focusables.length > 0) {
          const firstTarget = focusables[0];
          if (firstTarget) firstTarget.focus();
        } else {
          sheetRef.current?.focus();
        }
      }
    }, 10);

    // 4. Focus Trap & Escape key listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        ctx.setIsOpen(false);
        return;
      }

      if (e.key === "Tab") {
        if (!sheetRef.current) return;
        const focusables = Array.from(
          sheetRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || !sheetRef.current.contains(document.activeElement)) {
            last?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last || !sheetRef.current.contains(document.activeElement)) {
            first?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      if (previousFocus.current && typeof previousFocus.current.focus === "function") {
        previousFocus.current.focus();
      }
    };
  }, [ctx.isOpen, ctx, initialFocusRef]);

  if (!ctx.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[var(--z-sheet)] flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => ctx.setIsOpen(false)}
      role="presentation"
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ctx.titleId}
        aria-describedby={ctx.descriptionId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragY === 0 ? "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)" : "none",
        }}
        className={`fixed bg-[var(--surface-3)] text-[var(--text-1)] border-[var(--border)] shadow-[var(--elevation-4)] p-6 outline-none flex flex-col justify-between ${
          sideClasses[ctx.side]
        } ${className}`}
      >
        {ctx.side === "bottom" && (
          <div className="w-full flex justify-center pb-3 -mt-2 cursor-grab active:cursor-grabbing">
            <span className="w-10 h-1 rounded-full bg-[var(--border-strong)]" aria-hidden="true" />
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function SheetHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-1.5 mb-6 ${className}`}>{children}</div>;
}

export function SheetTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ctx = useContext(SheetContext);
  return (
    <h2 id={ctx?.titleId} className={`text-lg font-semibold text-[var(--text-1)] tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

export function SheetDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ctx = useContext(SheetContext);
  return (
    <p id={ctx?.descriptionId} className={`text-sm text-[var(--text-2)] ${className}`}>
      {children}
    </p>
  );
}

export function SheetFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-subtle)] ${className}`}>{children}</div>;
}

export function SheetClose({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("SheetClose must be used within Sheet");

  return (
    <button
      type="button"
      onClick={() => ctx.setIsOpen(false)}
      aria-label="Close sheet"
      className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-[var(--radius-sm)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] ${className}`}
    >
      {children ?? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </button>
  );
}
