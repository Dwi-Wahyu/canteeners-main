import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingEditProductPage() {
  return (
    <div>
      <TopbarWithBackButton
        title="Edit Produk"
        backUrl="/dashboard-kedai/produk"
      />

      <div className="p-5 pt-20 flex flex-col gap-4">
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-28" />
      </div>
    </div>
  );
}
