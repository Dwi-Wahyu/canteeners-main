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
  media?: MediaItem[];
  readBy: string[];
  createdAt: Timestamp | null;
};
