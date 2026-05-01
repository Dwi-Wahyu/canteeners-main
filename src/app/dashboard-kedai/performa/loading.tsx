import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PerformaLoading() {
  return (
    <div className="space-y-5">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rank Card Skeleton */}
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-4 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
            <div className="flex items-center gap-1 mt-2">
              <Skeleton className="size-3 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Stats Skeleton Area */}
        <div className="md:col-span-2 space-y-4">
          {/* Tabs Skeleton */}
          <Skeleton className="h-10 w-full rounded-lg" />

          {/* 6 Stats Cards Skeleton Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="size-4 rounded-full" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}

            {/* Chart Card Skeleton */}
            <Card className="col-span-2">
              <CardHeader>
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full rounded-xl" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Best Selling Products Skeleton */}
      <div className="space-y-4 mt-8">
        <Skeleton className="h-6 w-40" />
        <div className="bg-white rounded-2xl border p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
