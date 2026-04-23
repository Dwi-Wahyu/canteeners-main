import { Skeleton } from "@/components/ui/skeleton";
import { CanteenTopbarSkeleton } from "@/features/canteen/ui/canteen-topbar-skeleton";
import { BottomNav } from "@/components/layouts/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";

export default function LoadingCanteenPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Search Bar */}
      <CanteenTopbarSkeleton />

      {/* Category Filter Skeleton */}
      <section className="mb-2 overflow-visible mt-2">
        <div className="flex justify-between items-end mb-4 px-5">
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-48 mt-1.5" />
          </div>
        </div>

        <div className="flex overflow-x-auto pt-2 pb-4 px-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </section>

      {/* Tabs Skeleton */}
      <div className="px-5 mb-4">
        <div className="flex p-1 bg-muted rounded-lg w-full">
          <div className="h-9 w-1/2 bg-background rounded-md shadow-sm border" />
          <div className="h-9 w-1/2" />
        </div>
      </div>

      {/* Product List Skeleton (Default Tab: Menu) */}
      <div className="flex flex-col gap-5 p-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="relative">
            <Card>
              <CardContent className="flex gap-4 p-4">
                <Skeleton className="aspect-square w-1/3 rounded-lg" />

                <div className="flex flex-col justify-between w-full">
                  <div>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-5 w-24 mt-2" />
                </div>
              </CardContent>
            </Card>
            <Skeleton className="h-8 w-8 rounded-full absolute bottom-4 right-4" />
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
