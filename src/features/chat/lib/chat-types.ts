import { Timestamp } from "firebase/firestore";

export type MediaItem = {
  url: string;
  path: string;
  contentType: string;
  size: number;
};

export type Message = {
  id: string;
  senderId: string;
  type: "text" | "image";
  text?: string;
  imageUrl?: string | null; // Backward compatibility jika ada
  attachments?: MediaItem[];
  media?: MediaItem[]; // Deprecated: use attachments instead
  readBy: string[];
  createdAt: Timestamp | null;
};
