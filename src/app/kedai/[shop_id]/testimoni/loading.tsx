import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingShopTestimony() {
    return <div className="p-5 pt-20">
        <TopbarWithBackButton title="Ulasan Kedai" backUrl={"/kedai/"} />

        <div className="grid mt-4 grid-cols-1 gap-4 md:grid-cols-3">
            <Skeleton className="w-full h-52" />
            <Skeleton className="w-full h-52" />
            <Skeleton className="w-full h-52" />
        </div>
    </div>
}