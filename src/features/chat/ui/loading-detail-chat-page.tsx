import { Skeleton } from "@/components/ui/skeleton";
import ChatTopbar from "./chat-topbar";

export default function LoadingDetailChatPage() {
  return (
    <div className="">
      <ChatTopbar isOwner={false} avatar="avatars/default-avatar.jpg" name="" />

      <div className="flex flex-col pt-20 p-5 gap-4">
        <Skeleton className="w-80 h-20 self-end" />
        <Skeleton className="w-40 h-10" />
        <Skeleton className="w-32 h-10" />
        <Skeleton className="w-52 h-10 self-end" />
      </div>
    </div>
  );
}
