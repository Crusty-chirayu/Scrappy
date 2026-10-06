import React from "react";
import { Skeleton } from "@scrappy/ui";

export default function AlertsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2 pb-6 border-b border-[var(--border-default)]">
        <Skeleton className="w-48 h-8 rounded" />
        <Skeleton className="w-96 h-4 rounded" />
      </div>

      {/* Rule composer skeleton */}
      <div className="p-6 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-0)] space-y-4">
        <Skeleton className="w-64 h-6 rounded" />
        <Skeleton className="w-full h-14 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
        </div>
        <Skeleton className="w-36 h-11 rounded" />
      </div>

      {/* Rules list skeleton */}
      <div className="space-y-3">
        <Skeleton className="w-48 h-5 rounded" />
        <Skeleton className="w-full h-24 rounded" />
        <Skeleton className="w-full h-24 rounded" />
        <Skeleton className="w-full h-24 rounded" />
      </div>
    </div>
  );
}
