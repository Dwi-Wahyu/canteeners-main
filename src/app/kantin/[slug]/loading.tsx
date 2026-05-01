import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/layouts/bottom-nav";

export default function LoadingCanteenPage() {
  return (
    <div className="min-h-screen bg-[#f6faff] pb-32">
      {/* ── Sticky Search Bar Skeleton ── */}
      <div className="sticky top-0 z-30 bg-[#f6faff]/92 backdrop-blur-md px-4 pt-4 pb-3">
        <div className="flex items-center bg-[#e6eff8] rounded-2xl px-4 py-3 gap-3">
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <div className="w-px h-5 bg-[#c8d4e0]" />
          <Skeleton className="size-5 rounded-md" />
        </div>
      </div>

      {/* ── Category Filter Skeleton ── */}
      <div className="flex overflow-x-auto py-2 px-4 gap-4 no-scrollbar">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <Skeleton className="w-14 h-14 rounded-xl" />
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>

      {/* ── Segmented Tab Skeleton ── */}
      <div className="px-4 mb-5 mt-4">
        <div className="flex bg-[#e6eff8] rounded-2xl p-1 gap-2">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 flex-1 rounded-xl" />
        </div>
      </div>

      {/* ── Tab Content: Menu Skeleton ── */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-16" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col"
            >
              {/* Product Image Skeleton */}
              <Skeleton className="h-32 w-full" />

              {/* Product Info Skeleton */}
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex items-center justify-between mt-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="size-8 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
