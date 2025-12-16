import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCartSkeleton() {
  return (
    <div className="flex gap-4 p-5 flex-col">
      <Skeleton className="w-full h-20" />
      <Skeleton className="w-full h-20" />
      <Skeleton className="w-full h-20" />
      <Skeleton className="w-full h-20" />
    </div>
  );
}
