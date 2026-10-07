import React from "react";

export interface ProductSilhouetteProps extends React.SVGProps<SVGSVGElement> {
  category: "phone" | "laptop" | "audio" | "watch" | "tv" | "shoe" | "appliance" | "grocery" | string;
  size?: number | string;
  className?: string;
}

/**
 * Product Silhouette (v2):
 * 4:3 tiles: a soft category-hued gradient wash, a refined geometric silhouette built from 3–5 shapes,
 * a consistent top-left light source, a subtle floor shadow, and a hairline inner border.
 */
export function ProductSilhouette({
  category,
  size = "100%",
  className = "",
  ...props
}: ProductSilhouetteProps) {
  const gradId = React.useId();
  const shadowId = React.useId();

  // Subtle category tints
  const categoryGradients: Record<string, { start: string; end: string }> = {
    phone: { start: "#1D2333", end: "#0F121C" },
    laptop: { start: "#202636", end: "#10141E" },
    audio: { start: "#272138", end: "#13101C" },
    watch: { start: "#1D2833", end: "#0F161C" },
    tv: { start: "#202433", end: "#10131C" },
    shoe: { start: "#2D2622", end: "#161311" },
    appliance: { start: "#222A2D", end: "#111617" },
    grocery: { start: "#1E2A22", end: "#0E1511" },
  };

  const defaultGrad = { start: "#1D2333", end: "#0F121C" };
  const currentGrad = categoryGradients[category.toLowerCase()] ?? defaultGrad;

  return (
    <svg
      viewBox="0 0 160 120"
      width={size}
      height={typeof size === "number" ? Math.round(size * 0.75) : "auto"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${category} illustration`}
      className={`rounded-lg overflow-hidden shrink-0 select-none ${className}`}
      {...props}
    >
      <defs>
        {/* Soft Category Wash */}
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={currentGrad.start} />
          <stop offset="100%" stopColor={currentGrad.end} />
        </linearGradient>

        {/* Floor Shadow */}
        <radialGradient id={shadowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0, 0, 0, 0.45)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Background card with 1px inner highlight */}
      <rect width="160" height="120" rx="8" fill={`url(#${gradId})`} />
      <rect
        x="0.5"
        y="0.5"
        width="159"
        height="119"
        rx="7.5"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth="1"
      />

      {/* Subtle floor contact shadow */}
      <ellipse cx="80" cy="98" rx="42" ry="6" fill={`url(#${shadowId})`} />

      {/* Category Silhouettes */}
      {category.toLowerCase() === "phone" && (
        <g transform="translate(62, 22)">
          {/* Phone body */}
          <rect x="0" y="0" width="36" height="70" rx="7" fill="#2A3144" stroke="#4B556D" strokeWidth="1.2" />
          {/* Screen */}
          <rect x="2.5" y="4" width="31" height="62" rx="4" fill="#141722" />
          {/* Dynamic island / pill */}
          <rect x="12" y="6" width="12" height="2.5" rx="1.2" fill="#090A0F" />
          {/* Home indicator */}
          <rect x="12" y="62" width="12" height="1.5" rx="0.75" fill="#3D4558" />
        </g>
      )}

      {category.toLowerCase() === "laptop" && (
        <g transform="translate(38, 30)">
          {/* Display */}
          <rect x="10" y="0" width="64" height="42" rx="4" fill="#2B3346" stroke="#4B5670" strokeWidth="1.2" />
          <rect x="13" y="3" width="58" height="36" rx="2" fill="#131622" />
          {/* Base */}
          <path d="M 0 46 L 84 46 L 80 54 L 4 54 Z" fill="#343E54" stroke="#4B5670" strokeWidth="1" />
          {/* Trackpad */}
          <rect x="34" y="48" width="16" height="4" rx="1" fill="#252D3F" />
        </g>
      )}

      {category.toLowerCase() === "audio" && (
        <g transform="translate(50, 24)">
          {/* Headband */}
          <path d="M 8 46 C 8 16 52 16 52 46" fill="none" stroke="#4A455C" strokeWidth="3.5" strokeLinecap="round" />
          {/* Earcups */}
          <rect x="2" y="40" width="14" height="26" rx="6" fill="#322C42" stroke="#5B5373" strokeWidth="1.2" />
          <rect x="44" y="40" width="14" height="26" rx="6" fill="#322C42" stroke="#5B5373" strokeWidth="1.2" />
          {/* Cushion detail */}
          <rect x="12" y="44" width="4" height="18" rx="2" fill="#221D2E" />
          <rect x="44" y="44" width="4" height="18" rx="2" fill="#221D2E" />
        </g>
      )}

      {category.toLowerCase() === "watch" && (
        <g transform="translate(60, 18)">
          {/* Straps */}
          <rect x="10" y="0" width="20" height="20" rx="3" fill="#293A48" />
          <rect x="10" y="58" width="20" height="20" rx="3" fill="#293A48" />
          {/* Watch case */}
          <rect x="3" y="16" width="34" height="44" rx="10" fill="#2B3E4E" stroke="#4C657A" strokeWidth="1.2" />
          <rect x="6" y="19" width="28" height="38" rx="7" fill="#101820" />
          {/* Dial indicator */}
          <circle cx="20" cy="38" r="7" stroke="#375066" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="20" y1="38" x2="20" y2="34" stroke="var(--color-accent, #6C5CFF)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      {category.toLowerCase() === "tv" && (
        <g transform="translate(32, 24)">
          {/* Screen Frame */}
          <rect x="0" y="0" width="96" height="54" rx="3" fill="#282E40" stroke="#444C63" strokeWidth="1.2" />
          <rect x="3" y="3" width="90" height="48" rx="1.5" fill="#10121B" />
          {/* Stand legs */}
          <line x1="16" y1="54" x2="10" y2="68" stroke="#3E4559" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="80" y1="54" x2="86" y2="68" stroke="#3E4559" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {category.toLowerCase() === "shoe" && (
        <g transform="translate(42, 34)">
          {/* Sole */}
          <path d="M 6 44 Q 40 46 72 40 Q 76 40 76 44 L 4 44 Z" fill="#4B3D34" stroke="#68574B" strokeWidth="1" />
          {/* Upper shoe silhouette */}
          <path d="M 4 44 C 4 30 18 20 28 20 C 38 20 44 26 56 32 C 66 36 76 38 76 42 Z" fill="#3D3028" stroke="#68574B" strokeWidth="1.2" />
          {/* Collar opening */}
          <ellipse cx="26" cy="22" rx="7" ry="3" fill="#1C1613" />
        </g>
      )}

      {category.toLowerCase() === "appliance" && (
        <g transform="translate(54, 20)">
          {/* Main unit */}
          <rect x="0" y="0" width="52" height="72" rx="6" fill="#2E3A3E" stroke="#485A60" strokeWidth="1.2" />
          <rect x="6" y="8" width="40" height="24" rx="4" fill="#161E20" stroke="#39484D" strokeWidth="1" />
          {/* Circular control dial */}
          <circle cx="26" cy="50" r="10" fill="#202A2D" stroke="#485A60" strokeWidth="1.2" />
          <circle cx="26" cy="50" r="3" fill="var(--color-accent, #6C5CFF)" />
        </g>
      )}

      {category.toLowerCase() === "grocery" && (
        <g transform="translate(56, 22)">
          {/* Pouch / Box contour */}
          <path d="M 6 12 L 42 12 L 46 68 L 2 68 Z" fill="#2B3D30" stroke="#445C4B" strokeWidth="1.2" />
          {/* Top seal */}
          <rect x="4" y="8" width="40" height="6" rx="2" fill="#395040" stroke="#52705B" strokeWidth="1" />
          {/* Front stamp */}
          <circle cx="24" cy="40" r="11" fill="#162019" stroke="#3E5744" strokeWidth="1" />
          <line x1="17" y1="40" x2="31" y2="40" stroke="var(--color-success, #2FBF8A)" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
}
