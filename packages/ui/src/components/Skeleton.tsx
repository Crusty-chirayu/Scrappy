import type { HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "full" | "none";
}

const roundedMap = {
  none: "rounded-none",
  sm: "rounded-[2px]",
  md: "rounded-[4px]",
  full: "rounded-full",
};

export function Skeleton({
  width,
  height,
  rounded = "sm",
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-[#1A202B] ${roundedMap[rounded]} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={`flex flex-col gap-2 w-full ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 && lines > 1 ? "65%" : "100%"}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`p-4 border border-[#262E3C] rounded-[4px] bg-[#0F1217] flex flex-col gap-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <Skeleton height={18} width="40%" />
        <Skeleton height={18} width={60} rounded="full" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center justify-between pt-2 border-t border-[#1A202B]">
        <Skeleton height={24} width={90} />
        <Skeleton height={28} width={80} />
      </div>
    </div>
  );
}

export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr aria-hidden="true" className="border-b border-[#1A202B]">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="p-3">
          <Skeleton height={16} width={idx === 0 ? "80%" : "60%"} />
        </td>
      ))}
    </tr>
  );
}
