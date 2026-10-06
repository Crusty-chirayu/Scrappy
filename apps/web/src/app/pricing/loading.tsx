import React from "react";
import { Skeleton } from "@scrappy/ui";

export default function PricingLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <Skeleton className="h-4 w-32 mx-auto mb-2" />
        <Skeleton className="h-10 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>

      <Skeleton className="h-48 rounded-lg w-full" />
    </div>
  );
}
