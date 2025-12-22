import { OrderNotification } from "../types";
import {
  notificationIntentColorMap,
  notificationTypeIconMapping,
} from "@/constant/notification-mapping";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface OrderNotificationToastProps {
  notification: OrderNotification;
  onDismiss?: () => void;
}

export function OrderNotificationToast({
  notification,
  onDismiss,
}: OrderNotificationToastProps) {
  const intent = notification.intent || "INFO";
  const colors = notificationIntentColorMap[intent];
  const typeIcon = notificationTypeIconMapping["ORDER"];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg border p-4 shadow-md transition-all hover:shadow-lg",
        "bg-white dark:bg-zinc-950"
      )}
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: colors.background,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: `color-mix(in srgb, ${colors.background}, transparent 80%)`,
            color: colors.background,
          }}
        >
          {typeIcon}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm text-foreground">
              {notification.title}
            </p>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt.toDate()), {
                addSuffix: true,
                locale: id,
              })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notification.body}
          </p>
          {/* Metadata Display for Order if needed */}
          {notification.metadata && notification.metadata.totalPrice && (
            <div className="mt-2 text-xs font-mono bg-muted p-1 rounded inline-block">
              Total: Rp
              {Number(notification.metadata.totalPrice).toLocaleString("id-ID")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
