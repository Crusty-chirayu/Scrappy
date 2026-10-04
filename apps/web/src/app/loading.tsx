import { Skeleton, SkeletonCard } from "@scrappy/ui";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="root-loading-skeleton"
      className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6"
    >
      <div className="space-y-2">
        <Skeleton width="160px" height="16px" />
        <Skeleton width="280px" height="32px" />
        <Skeleton width="400px" height="14px" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
