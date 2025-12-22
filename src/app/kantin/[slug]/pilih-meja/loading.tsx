import NavButton from "@/components/nav-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";

export default function LoadingChooseTablePage() {
  return (
    <div>
      <div className="w-full p-4 flex items-center bg-linear-to-r text-primary-foreground from-primary to-primary/90">
        <NavButton size="icon" variant="ghost" href="/keranjang">
          <ChevronLeft />
        </NavButton>

        <h1 className="text-xl leading-tight">Pilih Meja </h1>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <Skeleton className="w-40 h-8" />

        <Skeleton className="w-full h-20" />

        <Skeleton className="w-full h-52" />

        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
        </div>
      </div>
    </div>
  );
}
