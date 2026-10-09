"use client";

import React from "react";

export type LogoVariant = "combined" | "mark" | "wordmark";
export type LogoSize = 16 | 24 | 32 | 48 | 64;

export interface ScrappyLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LogoVariant;
  size?: number;
  monochrome?: boolean;
  state?: "live" | "stale" | "fixture" | string;
  showLabel?: boolean;
  className?: string;
}

/**
 * ScrappyMark:
 * Geometric brand mark constructed on a 32x32 precision coordinate grid:
 * - 4px outer rounded contour
 * - Precision axis crosshairs at (16, 16)
 * - Dynamic trend delta vector from (8, 22) to (24, 10)
 * - Central luminous coordinate node (cx=16, cy=16, r=3.5)
 * Legible at 16px, 32px, and in monochrome.
 */
export function ScrappyMark({
  size = 32,
  monochrome = false,
  className = "",
}: {
  size?: number;
  monochrome?: boolean;
  className?: string;
}) {
  const accentColor = monochrome ? "currentColor" : "var(--color-accent)";
  const bgFill = monochrome ? "none" : "var(--surface-3)";
  const strokeColor = monochrome ? "currentColor" : "var(--border-strong)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Scrappy Brand Mark"
      className={`inline-block shrink-0 ${className}`}
    >
      {/* Outer precision tile */}
      <rect
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="5"
        fill={bgFill}
        stroke={strokeColor}
        strokeWidth="1.5"
      />

      {/* Reticle coordinate axes (omitted at <= 20px to prevent subpixel blur) */}
      {size >= 24 && (
        <>
          <line x1="6" y1="16" x2="26" y2="16" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="2 2" />
          <line x1="16" y1="6" x2="16" y2="26" stroke={strokeColor} strokeWidth="1.2" strokeDasharray="2 2" />
        </>
      )}

      {/* Trend vector ray (upward price discovery) */}
      <path
        d="M9 22L16 16L23 10"
        stroke={accentColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 10H23V15"
        stroke={accentColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center node */}
      <circle cx="16" cy="16" r="3.2" fill={accentColor} />
    </svg>
  );
}

/**
 * ScrappyLogo:
 * Unified brand logo handling mark, wordmark, and combined layouts.
 */
export function ScrappyLogo({
  variant = "combined",
  size = 32,
  monochrome = false,
  showLabel,
  state: _state,
  className = "",
  ...props
}: ScrappyLogoProps) {
  const textSizeClass =
    size <= 20
      ? "text-xs tracking-wider"
      : size <= 28
        ? "text-sm tracking-wider"
        : size <= 40
          ? "text-base tracking-widest"
          : "text-xl tracking-widest";

  return (
    <div
      data-state={_state}
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      {...props}
    >
      {(variant === "combined" || variant === "mark") && (
        <ScrappyMark size={size} monochrome={monochrome} />
      )}

      {showLabel !== false && (variant === "combined" || variant === "wordmark") && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={`font-mono font-bold uppercase ${textSizeClass} ${
              monochrome ? "text-current" : "text-[var(--text-1)]"
            }`}
          >
            SCRAPPY
          </span>
          {size >= 32 && (
            <span className="text-[10px] font-mono tracking-normal text-[var(--text-3)] uppercase mt-0.5">
              Precision Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
}
