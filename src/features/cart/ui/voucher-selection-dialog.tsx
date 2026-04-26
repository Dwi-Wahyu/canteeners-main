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
import { Input } from "@/components/ui/input";
import {
  Search,
  Gift,
  ChevronDown,
  ChevronUp,
  Check,
  Info,
} from "lucide-react";
import { formatRupiah } from "@/helper/format-rupiah";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Voucher {
  id: string;
  discount: {
    name: string;
    description: string | null;
    value: number;
    type: "FIXED" | "PERCENTAGE";
    max_discount: number | null;
    min_purchase: number | null;
    status: string;
  };
}

export default function VoucherSelectionDialog({
  vouchers,
  selectedIds,
  onToggle,
  totalPrice,
}: {
  vouchers: Voucher[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  totalPrice: number;
}) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const filteredVouchers = vouchers.filter(
    (v) =>
      v.discount.name.toLowerCase().includes(search.toLowerCase()) &&
      v.discount.status === "ACTIVE",
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-12 rounded-2xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary transition-all"
        >
          <div className="flex items-center gap-2">
            <Gift className="size-4" />
            <span className="font-bold text-sm">
              {selectedIds.length > 0
                ? `${selectedIds.length} Voucher Terpasang`
                : "Gunakan Voucher"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {selectedIds.length > 0 && (
              <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">
                Lihat
              </span>
            )}
            <ChevronDown className="size-4 opacity-50" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-none">
        <DialogHeader className="p-5 pb-2">
          <DialogTitle className="text-xl font-bold">Voucher Saya</DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Cari voucher..."
              className="pl-10 rounded-xl bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="h-[450px] px-5 py-4">
          <div className="space-y-4">
            {filteredVouchers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">
                  Voucher tidak ditemukan
                </p>
              </div>
            ) : (
              filteredVouchers.map((v) => {
                const isSelected = selectedIds.includes(v.id);
                const isExpanded = expandedId === v.id;
                const isInvalid = v.discount.min_purchase
                  ? totalPrice < v.discount.min_purchase
                  : false;

                return (
                  <div key={v.id} className="relative flex flex-col">
                    <div
                      className={cn(
                        "relative group flex border border-gray-100 border-l-primary border-r-primary border-l-4 border-r-4 rounded-2xl transition-all bg-white shadow-sm min-h-[100px]",
                        isInvalid && "opacity-60 grayscale",
                      )}
                    >
                      {/* Left Side (3/4) - Main Info & Button */}
                      <div className="w-[70%] p-4 pl-7 flex flex-col justify-center rounded-l-2xl gap-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-gray-900 leading-tight line-clamp-1">
                              {v.discount.name}
                            </h4>
                            <button
                              onClick={() =>
                                setExpandedId(isExpanded ? null : v.id)
                              }
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                            >
                              <Info className="size-3.5 text-gray-400" />
                            </button>
                          </div>

                          {isInvalid && (
                            <p className="text-[9px] text-red-500 font-bold mt-1">
                              Min. {formatRupiah(v.discount.min_purchase!)}
                            </p>
                          )}
                        </div>

                        <Button
                          size="sm"
                          disabled={isInvalid}
                          className={cn(
                            "h-7 px-4 w-fit rounded-lg font-bold text-[10px] transition-all shadow-sm",
                            isSelected
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-primary hover:bg-primary/90 text-white",
                          )}
                          onClick={() => onToggle(v.id)}
                        >
                          {isSelected ? "Dipasang" : "Gunakan"}
                        </Button>
                      </div>

                      {/* Vertical Perforation Line (Red Dashed) */}
                      <div className="relative flex items-center justify-center">
                        <div className="h-[70%] border-l-2 border-dashed border-red-500/20" />
                      </div>

                      {/* Right Side (1/4) - Discount Value Only */}
                      <div className="flex-1 flex flex-col items-center justify-center p-2 text-center rounded-r-2xl">
                        <div className="flex flex-col items-center">
                          <p className="text-primary font-black text-xl leading-none">
                            {v.discount.type === "FIXED"
                              ? formatRupiah(v.discount.value)
                                  .replace(",00", "")
                                  .replace("Rp ", "")
                              : `${v.discount.value}%`}
                          </p>
                          {v.discount.type === "FIXED" && (
                            <span className="text-[10px] font-black text-primary tracking-tighter">
                              RIBU
                            </span>
                          )}
                          <span className="text-[8px] font-bold text-gray-400 uppercase mt-1">
                            OFF
                          </span>
                        </div>
                      </div>

                      {/* Ticket decorative notches (Left & Right) */}
                      <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-primary z-20 shadow-none" />
                      <div className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-primary z-20 shadow-none" />
                    </div>

                    {/* Expansion Area */}
                    {isExpanded && (
                      <div className="mx-4 p-4 bg-white border-x border-b shadow rounded-b-xl -mt-2 pt-6 animate-in slide-in-from-top-2 duration-200">
                        <div className="space-y-2">
                          <p className="text-[10px] text-gray-600 leading-relaxed">
                            {v.discount.description ||
                              "Tidak ada deskripsi tambahan."}
                          </p>
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <p className="text-[8px] text-gray-400 uppercase font-bold">
                                Min. Belanja
                              </p>
                              <p className="text-[10px] font-bold text-gray-700">
                                {v.discount.min_purchase
                                  ? formatRupiah(v.discount.min_purchase)
                                  : "Tanpa Minimum"}
                              </p>
                            </div>
                            {v.discount.type === "PERCENTAGE" && (
                              <div className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-[8px] text-gray-400 uppercase font-bold">
                                  Maks. Potongan
                                </p>
                                <p className="text-[10px] font-bold text-gray-700">
                                  {v.discount.max_discount
                                    ? formatRupiah(v.discount.max_discount)
                                    : "Tak Terbatas"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="p-5 border-t bg-white">
          <Button
            className="w-full h-12 rounded-xl font-bold text-base"
            onClick={() => setIsOpen(false)}
          >
            Selesai
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
