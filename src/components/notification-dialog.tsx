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
  success: <Check className="w-10 h-10 text-white" />,
  error: <AlertCircle className="w-10 h-10 text-white" />,
  info: <Info className="w-10 h-10 text-white" />,
};

const colors = {
  // Warna solid untuk icon paling dalam
  solid: {
    success: "bg-linear-to-br from-[#b70011] to-[#dc2626]",
    error: "bg-linear-to-br from-destructive to-destructive/80",
    info: "bg-linear-to-br from-primary to-primary/80",
  },
  // Warna dengan opasitas ring
  ring: {
    success: "bg-red-50",
    error: "bg-red-50",
    info: "bg-blue-50",
  },
};

export default function NotificationDialog() {
  const { notification, hide } = useNotificationDialogStore();

  if (!notification) return null;

  const type = notification.type;

  return (
    <Dialog open={!!notification} onOpenChange={() => hide()}>
      <DialogContent showCloseButton={false} className="overflow-hidden p-0 max-w-[90vw] sm:max-w-[400px] rounded-3xl border-none shadow-2xl">
        <div className="flex flex-col items-center p-8 pt-10">
          {/* Simplified Icon Container */}
          <div className={`size-20 rounded-3xl ${colors.ring[type]} flex items-center justify-center mb-6`}>
            <div className={`size-14 rounded-2xl ${colors.solid[type]} flex items-center justify-center shadow-lg shadow-primary/20`}>
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
              className="h-full bg-linear-to-r from-[#b70011] to-[#dc2626] animate-progress"
              style={{
                width: "100%",
                transformOrigin: "left",
              }}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
