import type { HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full" | "none";
}

const roundedMap = {
  none: "rounded-none",
  sm: "rounded-[var(--radius-sm)]",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
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
      className={`animate-pulse motion-reduce:animate-none bg-[var(--surface-3)] border border-[var(--border-subtle)] ${roundedMap[rounded]} ${className}`}
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
      className={`p-5 border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface-2)] flex flex-col gap-3.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <Skeleton height={20} width="45%" />
        <Skeleton height={20} width={64} rounded="full" />
      </div>
      <SkeletonText lines={2} />
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
        <Skeleton height={24} width={100} />
        <Skeleton height={32} width={88} rounded="md" />
      </div>
    </div>
  );
}

export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr aria-hidden="true" className="border-b border-[var(--border-subtle)]">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="p-3.5">
          <Skeleton height={16} width={idx === 0 ? "80%" : "60%"} />
        </td>
      ))}
    </tr>
  );
}
