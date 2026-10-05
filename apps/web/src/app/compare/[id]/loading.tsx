import React from "react";
import { Skeleton } from "@scrappy/ui";

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-12 h-3 rounded" />
        <span className="text-[var(--text-3)]">/</span>
        <Skeleton className="w-16 h-3 rounded" />
        <span className="text-[var(--text-3)]">/</span>
        <Skeleton className="w-24 h-3 rounded" />
      </div>

      {/* Hero Header Skeleton */}
      <div className="pb-6 border-b border-[var(--border-default)] flex flex-col lg:flex-row justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="w-20 h-5 rounded" />
            <Skeleton className="w-24 h-5 rounded" />
            <Skeleton className="w-16 h-5 rounded" />
          </div>
          <Skeleton className="w-3/4 h-8 rounded" />
          <Skeleton className="w-1/2 h-4 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-36 h-11 rounded" />
          <Skeleton className="w-20 h-11 rounded" />
        </div>
      </div>

      {/* Financial Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-[var(--radius-lg)] bg-[var(--surface-0)] border border-[var(--border-default)] space-y-3">
          <Skeleton className="w-32 h-4 rounded" />
          <Skeleton className="w-48 h-8 rounded" />
          <Skeleton className="w-full h-4 rounded" />
        </div>
        <div className="p-5 rounded-[var(--radius-lg)] bg-[var(--surface-0)] border border-[var(--border-default)] space-y-3">
          <Skeleton className="w-28 h-4 rounded" />
          <Skeleton className="w-full h-12 rounded" />
          <Skeleton className="w-40 h-4 rounded" />
        </div>
        <div className="p-5 rounded-[var(--radius-lg)] bg-[var(--surface-0)] border border-[var(--border-default)] space-y-3">
          <Skeleton className="w-36 h-4 rounded" />
          <Skeleton className="w-full h-12 rounded" />
          <Skeleton className="w-32 h-4 rounded" />
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="h-72 rounded-[var(--radius-lg)] bg-[var(--surface-0)] border border-[var(--border-default)] p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <Skeleton className="w-40 h-5 rounded" />
          <Skeleton className="w-48 h-8 rounded" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="w-full h-40 rounded" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
        </div>
      </div>

      {/* Retailer Table Skeleton */}
      <div className="rounded-[var(--radius-lg)] bg-[var(--surface-0)] border border-[var(--border-default)] p-6 space-y-4">
        <Skeleton className="w-48 h-6 rounded" />
        <div className="space-y-3">
          <Skeleton className="w-full h-12 rounded" />
          <Skeleton className="w-full h-12 rounded" />
          <Skeleton className="w-full h-12 rounded" />
          <Skeleton className="w-full h-12 rounded" />
        </div>
      </div>
    </div>
  );
}
