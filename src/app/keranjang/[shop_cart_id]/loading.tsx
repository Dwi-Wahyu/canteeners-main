import NavButton from "@/components/nav-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export default function LoadingShopCart() {
  return (
    <div>
      <div className="w-full p-4 flex justify-between items-center bg-linear-to-r text-primary-foreground from-primary to-primary/90">
        <div className="flex gap-2 items-center">
          <NavButton size="icon" variant="ghost" href="/keranjang">
            <ChevronLeft />
          </NavButton>

          <div>
            <h1 className="text-xl leading-tight">Keranjang</h1>

            <h1 className="text-sm">0 item dari Kedai</h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <Skeleton className="w-20 h-7" />

        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
      </div>
    </div>
  );
}
