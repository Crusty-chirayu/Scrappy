import React from "react";
import { Skeleton } from "@scrappy/ui";

export default function ExtractLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse" aria-label="Loading Extract Studio">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-8 w-64 mb-1" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </div>

      {/* Stepper Skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>

      {/* Main Panel Skeleton */}
      <div className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-1)] mb-6">
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-11 w-full rounded-md mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-20 rounded-md" />
          <Skeleton className="h-20 rounded-md" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-1)]">
        <Skeleton className="h-6 w-56 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded" />
          <Skeleton className="h-14 w-full rounded" />
          <Skeleton className="h-14 w-full rounded" />
        </div>
      </div>
    </div>
  );
}
