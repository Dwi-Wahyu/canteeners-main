import { notificationIntentColorMap } from "@/constant/notification-mapping";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/helper/get-image-url";
import Link from "next/link";
import { Chat } from "@/features/chat/types";
import { getOpponentInfo } from "@/features/chat/lib/chat-helper";
import { User } from "firebase/auth";

interface ChatNotificationToastProps {
  notification: Chat;
  currentUid: string;
  onDismiss?: () => void;
}

export function ChatNotificationToast({
  notification,
  currentUid,
  onDismiss,
}: ChatNotificationToastProps) {
  const opponent = getOpponentInfo(notification, currentUid);

  if (!opponent) {
    return null;
  }

  return (
    <Link
      href={"/chat/" + notification.id}
      className={cn(
        "relative w-full block overflow-hidden rounded-lg border p-4 shadow-md transition-all hover:shadow-lg",
        "bg-white dark:bg-zinc-950" // Default bg
      )}
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: notificationIntentColorMap["DEFAULT"].background,
      }}
    >
      <div className="flex items-start gap-4">
        <Avatar className="size-10">
          <AvatarImage src={getImageUrl(opponent.avatar)} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm text-foreground">
              {opponent.name}
            </p>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.lastMessage}
          </p>
        </div>
      </div>
    </Link>
  );
}
