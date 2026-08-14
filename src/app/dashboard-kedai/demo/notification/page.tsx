"use client";

import { Button } from "@/components/ui/button";
import { OrderNotificationToast } from "@/features/notification/ui/order-notification-toast";
import { OrderNotificationDialog } from "@/features/notification/ui/order-notification-dialog";
import { ChatNotificationToast } from "@/features/notification/ui/chat-notification-toast";
import { RefundNotificationToast } from "@/features/notification/ui/refund-notification-toast";
import { ComplaintNotificationToast } from "@/features/notification/ui/complaint-notification-toast";
import { toast } from "sonner";
import { useState } from "react";
import {
  ComplaintNotification,
  OrderNotification,
  RefundNotification,
} from "@/features/notification/types";
import { Chat } from "@/features/chat/types";
import { notificationDialog } from "@/hooks/use-notification-dialog";

export default function DemoNotificationPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<OrderNotification | null>(null);

  // --- DUMMY DATA ---

  const dummyOrder: OrderNotification = {
    id: "order-1",
    type: "ORDER",
    subType: "CREATED",
    createdAt: new Date(),
    isRead: false,
    recipientId: "owner-1",
    resourcePath: "/dashboard-kedai/order/123",
    title: "Pesanan Baru Masuk",
    body: "Pesanan 3 item oleh Budi Santoso dengan total 45000, tolong segera ditinjau",
    intent: "INFO",
    metadata: {
      orderId: "ORDER-12345",
      itemCount: 3,
      totalPrice: 45000,
    },
    senderInfo: {
      name: "Budi Santoso",
    },
  };

  const dummyChat: Chat = {
    id: "chat-1",
    lastMessage: "",
    lastMessageAt: new Date(),
    lastMessageSenderId: "customer-1",
    lastMessageType: "TEXT",
    unreadCounts: {
      "customer-1": 1,
      "owner-1": 0,
    },
    participantsInfo: {
      "customer-1": {
        name: "Budi Santoso",
        avatar: "avatars/default-avatar.jpg",
        role: "CUSTOMER",
      },
      "owner-1": {
        name: "Budi Santoso",
        avatar: "avatars/default-avatar.jpg",
        role: "SHOP_OWNER",
      },
    },
  };

  const dummyRefund: RefundNotification = {
    id: "refund-1",
    type: "REFUND",
    subType: "REQUESTED",
    createdAt: new Date(),
    recipientId: "owner-1",
    resourcePath: "/dashboard-kedai/order/123/refund",
    title: "Permintaan Refund Baru",
    body: "Customer mengajukan refund sebesar Rp40.000 untuk pesanan #ORDER-12345",
    intent: "WARNING",
    metadata: {
      amount: 40000,
      reason: "WRONG_ORDER",
    },
  };

  const dummyComplaint: ComplaintNotification = {
    id: "complaint-1",
    type: "COMPLAINT",
    subType: "SUBMITTED",
    createdAt: new Date(),
    recipientId: "owner-1",
    resourcePath: "/dashboard-kedai/order/123/complaint",
    title: "Komplain Baru dari Customer",
    body: "Customer mengajukan komplain untuk pesanan #ORDER-12345: Makanan basi",
    intent: "ERROR",
  };

  // --- HANDLERS ---

  function triggerOrder(intentOverride?: any) {
    const notification = { ...dummyOrder };
    if (intentOverride) notification.intent = intentOverride;

    toast.custom((id) => (
      <OrderNotificationToast
        notification={notification}
        onDismiss={() => toast.dismiss(id)}
      />
    ));
  }

  function triggerChat() {
    toast.custom((id) => (
      <ChatNotificationToast notification={dummyChat} currentUid="owner-1" />
    ));
  }

  function triggerRefund(intentOverride?: any) {
    const notification = { ...dummyRefund };
    if (intentOverride) notification.intent = intentOverride;

    toast.custom((id) => (
      <RefundNotificationToast
        notification={notification}
        onDismiss={() => toast.dismiss(id)}
      />
    ));
  }

  function triggerComplaint(intentOverride?: any) {
    const notification = { ...dummyComplaint };
    if (intentOverride) notification.intent = intentOverride;

    toast.custom((id) => (
      <ComplaintNotificationToast
        notification={notification}
        onDismiss={() => toast.dismiss(id)}
      />
    ));
  }

  function handleOpenDialog() {
    setSelectedNotification(dummyOrder);
    setDialogOpen(true);
  }

  function triggerDialog(type: "success" | "error" | "info") {
    if (type === "success") {
      notificationDialog.success({
        title: "Meja Berhasil Dipilih",
        message: "Kamu telah memilih Meja 5 di Lantai 1. Selamat berbelanja!",
      });
    } else if (type === "error") {
      notificationDialog.error({
        title: "Gagal Proses Pesanan",
        message: "Maaf, stok bahan di kedai ini sedang habis.",
        actionButtons: (
          <Button variant="default" onClick={notificationDialog.hide}>
            Coba Lagi
          </Button>
        ),
      });
    } else {
      notificationDialog.info({
        title: "Informasi Penting",
        message:
          "Kedai akan tutup dalam 15 menit. Segera selesaikan pesananmu.",
      });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          Notification Showcase
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* GLOBAL DIALOG */}
        <div className="space-y-4 rounded-lg border p-4 bg-slate-50">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            🔔 Global Notification Dialog
          </h2>
          <p className="text-sm text-muted-foreground">
            Dialog terpusat untuk sukses, error, dan informasi.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => triggerDialog("success")}
              className="bg-green-600 hover:bg-green-700"
            >
              Success (w/ Loading)
            </Button>
            <Button
              onClick={() => triggerDialog("error")}
              className="bg-red-600 hover:bg-red-700"
            >
              Error Dialog
            </Button>
            <Button
              onClick={() => triggerDialog("info")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Info Dialog
            </Button>
          </div>
        </div>

        {/* ORDER */}
        <div className="space-y-4 rounded-lg border p-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            🛒 Order Notifications
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleOpenDialog}>
              Test Order Dialog
            </Button>

            <Button
              onClick={() => triggerOrder("INFO")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              New Order
            </Button>
            <Button
              onClick={() => triggerOrder("SUCCESS")}
              className="bg-green-600 hover:bg-green-700"
            >
              Payment Approved
            </Button>
            <Button
              onClick={() => triggerOrder("WARNING")}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Rejected
            </Button>
          </div>
        </div>

        {/* CHAT */}
        <div className="space-y-4 rounded-lg border p-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            💬 Chat Notifications
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button onClick={triggerChat} variant="secondary">
              Incoming Message
            </Button>
          </div>
        </div>

        {/* REFUND */}
        <div className="space-y-4 rounded-lg border p-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            💸 Refund Notifications
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => triggerRefund("WARNING")}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Requested
            </Button>
            <Button
              onClick={() => triggerRefund("SUCCESS")}
              className="bg-green-600 hover:bg-green-700"
            >
              Disbursed
            </Button>
            <Button
              onClick={() => triggerRefund("ERROR")}
              className="bg-red-600 hover:bg-red-700"
            >
              Rejected
            </Button>
          </div>
        </div>

        {/* COMPLAINT */}
        <div className="space-y-4 rounded-lg border p-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            ⚠️ Complaint Notifications
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => triggerComplaint("ERROR")}
              className="bg-red-600 hover:bg-red-700"
            >
              New Complaint
            </Button>
            <Button
              onClick={() => triggerComplaint("INFO")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Under Review
            </Button>
            <Button
              onClick={() => triggerComplaint("SUCCESS")}
              className="bg-green-600 hover:bg-green-700"
            >
              Resolved
            </Button>
          </div>
        </div>
      </div>

      <OrderNotificationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        notification={selectedNotification}
      />
    </div>
  );
}
