import React from "react";
import { Skeleton } from "@scrappy/ui";

export default function OnboardingLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
      <div className="text-center mb-8">
        <Skeleton className="h-4 w-32 mx-auto mb-2" />
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-8">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>

      <div className="p-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-1)] space-y-4">
        <Skeleton className="h-6 w-56" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
