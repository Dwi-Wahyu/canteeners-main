import LandingTopbar from "@/components/layouts/landing-topbar";
import { Skeleton } from "@/components/ui/skeleton";
import CanteenTopbar from "@/features/canteen/ui/canteen-topbar";

export default function LoadingCanteenPage() {
  return (
    <div>
      <LandingTopbar />

      <div className="mt-20">
        <CanteenTopbar shopCount={0} />

        {/* Banner Slider Skeleton */}
        <div className="p-5">
          <Skeleton className="w-full h-[200px] rounded-xl" />
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Category Scroller Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-7 w-24" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col justify-center items-center">

                  <Skeleton className="h-24 w-24 rounded-lg shrink-0" />

                  <Skeleton className="w-14 mt-2 h-6" />
                </div>
              ))}
            </div>
          </div>

          {/* Shop Cards Skeleton */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-6 shadow-sm">
              <div className="flex gap-4">
                <Skeleton className="aspect-square w-1/3 rounded-lg" />
                <div className="flex flex-col justify-between w-full">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-40 mt-2" />
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
