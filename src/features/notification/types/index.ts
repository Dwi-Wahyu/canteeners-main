import { Timestamp } from "firebase/firestore";

export type NotificationIntent =
  | "DEFAULT"
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR";

export type NotificationType = "CHAT" | "ORDER" | "REFUND" | "COMPLAINT";

export type NotificationBase = {
  id: string; // Firestore Document ID
  type: NotificationType;
  subType: string;
  recipientId: string;
  resourcePath: string;
  createdAt: Timestamp; // ISO String
  expiresAt?: Timestamp; // ISO String (TTL)
  isRead?: boolean;
  title: string;
  body: string;
  intent?: NotificationIntent;
  metadata?: Record<string, any>;
};

// --- CHAT ---
export interface ChatNotification extends NotificationBase {
  type: "CHAT";
  avatar: string;
  subType: "TEXT" | "ATTACHMENT";
}

// --- ORDER ---
export type OrderNotificationSubType =
  | "CREATED"
  | "ACCEPTED"
  | "REJECTED"
  | "PAYMENT_PROOF_SUBMITTED"
  | "PAYMENT_APPROVED"
  | "READY_DINE_IN"
  | "READY_TAKEAWAY";

export interface OrderNotification extends NotificationBase {
  type: "ORDER";
  subType: OrderNotificationSubType;
  senderInfo?: {
    name: string;
  };
}

// --- REFUND ---
export type RefundNotificationSubType =
  | "REQUESTED"
  | "REJECTED"
  | "DISBURSED"
  | "CANCELLED";

export interface RefundNotification extends NotificationBase {
  type: "REFUND";
  subType: RefundNotificationSubType;
}

// --- COMPLAINT ---
export type ComplaintNotificationSubType =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "REJECTED"
  | "ESCALATED";

export interface ComplaintNotification extends NotificationBase {
  type: "COMPLAINT";
  subType: ComplaintNotificationSubType;
}

export type AppNotification =
  | ChatNotification
  | OrderNotification
  | RefundNotification
  | ComplaintNotification;
