import NavButton from "@/components/nav-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export default function OrderPaymentLoading() {
  return (
    <div>
      <div className="w-full p-4 gap-2 flex items-center bg-linear-to-r text-primary-foreground from-primary to-primary/90">
        <NavButton size="icon" variant="ghost" href={"/chat/"}>
          <ChevronLeft />
        </NavButton>

        <h1 className="text-lg font-semibold">Pembayaran</h1>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <Skeleton className="w-full h-20" />

        <Skeleton className="w-full h-40" />

        <Skeleton className="w-40 h-7" />
        <Skeleton className="w-full h-12" />
      </div>
    </div>
  );
}
