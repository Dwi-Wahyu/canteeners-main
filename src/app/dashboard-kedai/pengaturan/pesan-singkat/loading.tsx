import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { Skeleton } from "@/components/ui/skeleton";
import QuickChatForm from "@/features/chat/ui/quick-chat-form";

export default function LoadingQuickChatPage() {
    return <div className="p-5 pt-24">
        <TopbarWithBackButton
            title="Pesan Singkat"
            backUrl="/dashboard-kedai/pengaturan"
            actionButton={<QuickChatForm user_id="" />}
        />

        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
    </div>
}