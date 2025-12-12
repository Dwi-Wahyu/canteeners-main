import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProductDetailPage() {
    return <div className="p-5 pt-24">
        <Skeleton className="w-full h-44" />
        <Skeleton className="w-40 h-10" />
        <Skeleton className="w-36 h-10" />
        <Skeleton className="w-20 h-10" />
    </div>
}