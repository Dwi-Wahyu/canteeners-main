import { Chat, ParticipantInfo } from "../types";

export const getOpponentId = (
  chat: Chat,
  currentUid: string
): string | null => {
  if (chat.participant_one_id && chat.participant_two_id) {
    return chat.participant_one_id === currentUid
      ? chat.participant_two_id
      : chat.participant_one_id;
  }
  if (chat.participant_one && chat.participant_two) {
    return chat.participant_one.id === currentUid
      ? chat.participant_two.id
      : chat.participant_one.id;
  }
  if (chat.customer && chat.owner) {
    return chat.customer.user_id === currentUid
      ? chat.owner.user_id
      : chat.customer.user_id;
  }
  if (chat.participantsInfo) {
    return (
      Object.keys(chat.participantsInfo).find((id) => id !== currentUid) ?? null
    );
  }
  return null;
};

export const isOpponentTyping = (
  chat: Chat | undefined,
  currentUid: string
): boolean => {
  if (!chat?.typing) return false;
  const opponentId = getOpponentId(chat, currentUid);
  return opponentId ? chat.typing[opponentId] === true : false;
};

export const getOpponentInfo = (
  chat: Chat,
  currentUid: string
): ParticipantInfo | null => {
  if (!currentUid || !chat) {
    return null;
  }

  if (chat.participant_one && chat.participant_two) {
    const isP1 = chat.participant_one.id === currentUid;
    const opponentUser = isP1 ? chat.participant_two : chat.participant_one;

    return {
      name: opponentUser?.name || "User",
      avatar: opponentUser?.avatar || "avatars/default-avatar.jpg",
      role: opponentUser?.role || (opponentUser?.owner?.shop ? "SHOP_OWNER" : "CUSTOMER"),
    };
  }

  if (chat.customer && chat.owner) {
    const isCustomer = chat.customer.user_id === currentUid;
    const opponentUser = isCustomer ? chat.owner.user : chat.customer.user;
    const opponentRole = isCustomer ? "SHOP_OWNER" : "CUSTOMER";

    return {
      name: opponentUser?.name || "User",
      avatar: opponentUser?.avatar || "avatars/default-avatar.jpg",
      role: opponentRole,
    };
  }

  const opponentId = getOpponentId(chat, currentUid);
  if (!opponentId || !chat.participantsInfo) {
    return null;
  }

  return chat.participantsInfo[opponentId];
};

export const getMyUnreadCount = (chat: Chat, currentUid: string) => {
  const unread = chat.unread_counts || chat.unreadCounts;
  return unread?.[currentUid] ?? 0;
};
