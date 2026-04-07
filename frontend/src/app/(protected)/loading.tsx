import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}