import React, { type HTMLAttributes } from "react";

export type CardVariant = "default" | "elevated" | "interactive";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  as?: React.ElementType;
}

export function Card({
  as: Component = "div",
  variant = "default",
  children,
  className = "",
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-[var(--surface-3)] border border-[var(--border)] shadow-[var(--elevation-1)]",
    elevated: "bg-[var(--surface-3)] border border-[var(--border)] shadow-[var(--elevation-2)]",
    interactive:
      "bg-[var(--surface-3)] border border-[var(--border)] shadow-[var(--elevation-1)] hover:border-[var(--border-strong)] hover:shadow-[var(--elevation-2)] hover:-translate-y-0.5 transition-all duration-[var(--motion-duration-fast)] cursor-pointer focus-within:ring-2 focus-within:ring-[var(--border-focus)]",
  };

  return (
    <Component
      className={`rounded-[var(--radius-md)] overflow-hidden text-[var(--text-1)] ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 sm:p-5 flex flex-col gap-1 border-b border-[var(--border-subtle)] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-base font-semibold text-[var(--text-1)] tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-[var(--text-2)] ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-4 sm:p-5 text-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--surface-2)]/40 flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
