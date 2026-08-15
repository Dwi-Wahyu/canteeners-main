import { prisma } from "@/lib/prisma";

export async function publishRealtime(topic: string, data: any) {
  try {
    const rawUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3002";
    const backendUrl = rawUrl.replace(/\/+$/, "");
    await fetch(`${backendUrl}/internal/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, data }),
    });
  } catch (e) {
    console.warn("Failed to publish realtime event", e);
  }
}

export async function createAndPublishNotification({
  recipient_id,
  type,
  subtype,
  title,
  body,
  data,
}: {
  recipient_id: string;
  type: "ORDER" | "COMPLAINT" | "REFUND" | "CHAT";
  subtype?: string;
  title: string;
  body?: string;
  data?: any;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        recipient_id,
        type,
        subtype: subtype || null,
        title,
        body: body || null,
        data: data || {},
      },
    });

    await publishRealtime(`user:${recipient_id}`, {
      event: "notification",
      notification,
    });

    return notification;
  } catch (err) {
    console.error("Error creating/publishing notification:", err);
  }
}
