"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Edit, Loader2, Coffee } from "lucide-react";
import { formatToHour } from "@/helper/hour-helper";
import { ShopStatus } from "@/generated/prisma";
import { toggleAutoAccept, toggleShopStatus } from "../lib/shop-actions";
import NavButton from "@/components/nav-button";
import { Separator } from "@/components/ui/separator";

export default function ToggleShopStatus({
  id,
  open_time,
  close_time,
  current_status,
  is_auto_accept: initialAutoAccept,
}: {
  id: string;
  open_time: Date | null;
  close_time: Date | null;
  current_status: ShopStatus;
  is_auto_accept: boolean;
}) {
  const [status, setStatus] = useState<ShopStatus>(current_status);
  const [isAutoAccept, setIsAutoAccept] = useState<boolean>(initialAutoAccept);

  const [isPending, startTransition] = useTransition();
  const [isAutoPending, startAutoTransition] = useTransition();

  function handleStatusUpdate(newStatus: ShopStatus) {
    if (newStatus === status) return;

    startTransition(async () => {
      const result = await toggleShopStatus(id, newStatus);

      if (result.success) {
        toast.success(result.message);
        if (result.data) {
          setStatus(result.data);
        }
      } else {
        toast.error(result.error.message);
      }
    });
  }

  function handleAutoAcceptToggle() {
    startAutoTransition(async () => {
      const result = await toggleAutoAccept(id, isAutoAccept);

      if (result.success) {
        toast.success(result.message);
        if (typeof result.data === "boolean") {
          setIsAutoAccept(result.data);
        }
      } else {
        toast.error(result.error.message);
      }
    });
  }

  const getStatusConfig = (s: ShopStatus) => {
    switch (s) {
      case "ACTIVE":
        return {
          color: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",
          label: "Status Kedai: Buka",
          desc: "Kedai sedang menerima pesanan",
        };
      case "BUSY":
        return {
          color: "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]",
          label: "Status Kedai: Sibuk",
          desc: "Kedai sedang ramai, pesanan baru ditutup sementara",
        };
      case "INACTIVE":
        return {
          color: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
          label: "Status Kedai: Tutup",
          desc: "Kedai sedang tidak menerima pesanan",
        };
      case "SUSPENDED":
        return {
          color: "bg-black shadow-[0_0_8px_rgba(0,0,0,0.5)]",
          label: "Status Kedai: Ditangguhkan",
          desc: "Akun kedai sedang ditangguhkan oleh admin",
        };
      default:
        return {
          color: "bg-gray-500",
          label: "Status Kedai",
          desc: "Status tidak diketahui",
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <Card className="mb-4">
      <CardContent>
        <div className="space-y-4">
          {/* Status Kedai */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-3 items-center">
              <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
              <div>
                <h1 className="text-sm font-semibold">{statusConfig.label}</h1>
                <p className="text-xs text-muted-foreground">
                  {statusConfig.desc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                size={"sm"}
                variant={status === "ACTIVE" ? "default" : "outline"}
                onClick={() => handleStatusUpdate("ACTIVE")}
                disabled={isPending || status === "SUSPENDED"}
                className="text-xs h-9"
              >
                {isPending && status === "ACTIVE" ? (
                  <Loader2 className="animate-spin w-3 h-3" />
                ) : (
                  "Buka"
                )}
              </Button>
              <Button
                size={"sm"}
                variant={status === "BUSY" ? "default" : "outline"}
                onClick={() => handleStatusUpdate("BUSY")}
                disabled={isPending || status === "SUSPENDED"}
                className="text-xs h-9"
              >
                {isPending && status === "BUSY" ? (
                  <Loader2 className="animate-spin w-3 h-3" />
                ) : (
                  "Sibuk"
                )}
              </Button>
              <Button
                size={"sm"}
                variant={status === "INACTIVE" ? "default" : "outline"}
                onClick={() => handleStatusUpdate("INACTIVE")}
                disabled={isPending || status === "SUSPENDED"}
                className="text-xs h-9"
              >
                {isPending && status === "INACTIVE" ? (
                  <Loader2 className="animate-spin w-3 h-3" />
                ) : (
                  "Tutup"
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Terima Otomatis */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  isAutoAccept
                    ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
              ></div>
              <div>
                <h1 className="text-sm font-semibold">Terima Otomatis</h1>
                <p className="text-xs text-muted-foreground">
                  Proses pesanan tanpa konfirmasi manual
                </p>
              </div>
            </div>

            <Button
              size={"sm"}
              variant={isAutoAccept ? "default" : "outline"}
              onClick={handleAutoAcceptToggle}
              disabled={isAutoPending}
              className="min-w-[90px]"
            >
              {isAutoPending ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : isAutoAccept ? (
                "Aktif"
              ) : (
                "Nonaktif"
              )}
            </Button>
          </div>

          <Separator />

          {/* Jam Operasional */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <Edit className="w-4 h-4 text-muted-foreground ml-0.5" />
              <div>
                <h1 className="text-sm font-semibold">Jam Operasional</h1>
                <p className="text-xs text-muted-foreground">
                  {open_time && close_time
                    ? `${formatToHour(open_time)} - ${formatToHour(close_time)}`
                    : "Belum menentukan jam operasional"}
                </p>
              </div>
            </div>

            <NavButton
              variant="outline"
              size="sm"
              href={"/dashboard-kedai/pengaturan/edit-kedai"}
            >
              Ubah
            </NavButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
