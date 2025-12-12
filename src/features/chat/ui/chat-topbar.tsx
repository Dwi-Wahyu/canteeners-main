import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function ChatTopbar({ isOwner }: { isOwner: boolean }) {
    return (
        <div className="p-4 absolute top-0 left-0 w-full flex items-center gap-1 border-b bg-white shadow-sm z-10">
            <Link className="text-muted-foreground" href={isOwner ? '/dashboard-kedai/chat' : '/chat'}>
                <ChevronLeft className="w-5 h-5" />
            </Link>

            <h1 className="font-semibold text-lg">
                Chat dengan {isOwner ? "Pelanggan" : "Kedai"}
            </h1>
        </div>
    );
}