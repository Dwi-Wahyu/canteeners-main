import { Skeleton } from "@/components/ui/skeleton";
import CanteenTopbar from "@/features/canteen/ui/canteen-topbar";

export default function LoadingCanteenPage() {
    return <div>
        <CanteenTopbar shopCount={0} />

        <div className="p-5 flex-col flex gap-5">
            <Skeleton className="w-full h-10" />

            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="w-full h-10" />
                <Skeleton className="w-full h-10" />
            </div>

            <div className="flex gap-4">
                <Skeleton className="w-1/3 h-30 rounded-full" />
                <Skeleton className="w-1/3 h-30 rounded-full" />
                <Skeleton className="w-1/3 h-30 rounded-full" />
            </div>

            <Skeleton className="w-full h-44" />
            <Skeleton className="w-full h-44" />
            <Skeleton className="w-full h-44" />
        </div>
    </div>
}