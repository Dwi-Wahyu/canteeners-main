import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProductDetailPage() {
  return (
    <div>
      <TopbarWithBackButton
        title="Detail Produk"
        backUrl="/dashboard-kedai/produk"
      />

      <div className="p-5 pt-24">
        <Skeleton className="w-full h-96" />
        <Skeleton className="w-full h-96 mt-4" />
      </div>
    </div>
  );
}
