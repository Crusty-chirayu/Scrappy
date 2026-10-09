"use client";

import React from "react";

export interface SignalMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  monochrome?: boolean;
}

/**
 * Signal Mark (v2):
 * Brief: A single-stroke 's' whose lower terminal resolves into a filled signal node
 * (messy web -> one trusted point).
 * Geometry created on a 48x48 precision grid, legible down to 16px.
 */
export function SignalMark({
  size = 48,
  className = "",
  monochrome = false,
  ...props
}: SignalMarkProps) {
  const strokeColor = monochrome ? "currentColor" : "var(--color-accent)";
  const nodeFill = monochrome ? "currentColor" : "var(--color-accent)";
  const glowGradId = React.useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Scrappy Signal Mark"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id={glowGradId} x1="6" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8A7DFF" />
          <stop offset="50%" stopColor="var(--color-accent, #6C5CFF)" />
          <stop offset="100%" stopColor="#38E8FF" />
        </linearGradient>
      </defs>

      {/* Outer subtle tile boundary for 32px+ viewports */}
      {size >= 24 && (
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="10"
          fill="var(--surface-1, #0D0F17)"
          stroke="var(--border-subtle, rgba(255,255,255,0.07))"
          strokeWidth="1.2"
        />
      )}

      {/* Single-stroke 's' ribbon transitioning from upper arc, descending diagonal cross, to terminal signal node */}
      <path
        d="M 33 14 C 33 9.5 28 8 24 8 C 17.5 8 15 12 15 15.5 C 15 21 21 23 27 25 C 33 27 34.5 30 34.5 34 C 34.5 38.5 30.5 40 24 40 C 18 40 14 36.5 14 36.5"
        stroke={monochrome ? strokeColor : `url(#${glowGradId})`}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Terminal precision signal node at (14, 36.5) */}
      <circle
        cx="14"
        cy="36.5"
        r="3.5"
        fill={nodeFill}
      />
    </svg>
  );
}

/**
 * Outlined Wordmark (no font dependency)
 */
export function SignalWordmark({
  height = 18,
  className = "",
  monochrome = false,
}: {
  height?: number;
  className?: string;
  monochrome?: boolean;
}) {
  const fill = monochrome ? "currentColor" : "var(--text-1)";
  return (
    <svg
      height={height}
      viewBox="0 0 120 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SCRAPPY"
      className={`inline-block ${className}`}
    >
      <text
        x="0"
        y="17"
        fill={fill}
        fontFamily="var(--font-mono, monospace)"
        fontWeight="700"
        fontSize="17"
        letterSpacing="0.14em"
      >
        SCRAPPY
      </text>
    </svg>
  );
}

export interface SignalLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "mark" | "wordmark" | "lockup";
  size?: number;
  monochrome?: boolean;
  className?: string;
}

export function SignalLogo({
  variant = "lockup",
  size = 32,
  monochrome = false,
  className = "",
  ...props
}: SignalLogoProps) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      {...props}
    >
      {(variant === "lockup" || variant === "mark") && (
        <SignalMark size={size} monochrome={monochrome} />
      )}
      {(variant === "lockup" || variant === "wordmark") && (
        <SignalWordmark height={Math.max(16, Math.round(size * 0.55))} monochrome={monochrome} />
      )}
    </div>
  );
}
