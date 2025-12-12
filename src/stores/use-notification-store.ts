import { ReactNode } from "react";
import { create } from "zustand";

type NotificationDialogType = "success" | "error" | "info";

interface Notification {
  title: string;
  message?: string;
  type: NotificationDialogType;
  actionButtons?: React.ReactNode;
  icon?: ReactNode;
}

interface NotificationStore {
  notification: Notification | null;
  show: (notification: Notification) => void;
  hide: () => void;
}

export const useNotificationDialogStore = create<NotificationStore>((set) => ({
  notification: null,
  show: (notification) => set({ notification }),
  hide: () => set({ notification: null }),
}));
