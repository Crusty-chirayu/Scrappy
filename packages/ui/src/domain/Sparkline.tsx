"use client";

import { useId } from "react";

export interface SparklinePoint {
  date: string;
  price: number;
}

export interface SparklineProps {
  data: number[] | SparklinePoint[];
  width?: number;
  height?: number;
  showMinMax?: boolean;
  currency?: string;
  className?: string;
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  showMinMax = false,
  currency = "INR",
  className = "",
}: SparklineProps) {
  const chartId = useId();
  const currSymbol = currency === "INR" ? "₹" : "$";

  if (!data || data.length === 0) {
    return (
      <div
        className={`inline-flex items-center justify-center text-[10px] text-[#5B677C] font-mono border border-dashed border-[#262E3C] rounded-[2px] ${className}`}
        style={{ width, height }}
      >
        No history
      </div>
    );
  }

  // Normalize points
  const points: { x: number; y: number; val: number; date?: string }[] = [];
  const rawValues = data.map((d) => (typeof d === "number" ? d : d.price));
  const rawDates = data.map((d) => (typeof d === "object" ? d.date : undefined));

  const minVal = Math.min(...rawValues);
  const maxVal = Math.max(...rawValues);
  const range = maxVal - minVal || 1;

  const paddingX = 4;
  const paddingY = 4;
  const effectiveW = width - paddingX * 2;
  const effectiveH = height - paddingY * 2;

  const n = rawValues.length;
  for (let i = 0; i < n; i++) {
    const val = rawValues[i]!;
    const x = paddingX + (n === 1 ? effectiveW / 2 : (i / (n - 1)) * effectiveW);
    // Inverted Y: lower price is at the bottom, higher at top
    const y = paddingY + effectiveH - ((val - minVal) / range) * effectiveH;
    points.push({ x, y, val, date: rawDates[i] });
  }

  const polylineCoords = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Trend: compare first and last point
  const firstVal = rawValues[0]!;
  const lastVal = rawValues[rawValues.length - 1]!;
  // Price down is green (#2FBF8A), price up is red (#F2685B), flat is neutral (#98A2B3)
  const strokeColor =
    lastVal < firstVal ? "#2FBF8A" : lastVal > firstVal ? "#F2685B" : "#98A2B3";

  const areaCoords = `${polylineCoords} ${width - paddingX},${height} ${paddingX},${height}`;

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className="relative inline-flex items-center">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
          role="img"
          aria-labelledby={`sparkline-title-${chartId}`}
        >
          <title id={`sparkline-title-${chartId}`}>
            {`Price trend: low ${currSymbol}${(minVal / 100).toFixed(0)}, high ${currSymbol}${(maxVal / 100).toFixed(0)}, current ${currSymbol}${(lastVal / 100).toFixed(0)}`}
          </title>
          <defs>
            <linearGradient id={`grad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <polygon points={areaCoords} fill={`url(#grad-${chartId})`} />

          {/* Polyline */}
          <polyline
            points={polylineCoords}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current point dot */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1]!.x}
              cy={points[points.length - 1]!.y}
              r="2.5"
              fill={strokeColor}
            />
          )}
        </svg>

        {/* Screen-reader accessible alternative table satisfying WCAG 2.2 AA */}
        <table className="sr-only">
          <caption>Price history sparkline data</caption>
          <thead>
            <tr>
              <th scope="col">Date/Point</th>
              <th scope="col">Price</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, idx) => (
              <tr key={idx}>
                <td>{p.date ?? `Point ${idx + 1}`}</td>
                <td>{currSymbol}{(p.val / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showMinMax && (
        <div className="flex items-center justify-between text-[10px] text-[#5B677C] font-mono tabular-nums px-0.5">
          <span>L: {currSymbol}{(minVal / 100).toFixed(0)}</span>
          <span>H: {currSymbol}{(maxVal / 100).toFixed(0)}</span>
        </div>
      )}
    </div>
  );
}
