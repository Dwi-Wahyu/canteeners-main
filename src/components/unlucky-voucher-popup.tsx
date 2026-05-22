"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";
import {
  getUnseenVouchers,
  markVouchersAsSeen,
} from "@/features/user/lib/user-actions";

export default function UnluckyVoucherPopup() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unluckyEvents, setUnluckyEvents] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const targetPages = ["/", "/kantin", "/chat", "/profil", "/keranjang"];

  // Check if it's a detail kantin page: /kantin/[slug]
  const isCanteenDetail =
    pathname.startsWith("/kantin/") && pathname.split("/").length === 3;
  const isTargetPage = targetPages.includes(pathname) || isCanteenDetail;

  useEffect(() => {
    if (!session || !isTargetPage) return;

    const checkVouchers = async () => {
      const res = await getUnseenVouchers();
      if (res.success && res.data && res.data.length > 0) {
        const unlucky = res.data.filter((v) => v.popupType === "EVENT_LOST");
        if (unlucky.length > 0) {
          setUnluckyEvents(unlucky);
          setIsOpen(true);
        }
      }
    };

    checkVouchers();
  }, [pathname, session, isTargetPage]);

  const handleClose = async () => {
    setIsOpen(false);
    const eventUsageIds = unluckyEvents.map((v) => v.id);

    if (eventUsageIds.length > 0) {
      await markVouchersAsSeen({ voucherIds: [], eventUsageIds });
    }
  };

  if (unluckyEvents.length === 0) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden bg-transparent shadow-none">
        <div className="relative p-6 bg-white rounded-3xl overflow-hidden">
          {/* Background decoration with gray/amber tints for a subtle unlucky aesthetic */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gray-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-50 rounded-full blur-3xl opacity-60" />

          <div className="relative flex flex-col items-center text-center">
            <div className="size-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-amber-100">
              <Frown className="size-10 text-amber-500" />
            </div>

            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl text-center font-black text-gray-900 leading-tight">
                Info Event Terbaru
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-center font-medium">
                Terima kasih sudah berpartisipasi dalam event kami. Cek detailnya di bawah ini.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-8 w-full space-y-4">
              {unluckyEvents.map((v) => (
                <div key={v.id} className="relative group">
                  <div className="bg-gray-50 p-5 rounded-2xl flex items-center gap-4 text-gray-600 border border-gray-200 border-dashed transition-all hover:bg-gray-100/55">
                    <div className="p-3 bg-gray-200/60 rounded-xl">
                      <Frown className="size-6 text-gray-500" />
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="font-black text-lg text-gray-800 leading-tight">
                        {v.event_usage.discount_amount === -1
                          ? "Kuota Sudah Penuh"
                          : "Belum Beruntung"}
                      </h4>
                      <p className="text-xs font-medium text-gray-500 mt-1">
                        {v.event_usage.discount_amount === -1
                          ? `Maaf, Kuota diskon untuk waktu ini sudah habis.`
                          : `Coba lagi di event berikutnya ya!`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 w-full flex flex-col gap-3">
              <Button
                onClick={handleClose}
                className="h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-lg shadow-xl shadow-gray-200 transition-all active:scale-95 cursor-pointer"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
