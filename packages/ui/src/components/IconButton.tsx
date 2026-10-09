"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";

export type IconButtonVariant = "default" | "primary" | "secondary" | "outline" | "ghost";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  "aria-label": string; // Enforce accessible label
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<IconButtonVariant, string> = {
  default:
    "bg-[var(--surface-3)] text-[var(--text-1)] hover:bg-[var(--surface-4)] border border-[var(--border)]",
  primary:
    "bg-[var(--color-accent)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-hover)] border border-transparent shadow-[var(--elevation-1)]",
  secondary:
    "bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-3)] border border-[var(--border)]",
  outline:
    "bg-transparent text-[var(--text-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--border-strong)]",
  ghost:
    "bg-transparent text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--surface-2)] border border-transparent",
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "h-11 w-11 p-2.5",
  md: "h-11 w-11 p-2.5",
  lg: "h-12 w-12 p-3",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    children,
    "aria-label": ariaLabel,
    variant = "default",
    size = "md",
    isLoading = false,
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
      aria-label={ariaLabel}
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      className={`inline-flex items-center justify-center rounded-[var(--radius-md)] transition-colors duration-[var(--motion-duration-fast)] select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)] disabled:opacity-40 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
});
