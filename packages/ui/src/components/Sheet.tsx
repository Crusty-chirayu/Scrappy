"use client";

import React, { createContext, useContext, useEffect, useId, useRef, useState } from "react";

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
  const setIsOpen = (val: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(val);
    }
    onOpenChange?.(val);
  };

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

export function SheetContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("SheetContent must be used within Sheet");

  const sheetRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ctx.isOpen) return;

    previousFocus.current = document.activeElement as HTMLElement;
    sheetRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        ctx.setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [ctx.isOpen]);

  if (!ctx.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[var(--z-drawer)] bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
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
        className={`fixed bg-[var(--surface-3)] text-[var(--text-1)] border-[var(--border)] shadow-[var(--elevation-4)] p-6 outline-none flex flex-col justify-between overflow-y-auto ${sideClasses[ctx.side]} ${className}`}
      >
        {children}
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
