import { Timestamp } from "firebase/firestore";

export type ParticipantInfo = {
  name: string;
  avatar: string;
  role: "CUSTOMER" | "SHOP_OWNER";
  lastSeenAt?: Timestamp;
};

export type Chat = {
  id: string;

  lastMessage: string;
  lastMessageAt: Timestamp;
  lastMessageType: "TEXT" | "ATTACHMENTS" | "ORDER";
  lastMessageSenderId: string;

  lastSeenAt: Record<string, Timestamp>;

  participantsInfo: Record<string, ParticipantInfo>;

  unreadCounts: Record<string, number>;

  typing?: Record<string, boolean>;
};

export type Attachment = {
  url: string;
  path: string;
  contentType: string;
  size: number;
};

export type Message = {
  id: string;
  senderId: string;
  type: "TEXT" | "ORDER" | "ATTACHMENT";
  order_id?: string;
  text?: string;
  attachments?: Attachment[];
  readBy: string[];
  createdAt: Timestamp | null;
};
