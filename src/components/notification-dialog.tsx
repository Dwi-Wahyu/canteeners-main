"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotificationDialogStore } from "@/stores/use-notification-store";

import { AlertCircle, Check, Info } from "lucide-react";
import { JSX } from "react";

type NotificationType = "success" | "error" | "info";

const icons: Record<NotificationType, JSX.Element> = {
  success: <Check className="w-20 h-20 text-success-foreground" />,
  error: <AlertCircle className="w-20 h-20 text-destructive-foreground" />,
  info: <Info className="w-20 h-20 text-accent-foreground" />,
};

const colors = {
  // Warna solid untuk icon paling dalam
  solid: {
    success: "bg-success",
    error: "bg-destructive",
    info: "bg-accent",
  },
  // Warna dengan opasitas 50% untuk ring tengah
  ring_middle: {
    success: "bg-success/50",
    error: "bg-destructive/50",
    info: "bg-accent/50",
  },
  // Warna dengan opasitas 25% untuk ring luar
  ring_outer: {
    success: "bg-success/25",
    error: "bg-destructive/25",
    info: "bg-accent/25",
  },
};

export default function NotificationDialog() {
  const { notification, hide } = useNotificationDialogStore();

  if (!notification) return null;

  const type = notification.type;

  return (
    <Dialog open={!!notification} onOpenChange={() => hide()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="flex flex-col items-center gap-4 ">
          <div className="fixed left-0 -top-26 w-full flex justify-center">
            <div className={`rounded-full p-4 bg-card`}>
              <div className={`rounded-full p-4 ${colors.ring_middle[type]}`}>
                <div className={`rounded-full p-4 ${colors.ring_outer[type]}`}>
                  <div className={`rounded-full p-4 ${colors.solid[type]}`}>
                    {notification.icon ? notification.icon : icons[type]}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-22 text-center">
            <DialogTitle className="text-xl font-semibold">
              {notification.title}
            </DialogTitle>
            {notification.message && (
              <DialogDescription>{notification.message}</DialogDescription>
            )}

            {notification.actionButtons && (
              <div className="mt-5 flex justify-center gap-4">
                {notification.actionButtons}
              </div>
            )}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
