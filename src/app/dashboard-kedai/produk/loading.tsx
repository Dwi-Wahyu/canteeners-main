import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingProductsPage() {
    return <div>
        <div className="p-5 grid mt-4 grid-cols-1 gap-4 md:grid-cols-3">
            <Skeleton className="w-full h-44" />
            <Skeleton className="w-full h-44" />
            <Skeleton className="w-full h-44" />
        </div>
    </div>
}