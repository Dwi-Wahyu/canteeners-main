import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { Skeleton } from "@/components/ui/skeleton";

export default async function LoadingProductDetailPage() {
  return (
    <div>
      <TopbarWithBackButton title="Detail Produk" backUrl={"/"} />

      <div className="p-5 pt-24 flex gap-2 flex-col">
        <Skeleton className="w-full h-40" />

        <div className="flex flex-col gap-1">
          <Skeleton className="w-48 h-7" />
          <Skeleton className="w-52 h-7" />
        </div>

        <div className="flex flex-col gap-1">
          <Skeleton className="w-20 h-7" />
          <div className="flex gap-2 items-center">
            <Skeleton className="w-10 h-10" />
            <Skeleton className="w-10 h-10" />
            <Skeleton className="w-10 h-10" />
          </div>
        </div>

        <div>
          <Skeleton className="w-full h-20" />
        </div>
      </div>
    </div>
  );
}
