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
    <div className="flex flex-col gap-1 w-full text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-[#98A2B3]">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {iconPrefix && (
          <div className="absolute left-2.5 flex items-center pointer-events-none text-[#5B677C]">
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
          className={`w-full bg-[#141922] text-[#D6DBE3] text-sm rounded-[3px] border transition-colors outline-none px-3 py-1.5 h-9 placeholder:text-[#5B677C] focus:ring-1 focus:ring-[#C6F135] focus:border-[#C6F135] disabled:opacity-50 disabled:cursor-not-allowed ${
            iconPrefix ? "pl-8" : ""
          } ${iconSuffix || clearable ? "pr-8" : ""} ${
            isInvalid ? "border-[#F2685B]" : "border-[#262E3C]"
          } ${className}`}
          {...props}
        />
        {clearable && hasValue && !disabled && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear input"
            className="absolute right-2 text-[#5B677C] hover:text-[#D6DBE3] transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[#C6F135]"
          >
            <svg
              className="w-3.5 h-3.5"
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
          <div className="absolute right-2.5 flex items-center pointer-events-none text-[#5B677C]">
            {iconSuffix}
          </div>
        )}
      </div>
      {errorMessage && (
        <p id={errorId} role="alert" className="text-xs text-[#F2685B] mt-0.5">
          {errorMessage}
        </p>
      )}
      {!errorMessage && helperText && (
        <p id={helperId} className="text-xs text-[#5B677C] mt-0.5">
          {helperText}
        </p>
      )}
    </div>
  );
});
