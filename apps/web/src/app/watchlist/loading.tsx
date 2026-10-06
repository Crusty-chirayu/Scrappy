import React from "react";
import { Skeleton } from "@scrappy/ui";

export default function WatchlistLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-default)]">
        <div className="space-y-2">
          <Skeleton className="w-48 h-8 rounded" />
          <Skeleton className="w-80 h-4 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-28 h-11 rounded" />
          <Skeleton className="w-36 h-11 rounded" />
        </div>
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-20 h-9 rounded" />
        <Skeleton className="w-24 h-9 rounded" />
        <Skeleton className="w-24 h-9 rounded" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-0)] overflow-hidden p-4 space-y-3">
        <Skeleton className="w-full h-10 rounded" />
        <Skeleton className="w-full h-16 rounded" />
        <Skeleton className="w-full h-16 rounded" />
        <Skeleton className="w-full h-16 rounded" />
        <Skeleton className="w-full h-16 rounded" />
        <Skeleton className="w-full h-16 rounded" />
      </div>
    </div>
  );
}
