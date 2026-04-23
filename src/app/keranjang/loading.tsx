import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart } from "lucide-react";
import { BottomNav } from "@/components/layouts/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";

export default function LoadingShopCart() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-5 pb-24">
        {/* Header Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="w-5 h-5 text-primary/50" />
          <h1 className="text-lg font-semibold">Keranjang</h1>
          <Skeleton className="ml-auto w-16 h-6" />
        </div>

        {/* Cart List Skeleton */}
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                {/* Top Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>

                {/* Divider */}
                <div className="border-t mb-3" />

                {/* Bottom Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <Skeleton className="w-8 h-8 rounded-full border-2 border-background" />
                      <Skeleton className="w-8 h-8 rounded-full border-2 border-background" />
                      <Skeleton className="w-8 h-8 rounded-full border-2 border-background" />
                    </div>
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
