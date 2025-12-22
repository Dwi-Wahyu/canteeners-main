import { Skeleton } from "@/components/ui/skeleton";
import ChatTopbar from "./chat-topbar";
import { Textarea } from "@/components/ui/textarea";
import { Timestamp } from "firebase/firestore";

export default function LoadingDetailChatPage() {
  return (
    <div className="pt-5">
      <ChatTopbar
        lastSeenAt={Timestamp.now()}
        opponent={{
          avatar: "avatars/default-avatar.jpg",
          name: "Memuat pesan . . .",
          role: "SHOP_OWNER",
        }}
      />

      <div className="flex flex-col pt-20 p-5 gap-4">
        <Skeleton className="w-80 h-20 self-end" />
        <Skeleton className="w-40 h-10" />
        <Skeleton className="w-32 h-10" />
        <Skeleton className="w-52 h-10 self-end" />
        <Skeleton className="w-80 h-40" />
        <Skeleton className="w-32 h-10" />
      </div>

      <div className="p-5">
        <Textarea />
      </div>
    </div>
  );
}
