"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    id,
    label,
    helperText,
    errorMessage,
    options,
    children,
    disabled = false,
    className = "",
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;
  const isInvalid = Boolean(errorMessage);

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label htmlFor={selectId} className="text-xs font-mono font-medium text-[var(--text-2)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-describedby={
            isInvalid ? errorId : helperText ? helperId : undefined
          }
          className={`w-full appearance-none bg-[var(--surface-1)] text-[var(--text-1)] text-sm rounded-[var(--radius-sm)] border transition-all duration-[var(--motion-duration-fast)] outline-none pl-3.5 pr-10 py-2.5 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:border-transparent disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
            isInvalid
              ? "border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]"
              : "border-[var(--border)] hover:border-[var(--border-strong)]"
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-[var(--surface-1)] text-[var(--text-1)]">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="pointer-events-none absolute right-3 flex items-center text-[var(--text-2)]" aria-hidden="true">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {errorMessage && (
        <p id={errorId} role="alert" className="text-xs text-[var(--color-danger)] mt-0.5 font-medium">
          {errorMessage}
        </p>
      )}
      {!errorMessage && helperText && (
        <p id={helperId} className="text-xs text-[var(--text-3)] mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
});
