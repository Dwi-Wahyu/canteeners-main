"use client";

import { useToastStore } from "@/stores/use-toast-store";
import { ChatNotificationToast } from "@/features/notification/ui/chat-notification-toast";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-[320px]">
      {toasts.map((toast) => (
        <div key={toast.id} className="animate-in fade-in slide-in-from-top-4 duration-300">
          <ChatNotificationToast
            notification={toast.chat}
            currentUid={toast.currentUid}
            onDismiss={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
