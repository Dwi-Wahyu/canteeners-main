import {
  Bell,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  MessageSquare,
  BookAlert,
  MessageCircle,
} from "lucide-react";
import { NotificationIntent } from "@/features/notification/types";

export const notificationTypeIconMapping = {
  ORDER: <ShoppingCart className="h-4 w-4" />,
  REFUND: <BookAlert className="h-4 w-4" />,
  COMPLAINT: <MessageSquare className="h-4 w-4" />,
  CHAT: <MessageCircle className="h-4 w-4" />,
};

export const notificationIntentIconMapping = {
  DEFAULT: <Bell className="h-4 w-4" />,
  INFO: <Info className="h-4 w-4" />,
  SUCCESS: <CheckCircle className="h-4 w-4" />,
  WARNING: <AlertTriangle className="h-4 w-4" />,
  ERROR: <XCircle className="h-4 w-4" />,
};

export const notificationIntentVariantMap: Record<
  NotificationIntent,
  "default" | "success" | "info" | "destructive" | "secondary"
> = {
  DEFAULT: "default",
  INFO: "info",
  SUCCESS: "success",
  WARNING: "secondary",
  ERROR: "destructive",
};

export const notificationIntentColorMap: Record<
  NotificationIntent,
  {
    background: string;
    foreground: string;
  }
> = {
  DEFAULT: {
    background: "var(--color-muted)",
    foreground: "var(--color-muted-foreground)",
  },

  INFO: {
    background: "var(--color-accent)",
    foreground: "var(--color-accent-foreground)",
  },

  SUCCESS: {
    background: "var(--color-success)",
    foreground: "var(--color-success-foreground)",
  },

  WARNING: {
    background: "var(--color-secondary)",
    foreground: "var(--color-secondary-foreground)",
  },

  ERROR: {
    background: "var(--color-destructive)",
    foreground: "var(--color-destructive-foreground)",
  },
};
