import { cn } from '../lib/cn';

/** Satu baris skeleton. */
export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4', className)} />;
}

/** Skeleton panel hasil — meniru bentuk dokumen yang sedang dibuat. */
export function ResultSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <SkeletonLine className="h-6 w-2/3" />
      <div className="space-y-2">
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-11/12" />
        <SkeletonLine className="w-4/5" />
      </div>
      <SkeletonLine className="h-5 w-1/3" />
      <div className="space-y-2">
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-10/12" />
        <SkeletonLine className="w-9/12" />
      </div>
      <SkeletonLine className="h-5 w-2/5" />
      <div className="space-y-2">
        <SkeletonLine className="w-11/12" />
        <SkeletonLine className="w-3/4" />
      </div>
    </div>
  );
}
