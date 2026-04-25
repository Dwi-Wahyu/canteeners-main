import { create } from "zustand";
import { Chat } from "@/features/chat/types";

interface ToastNotification {
  id: string;
  chat: Chat;
  currentUid: string;
}

interface ToastStore {
  toasts: ToastNotification[];
  addToast: (chat: Chat, currentUid: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (chat, currentUid) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, chat, currentUid }],
    }));

    // Auto remove after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
