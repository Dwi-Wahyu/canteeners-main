import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingRefundList() {
  return (
    <div className="flex flex-col gap-2">
      <TopbarWithBackButton title="Kelola Refund" backUrl="/dashboard-kedai" />

      <Skeleton className="w-full h-10" />

      <div className="flex flex-col gap-4">
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-20" />
      </div>
    </div>
  );
}
