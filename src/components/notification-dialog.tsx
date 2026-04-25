"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotificationDialogStore } from "@/stores/use-notification-store";

import { AlertCircle, Check, Info } from "lucide-react";
import { JSX, useEffect } from "react";

type NotificationType = "success" | "error" | "info";

const icons: Record<NotificationType, JSX.Element> = {
  success: <Check className="w-10 h-10 text-white" />,
  error: <AlertCircle className="w-10 h-10 text-white" />,
  info: <Info className="w-10 h-10 text-white" />,
};

const colors = {
  // Warna solid untuk icon paling dalam
  solid: {
    success: "bg-linear-to-br from-green-500 to-green-600",
    error: "bg-linear-to-br from-destructive to-red-600",
    info: "bg-linear-to-br from-blue-500 to-blue-600",
  },
  // Warna dengan opasitas ring
  ring: {
    success: "bg-green-50",
    error: "bg-red-50",
    info: "bg-blue-50",
  },
};

export default function NotificationDialog() {
  const { notification, hide } = useNotificationDialogStore();

  useEffect(() => {
    if (notification?.duration) {
      const timer = setTimeout(() => {
        hide();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification, hide]);

  if (!notification) return null;

  const type = notification.type;

  // Tentukan warna loading bar berdasarkan tipe
  const loadingBarColor = {
    success: "from-green-500 to-green-600",
    error: "from-red-500 to-red-600",
    info: "from-blue-500 to-blue-600",
  }[type];

  return (
    <Dialog open={!!notification} onOpenChange={() => hide()}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden p-0 max-w-[90vw] sm:max-w-[400px] rounded-3xl border-none shadow-2xl"
      >
        <div className="flex flex-col items-center p-8 pt-10">
          {/* Simplified Icon Container */}
          <div
            className={`size-20 rounded-3xl ${colors.ring[type]} flex items-center justify-center mb-6`}
          >
            <div
              className={`size-14 rounded-2xl ${colors.solid[type]} flex items-center justify-center shadow-lg`}
            >
              {notification.icon ? notification.icon : icons[type]}
            </div>
          </div>

          <div className="text-center w-full">
            <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
              {notification.title}
            </DialogTitle>
            {notification.message && (
              <DialogDescription className="text-gray-500 mt-2 font-medium leading-relaxed">
                {notification.message}
              </DialogDescription>
            )}

            {notification.actionButtons && (
              <div className="mt-8 flex justify-center gap-4 w-full">
                {notification.actionButtons}
              </div>
            )}
          </div>
        </div>

        {notification.showLoadingBar && (
          <div className="h-1.5 w-full bg-gray-100/50">
            <div
              className={`h-full bg-linear-to-r ${loadingBarColor} animate-progress`}
              style={{
                width: "100%",
                transformOrigin: "left",
                animationDuration: `${notification.duration || 3000}ms`,
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
