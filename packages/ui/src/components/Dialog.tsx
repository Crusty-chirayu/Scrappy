"use client";

import React, { createContext, useContext, useEffect, useId, useRef, useState } from "react";

interface DialogContextValue {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
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
    <DialogContext.Provider value={{ isOpen, setIsOpen, titleId, descriptionId }}>
      {children}
    </DialogContext.Provider>
  );
}

export interface DialogTriggerProps {
  children: React.ReactElement<{
    onClick?: React.MouseEventHandler;
    "aria-haspopup"?: string;
    "aria-expanded"?: boolean;
  }>;
}

export function DialogTrigger({ children }: DialogTriggerProps) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("DialogTrigger must be used within Dialog");

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

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className = "" }: DialogContentProps) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("DialogContent must be used within Dialog");

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ctx.isOpen) return;

    previousFocus.current = document.activeElement as HTMLElement;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable && focusable.length > 0) {
      const firstTarget = focusable[0];
      if (firstTarget) firstTarget.focus();
    } else {
      dialogRef.current?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        ctx.setIsOpen(false);
      } else if (e.key === "Tab") {
        if (!dialogRef.current) return;
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first && last) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last && first) {
          first.focus();
          e.preventDefault();
        }
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
      className="fixed inset-0 z-[var(--z-dialog)] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => ctx.setIsOpen(false)}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ctx.titleId}
        aria-describedby={ctx.descriptionId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg bg-[var(--surface-3)] text-[var(--text-1)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-[var(--elevation-3)] p-6 outline-none animate-in zoom-in-95 duration-200 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-1.5 mb-4 ${className}`}>{children}</div>;
}

export function DialogTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ctx = useContext(DialogContext);
  return (
    <h2 id={ctx?.titleId} className={`text-lg font-semibold text-[var(--text-1)] tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ctx = useContext(DialogContext);
  return (
    <p id={ctx?.descriptionId} className={`text-sm text-[var(--text-2)] ${className}`}>
      {children}
    </p>
  );
}

export function DialogFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex items-center justify-end gap-3 mt-6 ${className}`}>{children}</div>;
}

export function DialogClose({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("DialogClose must be used within Dialog");

  return (
    <button
      type="button"
      onClick={() => ctx.setIsOpen(false)}
      aria-label="Close dialog"
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
