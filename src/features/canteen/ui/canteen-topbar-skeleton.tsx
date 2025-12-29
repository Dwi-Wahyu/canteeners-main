import { Skeleton } from "@/components/ui/skeleton";

export function CanteenTopbarSkeleton() {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <Skeleton className="h-10 w-full max-w-sm rounded-md" />

      <div className="flex gap-2">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    </div>
  );
}
