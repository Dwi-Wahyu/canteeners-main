import LandingTopbar from "@/components/layouts/landing-topbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCartSkeleton() {
  return (
    <div className="p-5 pt-24">
      <LandingTopbar />

      <h1 className="text-xl">Keranjang</h1>

      <div className="flex gap-4 flex-col">
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
      </div>
    </div>
  );
}
