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
}

export default function UserVouchersSection({
  vouchers,
}: {
  vouchers: UserVoucher[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!vouchers || vouchers.length === 0) {
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

  const previewVoucher = vouchers[0];

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
              Anda memiliki {vouchers.length} voucher aktif
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary font-bold text-xs hover:bg-red-50"
            onClick={() => setIsOpen(true)}
          >
            Lihat Semua
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>

        {/* Mini Preview of first voucher */}
        <div className="px-5 pb-5 pt-0">
          <div className="bg-gray-50 rounded-xl p-3 border border-dashed border-gray-200 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                Voucher Terdekat
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
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-t-3xl sm:rounded-3xl border-none">
          <DialogHeader className="p-5 pb-4 border-b">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Ticket className="size-5 text-primary" />
              Voucher Aktif
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh] px-5 py-4">
            <div className="space-y-4 pb-4">
              {vouchers.map((v) => (
                <div
                  key={v.id}
                  className="relative group border rounded-2xl transition-all overflow-hidden bg-white shadow-sm hover:shadow-md border-gray-100"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                  
                  <div className="p-4 pl-6 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 leading-tight">
                        {v.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[11px] text-primary font-black">
                          {v.type === "FIXED"
                            ? `Potongan ${formatRupiah(v.value)}`
                            : `Diskon ${v.value}%`}
                        </p>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          Aktif
                        </span>
                      </div>
                      {v.description && (
                        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                          {v.description}
                        </p>
                      )}
                    </div>

                    <div className="bg-gray-50 p-2 rounded-xl">
                       <Gift className="size-5 text-primary opacity-20" />
                    </div>
                  </div>
                  
                  {/* Ticket decorative punch holes */}
                  <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-50 border-r border-gray-100" />
                  <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-50 border-l border-gray-100" />
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-5 border-t bg-gray-50/50">
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
