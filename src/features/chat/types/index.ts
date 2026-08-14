export type ParticipantInfo = {
  name: string;
  avatar: string;
  role: "CUSTOMER" | "SHOP_OWNER" | "SUPERADMIN" | "ADMIN" | string;
};

export type ParticipantUser = {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  owner?: {
    shop?: {
      id: string;
      name: string;
    };
  };
};

export type Chat = {
  id: string;

  participant_one_id?: string;
  participant_two_id?: string;
  type?: "CUSTOMER_OWNER" | "CUSTOMER_COURIER" | "ADMIN_SUPPORT";
  context_id?: string | null;

  participant_one?: ParticipantUser;
  participant_two?: ParticipantUser;

  customer_id?: string;
  owner_id?: string;

  last_message?: string | null;
  lastMessage?: string | null;

  last_message_at?: string | Date | number | null;
  lastMessageAt?: string | Date | number | null;

  last_message_type?: "TEXT" | "ATTACHMENT" | "ORDER";
  lastMessageType?: "TEXT" | "ATTACHMENT" | "ORDER";

  last_message_sender_id?: string | null;
  lastMessageSenderId?: string | null;

  unread_counts?: Record<string, number>;
  unreadCounts?: Record<string, number>;

  participantsInfo?: Record<string, ParticipantInfo>;
  lastSeenAt?: Record<string, any>;

  customer?: {
    id: string;
    user_id: string;
    user: {
      name: string;
      avatar: string;
    };
  };

  owner?: {
    id: string;
    user_id: string;
    shop?: {
      id: string;
      name: string;
    };
    user: {
      name: string;
      avatar: string;
    };
  };

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
  chat_id?: string;
  sender_id?: string;
  senderId?: string;
  type: "TEXT" | "ORDER" | "ATTACHMENT";
  order_id?: string;
  text?: string | null;
  attachments?: Attachment[] | any;
  read_by?: string[];
  readBy?: string[];
  created_at?: string | Date | number | null;
  createdAt?: string | Date | number | null;
};
