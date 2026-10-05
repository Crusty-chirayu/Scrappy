import type { HTMLAttributes } from "react";

export type BadgeVariant = "default" | "accent" | "success" | "warn" | "danger" | "info" | "outline";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--surface-3)] text-[var(--text-1)] border border-[var(--border)]",
  accent: "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30 font-semibold",
  success: "bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/30 font-semibold",
  warn: "bg-[var(--color-warn)]/15 text-[var(--color-warn)] border border-[var(--color-warn)]/30 font-semibold",
  danger: "bg-[var(--color-danger)]/15 text-[var(--color-danger)] border border-[var(--color-danger)]/30 font-semibold",
  info: "bg-[var(--color-info)]/15 text-[var(--color-info)] border border-[var(--color-info)]/30 font-semibold",
  outline: "bg-transparent text-[var(--text-2)] border border-[var(--border-strong)]",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-[var(--text-3)]",
  accent: "bg-[var(--color-accent)]",
  success: "bg-[var(--color-success)]",
  warn: "bg-[var(--color-warn)]",
  danger: "bg-[var(--color-danger)]",
  info: "bg-[var(--color-info)]",
  outline: "bg-[var(--text-2)]",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] gap-1.5",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center font-mono rounded-[var(--radius-sm)] transition-colors select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}
