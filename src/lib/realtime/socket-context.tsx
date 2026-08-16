"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

type Listener = (data: any) => void;

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private pendingTopics = new Set<string>();
  private reconnectAttempt = 0;
  private token: string | null = null;

  connect(token: string) {
    if (
      this.token === token &&
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    this.token = token;
    this.open();
  }

  private open() {
    if (!this.token) return;

    let wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3003";
    wsUrl = wsUrl.replace(/\/+$/, "");
    const wsPath = wsUrl.endsWith("/ws") ? "" : "/ws";
    const url = `${wsUrl}${wsPath}?token=${this.token}`;

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }

    const currentWs = new WebSocket(url);
    this.ws = currentWs;

    currentWs.onopen = () => {
      if (this.ws !== currentWs) return;
      this.reconnectAttempt = 0;
      this.pendingTopics.forEach((topic) => {
        if (currentWs.readyState === WebSocket.OPEN) {
          currentWs.send(JSON.stringify({ type: "join", topic }));
        }
      });
    };

    currentWs.onmessage = (e) => {
      if (this.ws !== currentWs) return;
      try {
        const parsed = JSON.parse(e.data);
        const { event, ...data } = parsed;
        if (event) {
          this.listeners.get(event)?.forEach((cb) => cb(data));
        }
      } catch (err) {
        console.error("WS message parse error:", err);
      }
    };

    currentWs.onclose = () => {
      if (this.ws !== currentWs) return;
      const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 15000);
      this.reconnectAttempt++;
      setTimeout(() => {
        if (this.token && this.ws === currentWs) {
          this.open();
        }
      }, delay);
    };

    currentWs.onerror = (err) => {
      if (this.ws !== currentWs) return;
      console.warn("WS connection error:", err);
    };
  }

  join(topic: string) {
    this.pendingTopics.add(topic);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "join", topic }));
    }
  }

  leave(topic: string) {
    this.pendingTopics.delete(topic);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "leave", topic }));
    }
  }

  on(event: string, cb: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(cb);
    return () => {
      this.listeners.get(event)?.delete(cb);
    };
  }

  send(payload: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }
}

const SocketContext = createContext<RealtimeClient | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const clientRef = useRef<RealtimeClient | null>(null);

  if (!clientRef.current) {
    clientRef.current = new RealtimeClient();
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.accessToken) {
      clientRef.current?.connect(session.user.accessToken);
    }
  }, [status, session?.user?.accessToken]);

  return (
    <SocketContext.Provider value={clientRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return ctx;
};
