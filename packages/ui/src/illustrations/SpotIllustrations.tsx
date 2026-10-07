import React from "react";

export interface SpotIllustrationProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Spot illustrations (120px) using the Signal grammar:
 * Traces converging on a node, with precision lines and clean geometry.
 */

// 1. Empty State
export function SignalEmptySpot({ size = 120, className = "", title = "No records", ...props }: SpotIllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={title} className={`text-[var(--text-3)] ${className}`} {...props}>
      <rect x="12" y="12" width="96" height="96" rx="14" stroke="var(--border-strong)" strokeDasharray="3 3" />
      <path d="M28 84 C 44 84 48 56 60 56 C 72 56 76 74 92 74" stroke="var(--border)" />
      <line x1="28" y1="92" x2="92" y2="92" stroke="var(--border-subtle)" />
      <circle cx="60" cy="56" r="12" stroke="var(--color-accent)" strokeWidth="1.2" strokeDasharray="2 3" />
      <circle cx="60" cy="56" r="4" fill="var(--color-accent)" />
    </svg>
  );
}

// 2. Error State
export function SignalErrorSpot({ size = 120, className = "", title = "Stream interrupted", ...props }: SpotIllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={title} className={`text-[var(--text-3)] ${className}`} {...props}>
      <rect x="12" y="12" width="96" height="96" rx="14" stroke="var(--border-strong)" />
      <path d="M28 72 L 52 50 L 64 62" stroke="var(--border)" />
      <line x1="72" y1="46" x2="92" y2="68" stroke="var(--border)" strokeDasharray="2 3" />
      <circle cx="68" cy="38" r="14" stroke="var(--color-danger)" strokeDasharray="2 2" />
      <path d="M68 32 L 68 40" stroke="var(--color-danger)" strokeWidth="1.8" />
      <circle cx="68" cy="44" r="1" fill="var(--color-danger)" stroke="none" />
    </svg>
  );
}

// 3. Offline State
export function SignalOfflineSpot({ size = 120, className = "", title = "Connection offline", ...props }: SpotIllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={title} className={`text-[var(--text-3)] ${className}`} {...props}>
      <rect x="12" y="12" width="96" height="96" rx="14" stroke="var(--border-strong)" />
      <circle cx="60" cy="60" r="32" stroke="var(--border-subtle)" strokeDasharray="3 4" />
      <circle cx="60" cy="60" r="20" stroke="var(--border)" strokeDasharray="2 3" />
      <circle cx="60" cy="60" r="10" stroke="var(--border-strong)" />
      <circle cx="60" cy="60" r="3.5" fill="var(--color-warn)" stroke="none" />
      <path d="M54 88 L 60 60 L 66 88" stroke="var(--border-strong)" />
    </svg>
  );
}

// 4. 404 State
export function SignalNotFoundSpot({ size = 120, className = "", title = "Not found", ...props }: SpotIllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={title} className={`text-[var(--text-3)] ${className}`} {...props}>
      <rect x="12" y="12" width="96" height="96" rx="14" stroke="var(--border-strong)" />
      <path d="M36 48 L 36 64 L 48 64 M 45 42 L 45 74" stroke="var(--color-accent)" strokeWidth="1.8" />
      <rect x="54" y="44" width="16" height="28" rx="4" stroke="var(--color-accent)" strokeWidth="1.8" />
      <path d="M78 48 L 78 64 L 90 64 M 87 42 L 87 74" stroke="var(--color-accent)" strokeWidth="1.8" />
      <circle cx="60" cy="90" r="3" fill="var(--color-accent)" />
    </svg>
  );
}

// 5. Onboarding State
export function SignalOnboardingSpot({ size = 120, className = "", title = "Welcome to Signal", ...props }: SpotIllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={title} className={`text-[var(--text-3)] ${className}`} {...props}>
      <rect x="12" y="12" width="96" height="96" rx="14" stroke="var(--border-strong)" />
      {/* 3 converging traces onto one target node */}
      <path d="M26 36 C 42 36 48 54 60 58" stroke="var(--color-accent)" strokeWidth="1.8" />
      <path d="M26 60 C 44 60 50 60 60 60" stroke="var(--color-accent)" strokeWidth="1.8" />
      <path d="M26 84 C 42 84 48 66 60 62" stroke="var(--color-accent)" strokeWidth="1.8" />
      <circle cx="60" cy="60" r="14" stroke="var(--color-accent)" strokeDasharray="3 3" />
      <circle cx="60" cy="60" r="5" fill="var(--color-accent)" />
      <line x1="65" y1="60" x2="94" y2="60" stroke="var(--border-strong)" strokeDasharray="2 2" />
      <circle cx="94" cy="60" r="2.5" fill="var(--color-success)" />
    </svg>
  );
}

// 6. Success / Verified State
export function SignalVerifiedSpot({ size = 120, className = "", title = "Verified match", ...props }: SpotIllustrationProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={title} className={`text-[var(--text-3)] ${className}`} {...props}>
      <rect x="12" y="12" width="96" height="96" rx="14" stroke="var(--border-strong)" />
      <circle cx="60" cy="58" r="22" stroke="var(--color-success)" strokeWidth="1.6" />
      <polyline points="50 58 57 65 72 50" stroke="var(--color-success)" strokeWidth="2" />
      <circle cx="60" cy="92" r="3" fill="var(--color-success)" />
    </svg>
  );
}
