"use client";

import React, { forwardRef, useId, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  iconPrefix?: React.ReactNode;
  iconSuffix?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    helperText,
    errorMessage,
    iconPrefix,
    iconSuffix,
    clearable = false,
    onClear,
    value,
    defaultValue,
    disabled = false,
    className = "",
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  const hasValue = value !== undefined ? Boolean(value) : Boolean(defaultValue);
  const isInvalid = Boolean(errorMessage);

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-mono font-medium text-[var(--text-2)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {iconPrefix && (
          <div className="absolute left-3 flex items-center pointer-events-none text-[var(--text-3)]" aria-hidden="true">
            {iconPrefix}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={isInvalid}
          aria-describedby={
            isInvalid ? errorId : helperText ? helperId : undefined
          }
          suppressHydrationWarning
          className={`w-full bg-[var(--surface-1)] text-[var(--text-1)] text-sm rounded-[var(--radius-sm)] border transition-all duration-[var(--motion-duration-fast)] outline-none px-3.5 py-2.5 min-h-[44px] placeholder:text-[var(--text-3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:border-transparent disabled:opacity-40 disabled:cursor-not-allowed ${
            iconPrefix ? "pl-10" : ""
          } ${iconSuffix || clearable ? "pr-10" : ""} ${
            isInvalid ? "border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]" : "border-[var(--border)] hover:border-[var(--border-strong)]"
          } ${className}`}
          {...props}
        />
        {clearable && hasValue && !disabled && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear input"
            className="absolute right-2 text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors p-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {!clearable && iconSuffix && (
          <div className="absolute right-3 flex items-center pointer-events-none text-[var(--text-3)]" aria-hidden="true">
            {iconSuffix}
          </div>
        )}
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
