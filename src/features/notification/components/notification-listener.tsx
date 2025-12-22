"use client";

import { useChatNotification } from "../hooks/use-chat-notification";
import { useOrderNotification } from "../hooks/use-order-notification";
import { useRefundNotification } from "../hooks/use-refund-notification";
import { useComplaintNotification } from "../hooks/use-complaint-notification";
import { toast } from "sonner";
import { ChatNotificationToast } from "../ui/chat-notification-toast";
import { OrderNotificationToast } from "../ui/order-notification-toast";
import { RefundNotificationToast } from "../ui/refund-notification-toast";
import { ComplaintNotificationToast } from "../ui/complaint-notification-toast";

export default function NotificationListener() {
  useOrderNotification({
    onNewNotification: (notification) => {
      toast.custom((id) => (
        <OrderNotificationToast
          notification={notification}
          onDismiss={() => toast.dismiss(id)}
        />
      ));
    },
  });

  useRefundNotification({
    onNewNotification: (notification) => {
      toast.custom((id) => (
        <RefundNotificationToast
          notification={notification}
          onDismiss={() => toast.dismiss(id)}
        />
      ));
    },
  });

  useComplaintNotification({
    onNewNotification: (notification) => {
      toast.custom((id) => (
        <ComplaintNotificationToast
          notification={notification}
          onDismiss={() => toast.dismiss(id)}
        />
      ));
    },
  });

  return null;
}
