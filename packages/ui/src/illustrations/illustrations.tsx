import React from "react";

export interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
  className?: string;
  title?: string;
}

/**
 * EmptyStateIllustration:
 * Calm, abstract price ledger with faint grid lines, unpopulated coordinate node,
 * and a subtle beacon. Built purely with 1.5 stroke and design tokens.
 */
export function EmptyStateIllustration({
  width = 240,
  height = 160,
  className = "",
  title = "No data found",
  ...props
}: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={title}
      className={`text-[var(--text-3)] ${className}`}
      {...props}
    >
      {/* Background Frame / Ledger outline */}
      <rect
        x="20"
        y="20"
        width="200"
        height="120"
        rx="8"
        stroke="var(--border)"
        strokeDasharray="4 4"
      />
      {/* Coordinate axes */}
      <line x1="40" y1="40" x2="40" y2="120" stroke="var(--border-strong)" />
      <line x1="40" y1="120" x2="200" y2="120" stroke="var(--border-strong)" />

      {/* Subtle guide lines */}
      <line x1="40" y1="65" x2="200" y2="65" stroke="var(--border-subtle)" strokeDasharray="2 4" />
      <line x1="40" y1="90" x2="200" y2="90" stroke="var(--border-subtle)" strokeDasharray="2 4" />

      {/* Ghost dashed trendline */}
      <path
        d="M40 100 Q 80 110, 110 85 T 180 75"
        stroke="var(--border)"
        strokeDasharray="3 3"
      />

      {/* Central Waiting Beacon Node */}
      <circle cx="120" cy="85" r="16" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="120" cy="85" r="6" stroke="var(--color-accent)" strokeWidth="1.5" />
      <circle cx="120" cy="85" r="2" fill="var(--color-accent)" />
    </svg>
  );
}

/**
 * ErrorStateIllustration:
 * Discontinuous graph trajectory with warning node beacon indicating a failed telemetry stream.
 */
export function ErrorStateIllustration({
  width = 240,
  height = 160,
  className = "",
  title = "Telemetry error",
  ...props
}: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={title}
      className={`text-[var(--text-3)] ${className}`}
      {...props}
    >
      {/* Outer border */}
      <rect
        x="20"
        y="20"
        width="200"
        height="120"
        rx="8"
        stroke="var(--border)"
      />
      {/* Grid */}
      <line x1="40" y1="120" x2="200" y2="120" stroke="var(--border-strong)" />
      <line x1="40" y1="70" x2="200" y2="70" stroke="var(--border-subtle)" strokeDasharray="2 4" />

      {/* Incoming line */}
      <path d="M40 95 L 85 75 L 110 85" stroke="var(--border-strong)" />

      {/* Broken Gap */}
      <circle cx="110" cy="85" r="3" stroke="var(--border-strong)" />

      {/* Fault Beacon */}
      <circle cx="140" cy="55" r="12" stroke="var(--color-danger)" strokeDasharray="2 2" />
      <path d="M140 47 L 140 57" stroke="var(--color-danger)" strokeWidth="1.8" />
      <circle cx="140" cy="62" r="1" fill="var(--color-danger)" stroke="none" />

      {/* Interrupted trail */}
      <line x1="165" y1="80" x2="195" y2="70" stroke="var(--border)" strokeDasharray="2 4" />
    </svg>
  );
}

/**
 * OfflineStateIllustration:
 * Precision radar / beacon seeking connection pulses.
 */
export function OfflineStateIllustration({
  width = 240,
  height = 160,
  className = "",
  title = "Connection offline",
  ...props
}: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={title}
      className={`text-[var(--text-3)] ${className}`}
      {...props}
    >
      <rect
        x="20"
        y="20"
        width="200"
        height="120"
        rx="8"
        stroke="var(--border)"
      />
      {/* Radio concentric pulses searching */}
      <circle cx="120" cy="85" r="45" stroke="var(--border-subtle)" strokeDasharray="4 6" />
      <circle cx="120" cy="85" r="30" stroke="var(--border)" strokeDasharray="3 4" />
      <circle cx="120" cy="85" r="16" stroke="var(--border-strong)" />
      <circle cx="120" cy="85" r="4" fill="var(--color-warn)" stroke="none" />

      {/* Base antenna mast */}
      <path d="M110 120 L 120 85 L 130 120" stroke="var(--border-strong)" />
      <line x1="105" y1="120" x2="135" y2="120" stroke="var(--border-strong)" />

      {/* Signal indicator tick */}
      <line x1="120" y1="65" x2="120" y2="55" stroke="var(--color-warn)" strokeDasharray="2 2" />
    </svg>
  );
}

/**
 * NotFoundIllustration:
 * Abstract 404 node coordinate matrix where coordinates are out of bounds.
 */
export function NotFoundIllustration({
  width = 240,
  height = 160,
  className = "",
  title = "404 Page not found",
  ...props
}: IllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={title}
      className={`text-[var(--text-3)] ${className}`}
      {...props}
    >
      <rect
        x="20"
        y="20"
        width="200"
        height="120"
        rx="8"
        stroke="var(--border)"
      />

      {/* 404 Geometric numerals rendered with precise instrument lines */}
      <g stroke="var(--color-accent)" strokeWidth="1.8">
        {/* '4' */}
        <polyline points="65 60 65 85 85 85" />
        <line x1="80" y1="50" x2="80" y2="100" />

        {/* '0' */}
        <rect x="105" y="55" width="30" height="45" rx="6" />

        {/* '4' */}
        <polyline points="155 60 155 85 175 85" />
        <line x1="170" y1="50" x2="170" y2="100" />
      </g>

      {/* Calibration coordinate crosshairs */}
      <line x1="28" y1="28" x2="36" y2="28" stroke="var(--border-strong)" />
      <line x1="28" y1="28" x2="28" y2="36" stroke="var(--border-strong)" />
      <line x1="212" y1="28" x2="204" y2="28" stroke="var(--border-strong)" />
      <line x1="212" y1="28" x2="212" y2="36" stroke="var(--border-strong)" />
      <line x1="28" y1="132" x2="36" y2="132" stroke="var(--border-strong)" />
      <line x1="28" y1="132" x2="28" y2="124" stroke="var(--border-strong)" />
      <line x1="212" y1="132" x2="204" y2="132" stroke="var(--border-strong)" />
      <line x1="212" y1="132" x2="212" y2="124" stroke="var(--border-strong)" />

      {/* Faint coordinate label */}
      <text
        x="120"
        y="125"
        fill="var(--text-3)"
        stroke="none"
        fontSize="9"
        fontFamily="var(--font-mono)"
        textAnchor="middle"
      >
        INDEX_OUT_OF_BOUNDS [404]
      </text>
    </svg>
  );
}
