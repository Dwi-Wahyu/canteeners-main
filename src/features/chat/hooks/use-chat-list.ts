"use client";

import { Chat } from "../types";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/lib/realtime/socket-context";

export const useChatList = () => {
  const { data: session, status } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useSocket();

  const fetchChats = useCallback(async () => {
    if (!session?.user?.accessToken) return;
    try {
      setIsLoading(true);
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
      const res = await fetch(`${backendUrl}/chats`, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (e) {
      console.error("Error fetching chats:", e);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.accessToken]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchChats();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status, fetchChats]);

  useEffect(() => {
    if (!socket || !session?.user?.id) return;

    const unsubscribe = socket.on("chat:new-message", () => {
      fetchChats();
    });

    return () => {
      unsubscribe();
    };
  }, [socket, session?.user?.id, fetchChats]);

  return {
    isLoading: status === "loading" || isLoading,
    chats,
    user: session?.user ? { uid: session.user.id } : null,
    refetch: fetchChats,
  };
};
