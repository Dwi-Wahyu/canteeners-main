export type NotificationIntent =
  | "DEFAULT"
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR";

export type NotificationType = "ORDER" | "REFUND" | "COMPLAINT" | "CHAT";

export type NotificationBase = {
  id: string;
  type: NotificationType;
  subType?: string;
  subtype?: string;
  recipientId?: string;
  recipient_id?: string;
  resourcePath?: string;
  createdAt?: string | Date | number;
  created_at?: string | Date | number;
  expiresAt?: string | Date | number;
  isRead?: boolean;
  is_read?: boolean;
  title: string;
  body?: string | null;
  intent?: NotificationIntent;
  metadata?: Record<string, any>;
  data?: Record<string, any>;
};

export type OrderNotificationSubType =
  | "CREATED"
  | "ACCEPTED"
  | "REJECTED"
  | "PAYMENT_PROOF_SUBMITTED"
  | "PAYMENT_APPROVED"
  | "READY_DINE_IN"
  | "READY_TAKEAWAY"
  | "CANCELLED";

export interface OrderNotification extends NotificationBase {
  type: "ORDER";
  subType: OrderNotificationSubType;
  senderInfo?: {
    name: string;
  };
}

export type RefundNotificationSubType =
  | "REQUESTED"
  | "REJECTED"
  | "DISBURSED"
  | "CANCELLED";

export interface RefundNotification extends NotificationBase {
  type: "REFUND";
  subType: RefundNotificationSubType;
}

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
  | OrderNotification
  | RefundNotification
  | ComplaintNotification;
