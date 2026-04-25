import NavButton from "@/components/nav-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export default function LoadingShopCart() {
  return (
    <div>
      {/* Header matching page.tsx */}
      <div className="w-full p-4 flex justify-between items-center bg-linear-to-r text-primary-foreground from-primary to-primary/90">
        <div className="flex gap-2 items-center">
          <NavButton size="icon" variant="ghost" href="/keranjang">
            <ChevronLeft />
          </NavButton>

          <div className="flex flex-col gap-1">
            <h1 className="text-xl leading-tight">Keranjang</h1>
            <Skeleton className="w-40 h-4 bg-primary-foreground/20" />
          </div>
        </div>

        <Skeleton className="w-8 h-8 rounded-full bg-primary-foreground/20" />
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Daftar Pesanan Section */}
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold mb-2">Daftar Pesanan</h1>
          <div className="flex flex-col gap-2">
            <Skeleton className="w-full h-24 rounded-lg" />
            <Skeleton className="w-full h-24 rounded-lg" />
          </div>
        </div>

        {/* Tambah Menu Section */}
        <div className="flex justify-between items-center py-2">
          <div className="flex flex-col gap-1">
            <Skeleton className="w-48 h-5" />
            <Skeleton className="w-40 h-4" />
          </div>
          <Skeleton className="w-20 h-10 rounded-md" />
        </div>

        {/* Payment Method Skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="w-32 h-5" />
          <Skeleton className="w-full h-16 rounded-lg" />
        </div>

        {/* Post Order Type Skeleton */}
        <div className="flex flex-col gap-2">
          <Skeleton className="w-40 h-5" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="w-full h-12 rounded-lg" />
            <Skeleton className="w-full h-12 rounded-lg" />
          </div>
        </div>

        {/* Pricing Summary Skeleton */}
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex justify-between">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-20 h-4" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-16 h-4" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-24 h-4" />
          </div>
          
          <div className="flex justify-between pt-4 border-t mt-2">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-28 h-6" />
          </div>
        </div>

        {/* Checkout Button Skeleton */}
        <Skeleton className="w-full h-14 rounded-lg mt-4" />
      </div>
    </div>
  );
}
