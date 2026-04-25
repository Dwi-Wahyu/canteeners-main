import { adminMessaging } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";

export async function sendPushNotification({
  userId,
  title,
  body,
  data,
}: {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  // Ambil semua token aktif milik user tersebut
  const userTokens = await prisma.userFcmToken.findMany({
    where: {
      user_id: userId,
      is_active: true,
    },
    select: {
      token: true,
    },
  });

  if (userTokens.length === 0) return;

  const tokens = userTokens.map((t) => t.token);

  // Kirim pesan ke banyak perangkat (Multicast)
  const message = {
    notification: {
      title,
      body,
    },
    data: data, // Data tambahan (misal: order_id) untuk handling klik
    tokens: tokens,
  };

  try {
    const response = await adminMessaging.sendEachForMulticast(message);

    // Optional: Bersihkan token yang sudah tidak valid (Expired)
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });

      // Tandai token sebagai tidak aktif di database
      await prisma.userFcmToken.updateMany({
        where: { token: { in: failedTokens } },
        data: { is_active: false },
      });
    }

    return response;
  } catch (error) {
    console.error("Error sending FCM:", error);
  }
}
