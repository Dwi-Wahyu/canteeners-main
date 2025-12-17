import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingEditProductPage() {
    return <div className="p-5 pt-24">
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-20" />
        <Skeleton className="w-full h-10" />
        <Skeleton className="w-full h-28" />
    </div>
}