"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrderNotification } from "../types";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: OrderNotification | null;
}

export function OrderNotificationDialog({
  open,
  onOpenChange,
  notification,
}: OrderNotificationDialogProps) {
  const router = useRouter();

  if (!notification) return null;

  const { metadata, senderInfo, title, body, resourcePath } = notification;

  const handleViewDetails = () => {
    if (resourcePath) {
      router.push(resourcePath);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{body}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Order ID</div>
              <div className="font-medium text-right font-mono">
                #{metadata?.orderId || "-"}
              </div>

              <div className="text-muted-foreground">Customer</div>
              <div className="font-medium text-right">
                {senderInfo?.name || "-"}
              </div>

              <div className="text-muted-foreground">Pesanan</div>
              <div className="font-medium text-right">
                {metadata?.itemCount || 0} Item
              </div>

              <div className="text-muted-foreground">Total Harga</div>
              <div className="font-medium text-right">
                {metadata?.totalPrice
                  ? `Rp${Number(metadata.totalPrice).toLocaleString("id-ID")}`
                  : "-"}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="grid grid-cols-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
          <Button type="button" onClick={handleViewDetails}>
            Lihat Detail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
