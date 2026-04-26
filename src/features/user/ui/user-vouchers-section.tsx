"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, ChevronRight, Ticket, Info, X } from "lucide-react";
import { formatRupiah } from "@/helper/format-rupiah";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface UserVoucher {
  id: string;
  name: string;
  value: number;
  type: "FIXED" | "PERCENTAGE";
  description: string | null;
  status: string;
}

export default function UserVouchersSection({
  vouchers,
}: {
  vouchers: UserVoucher[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const activeVouchers = (vouchers || []).filter((v) => v.status === "ACTIVE");

  if (!activeVouchers || activeVouchers.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-xl">
          <Ticket className="size-5 text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Voucher Saya</p>
          <p className="text-xs text-muted-foreground">
            Belum ada voucher tersedia
          </p>
        </div>
      </div>
    );
  }

  const previewVoucher = activeVouchers[0];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <Ticket className="size-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm">Voucher Saya</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Anda memiliki {activeVouchers.length} voucher aktif
            </p>
          </div>
        </div>

        {/* Mini Preview of first voucher */}
        <div className="px-5 pb-2 pt-0">
          <div className="bg-gray-50 rounded-xl p-3 border border-dashed border-gray-200 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                {previewVoucher.type === "FIXED" ? "Potongan" : "Diskon"}
              </span>
              <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">
                {previewVoucher.name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-primary">
                {previewVoucher.type === "FIXED"
                  ? formatRupiah(previewVoucher.value)
                  : `${previewVoucher.value}%`}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-primary font-bold text-xs hover:bg-red-50 h-10 rounded-xl flex items-center justify-center gap-1"
            onClick={() => setIsOpen(true)}
          >
            Lihat Semua Voucher
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-none">
          <DialogHeader className="p-5 pb-4 border-b bg-white">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Voucher Aktif
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh] px-5 py-4 bg-[#f9fafb]">
            <div className="space-y-4 pb-4">
              {activeVouchers.map((v) => (
                <div
                  key={v.id}
                  className="relative group flex border border-gray-100 border-l-primary border-r-primary border-l-4 border-r-4 rounded-2xl transition-all bg-white shadow-sm hover:shadow-md h-28"
                >
                  {/* Left Side (3/4) - Main Info */}
                  <div className="w-[70%] p-4 pl-7 flex flex-col justify-center rounded-l-2xl">
                    <h4 className="font-bold text-sm text-gray-900 leading-tight line-clamp-1">
                      {v.name}
                    </h4>

                    {v.description && (
                      <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                        {v.description}
                      </p>
                    )}
                  </div>

                  {/* Vertical Perforation Line (Red Dashed) */}
                  <div className="relative flex items-center justify-center">
                    <div className="h-[70%] border-l-2 border-dashed border-red-500/20" />
                  </div>

                  {/* Right Side (1/4) - Discount Value */}
                  <div className="flex-1 flex flex-col items-center justify-center p-2 bg-red-50/10 text-center rounded-r-2xl">
                    <p className="text-primary font-black text-lg leading-none">
                      {v.type === "FIXED"
                        ? formatRupiah(v.value)
                            .replace(",00", "")
                            .replace("Rp ", "")
                        : `${v.value}%`}
                    </p>
                    {v.type === "FIXED" && (
                      <span className="text-[8px] font-black text-primary">
                        RIBU
                      </span>
                    )}
                    <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">
                      {v.type === "FIXED" ? "Potongan" : "Diskon"}
                    </span>
                  </div>

                  {/* Ticket decorative notches (Left & Right) */}
                  <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#f9fafb] border-2 border-primary z-20 shadow-none" />
                  <div className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#f9fafb] border-2 border-primary z-20 shadow-none" />
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-5 border-t bg-white">
            <Button
              className="w-full h-12 rounded-xl font-bold text-base"
              onClick={() => setIsOpen(false)}
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
