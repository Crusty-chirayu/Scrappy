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
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#C6F135] text-[#0A0C0F] font-semibold hover:bg-[#b2dc26] active:bg-[#9fc41f] border border-transparent shadow-sm",
  secondary:
    "bg-[#1A202B] text-[#D6DBE3] font-medium hover:bg-[#262E3C] active:bg-[#141922] border border-[#262E3C]",
  outline:
    "bg-transparent text-[#D6DBE3] font-medium hover:bg-[#141922] active:bg-[#1A202B] border border-[#262E3C]",
  ghost:
    "bg-transparent text-[#98A2B3] font-medium hover:text-[#D6DBE3] hover:bg-[#141922] active:bg-[#1A202B] border border-transparent",
  danger:
    "bg-[#F2685B] text-[#0A0C0F] font-semibold hover:bg-[#db5347] active:bg-[#c24237] border border-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs gap-1.5 h-7",
  md: "px-3.5 py-1.5 text-sm gap-2 h-9",
  lg: "px-4.5 py-2.5 text-base gap-2.5 h-11",
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
      className={`inline-flex items-center justify-center rounded-[3px] transition-colors duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#C6F135] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0C0F] disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 text-current"
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
          {iconLeft && <span className="inline-flex shrink-0">{iconLeft}</span>}
          <span>{children}</span>
          {iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
        </>
      )}
    </button>
  );
});
