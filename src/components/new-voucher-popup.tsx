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
import { Gift, X, Ticket } from "lucide-react";
import {
  getUnseenVouchers,
  markVouchersAsSeen,
} from "@/features/user/lib/user-actions";
import { formatRupiah } from "@/helper/format-rupiah";

export default function NewVoucherPopup() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [vouchers, setVouchers] = useState<any[]>([]);
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
        setVouchers(res.data);
        setIsOpen(true);
      }
    };

    checkVouchers();
  }, [pathname, session, isTargetPage]);

  const handleClose = async () => {
    setIsOpen(false);
    const voucherIds = vouchers
      .filter((v) => v.popupType === "VOUCHER")
      .map((v) => v.id);
    const eventUsageIds = vouchers
      .filter((v) => v.popupType === "EVENT_LOST")
      .map((v) => v.id);

    if (voucherIds.length > 0 || eventUsageIds.length > 0) {
      await markVouchersAsSeen({ voucherIds, eventUsageIds });
    }
  };

  if (vouchers.length === 0) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden bg-transparent shadow-none">
        <div className="relative p-6 bg-white rounded-3xl overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-60" />

          <div className="relative flex flex-col items-center text-center">
            <div className="size-20 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Gift className="size-10 text-red-600" />
            </div>

            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl text-center font-black text-gray-900 leading-tight">
                {vouchers.some((v) => v.popupType === "VOUCHER")
                  ? "Yeay! Ada Voucher Baru Untukmu!"
                  : "Info Event Terbaru"}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-center font-medium">
                {vouchers.some((v) => v.popupType === "VOUCHER")
                  ? "Kamu baru saja mendapatkan reward spesial. Pakai vouchernya sebelum hangus ya!"
                  : "Terima kasih sudah berpartisipasi dalam event kami. Cek detailnya di bawah ini."}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-8 w-full space-y-4">
              {vouchers.map((v) => (
                <div key={v.id} className="relative group">
                  {v.popupType === "VOUCHER" ? (
                    <>
                      {/* Ticket shape background */}
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-r shadow-inner z-10" />
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-l shadow-inner z-10" />

                      <div className="bg-linear-to-r from-red-500 to-red-600 p-4 rounded-2xl flex items-center gap-4 text-white shadow-lg shadow-red-100 border border-red-400">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                          <Ticket className="size-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                            Voucher Reward
                          </p>
                          <h4 className="font-black text-lg leading-tight">
                            {v.discount.name}
                          </h4>
                          <p className="text-sm font-bold">
                            {v.discount.type === "FIXED"
                              ? formatRupiah(v.discount.value)
                              : `${v.discount.value}%`}{" "}
                            OFF
                          </p>
                          {v.event_usage && (
                            <p className="text-[8px] font-bold text-white/90 mt-1 italic">
                              *Kamu adalah orang ke-
                              {Math.floor(v.event_usage.sequence_number / 5)} yang
                              beruntung!
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-100 p-5 rounded-2xl flex items-center gap-4 text-gray-600 border border-gray-200 border-dashed">
                      <div className="p-3 bg-gray-200 rounded-xl">
                        <Ticket className="size-6 text-gray-400" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                          Event Reward
                        </p>
                        <h4 className="font-black text-lg text-gray-800 leading-tight">
                          {v.event_usage.discount_amount === -1
                            ? "Kuota Sudah Penuh"
                            : "Belum Beruntung"}
                        </h4>
                        <p className="text-xs font-medium text-gray-500 mt-1">
                          {v.event_usage.discount_amount === -1
                            ? `Maaf, kamu adalah pendaftar ke-${v.event_usage.sequence_number}. Kuota diskon untuk waktu ini sudah habis.`
                            : `Kamu adalah pendaftar ke-${v.event_usage.sequence_number}. Coba lagi di event berikutnya ya!`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 w-full flex flex-col gap-3">
              <Button
                onClick={handleClose}
                className="h-14 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-lg shadow-xl shadow-gray-200 transition-all active:scale-95"
              >
                {vouchers.some((v) => v.popupType === "VOUCHER")
                  ? "Klaim & Simpan"
                  : "Tutup"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
