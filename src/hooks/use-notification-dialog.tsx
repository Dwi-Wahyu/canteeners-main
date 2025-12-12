import { useNotificationDialogStore } from "@/stores/use-notification-store";
import React from "react";

type NotificationOptions = {
  title: string;
  message?: string;
  actionButtons?: React.ReactNode;
  icon?: React.ReactNode;
};

type NotificationDialog = {
  success: (opts: NotificationOptions) => void;
  error: (opts: NotificationOptions) => void;
  info: (opts: NotificationOptions) => void;
};

export const notificationDialog = {
  success: (opts: NotificationOptions) =>
    useNotificationDialogStore.getState().show({ ...opts, type: "success" }),
  error: (opts: NotificationOptions) =>
    useNotificationDialogStore.getState().show({ ...opts, type: "error" }),
  info: (opts: NotificationOptions) =>
    useNotificationDialogStore.getState().show({ ...opts, type: "info" }),

  hide: () => useNotificationDialogStore.getState().hide(),
} satisfies NotificationDialog & { hide: () => void };
