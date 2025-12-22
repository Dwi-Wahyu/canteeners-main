import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProductsPage() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <Skeleton className="w-36 h-7" />

        <Skeleton className="w-32 h-7" />
      </div>

      <Skeleton className="w-full h-10 my-4" />

      <div className="grid mt-4 grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="w-full h-44" />
        <Skeleton className="w-full h-44" />
        <Skeleton className="w-full h-44" />
      </div>
    </div>
  );
}
