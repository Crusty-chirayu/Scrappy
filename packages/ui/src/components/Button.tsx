"use client";

import React, { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[var(--color-accent-contrast)] font-semibold hover:bg-[var(--color-accent-hover)] active:bg-[var(--color-accent-active)] border border-transparent shadow-[var(--elevation-1)]",
  secondary:
    "bg-[var(--surface-3)] text-[var(--text-1)] font-medium hover:bg-[var(--surface-4)] active:bg-[var(--surface-2)] border border-[var(--border)]",
  outline:
    "bg-transparent text-[var(--text-1)] font-medium hover:bg-[var(--surface-2)] active:bg-[var(--surface-3)] border border-[var(--border)] hover:border-[var(--border-strong)]",
  ghost:
    "bg-transparent text-[var(--text-2)] font-medium hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] active:bg-[var(--surface-3)] border border-transparent",
  danger:
    "bg-[var(--color-danger)] text-[var(--color-danger-contrast)] font-semibold hover:opacity-90 active:opacity-80 border border-transparent shadow-[var(--elevation-1)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1 text-xs gap-1.5 min-h-[44px]",
  md: "px-4 py-2 text-sm gap-2 min-h-[44px]",
  lg: "px-5 py-3 text-base gap-2.5 min-h-[48px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = "secondary",
    size = "md",
    isLoading = false,
    loadingText,
    iconLeft,
    iconRight,
    fullWidth = false,
    disabled = false,
    className = "",
    type = "button",
    ...props
  },
  ref,
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      className={`inline-flex items-center justify-center rounded-[var(--radius-md)] transition-all duration-[var(--motion-duration-fast)] select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)] disabled:opacity-40 disabled:cursor-not-allowed ${fullWidth ? "w-full" : ""} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        <>
          {iconLeft && <span className="inline-flex shrink-0" aria-hidden="true">{iconLeft}</span>}
          <span>{children}</span>
          {iconRight && <span className="inline-flex shrink-0" aria-hidden="true">{iconRight}</span>}
        </>
      )}
    </button>
  );
});
