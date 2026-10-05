"use client";

import { IconProps } from "./icons.js";

/**
 * AnimatedBellIcon: rings once on trigger or hover.
 */
export function AnimatedBellIcon({
  size = 24,
  className = "",
  ring = false,
  ...props
}: IconProps & { ring?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`inline-block shrink-0 transition-transform origin-top ${
        ring ? "animate-[bell-ring_0.6s_ease-in-out]" : "hover:animate-[bell-ring_0.6s_ease-in-out]"
      } ${className}`}
      {...props}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

/**
 * AnimatedCheckIcon: self-drawing checkmark using stroke-dashoffset.
 */
export function AnimatedCheckIcon({
  size = 24,
  className = "",
  trigger = true,
  ...props
}: IconProps & { trigger?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      <polyline
        points="20 6 9 17 4 12"
        style={{
          strokeDasharray: 24,
          strokeDashoffset: trigger ? 0 : 24,
          animation: trigger ? "check-draw 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "none",
        }}
      />
    </svg>
  );
}

/**
 * NudgeArrowIcon: nudges 2px forward on hover.
 */
export function NudgeArrowIcon({
  size = 24,
  direction = "right",
  className = "",
  ...props
}: IconProps & { direction?: "right" | "left" | "up" | "down" }) {
  const nudgeClass =
    direction === "right"
      ? "group-hover:translate-x-[2px] transition-transform duration-150"
      : direction === "left"
        ? "group-hover:-translate-x-[2px] transition-transform duration-150"
        : direction === "up"
          ? "group-hover:-translate-y-[2px] transition-transform duration-150"
          : "group-hover:translate-y-[2px] transition-transform duration-150";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`inline-block shrink-0 ${nudgeClass} ${className}`}
      {...props}
    >
      {direction === "right" && <polyline points="9 18 15 12 9 6" />}
      {direction === "left" && <polyline points="15 18 9 12 15 6" />}
      {direction === "up" && <polyline points="18 15 12 9 6 15" />}
      {direction === "down" && <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}

/**
 * SearchSpinnerIcon: precision magnifying glass that morphs / spins cleanly when isLoading is true.
 */
export function SearchSpinnerIcon({
  size = 24,
  isLoading = false,
  className = "",
  ...props
}: IconProps & { isLoading?: boolean }) {
  if (isLoading) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`inline-block shrink-0 animate-spin text-[var(--color-accent)] ${className}`}
        {...props}
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" />
        <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`inline-block shrink-0 transition-opacity duration-150 ${className}`}
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/**
 * ThemeRotateIcon: smoothly rotates and switches glyphs between Sun and Moon.
 */
export function ThemeRotateIcon({
  size = 24,
  isDark = true,
  className = "",
  ...props
}: IconProps & { isDark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center justify-center transition-transform duration-300 ${
        isDark ? "rotate-0" : "rotate-180"
      } ${className}`}
    >
      {isDark ? (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          {...props}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          {...props}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </span>
  );
}
