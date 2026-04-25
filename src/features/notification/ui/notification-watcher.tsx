"use client";

import useWatchNotification from "../hooks/use-watch-notification";
import { useWatchChatNotification } from "../hooks/use-watch-chat-notification";

export function NotificationWatcher() {
  useWatchNotification();
  useWatchChatNotification();
  return null;
}
