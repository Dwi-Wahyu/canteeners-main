import { User } from "firebase/auth";
import { Chat, ParticipantInfo } from "../types";

export const getOpponentId = (
  chat: Chat,
  currentUid: string
): string | null => {
  return (
    Object.keys(chat.participantsInfo).find((id) => id !== currentUid) ?? null
  );
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
  if (!currentUid) {
    return null;
  }

  const opponentId = getOpponentId(chat, currentUid);

  if (!opponentId) {
    return null;
  }

  return chat.participantsInfo[opponentId];
};

export const getMyUnreadCount = (chat: Chat, currentUid: string) => {
  return chat.unreadCounts?.[currentUid] ?? 0;
};
