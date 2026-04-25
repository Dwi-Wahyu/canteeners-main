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

  const filteredVouchers = vouchers.filter((v) =>
    v.discount.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-12 rounded-2xl border-blue-100 bg-blue-50/30 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-all"
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
              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">
                Lihat
              </span>
            )}
            <ChevronDown className="size-4 opacity-50" />
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-t-3xl sm:rounded-3xl">
        <DialogHeader className="p-5 pb-2">
          <DialogTitle className="text-xl font-bold">Voucher Saya</DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Cari voucher..."
              className="pl-10 rounded-xl bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="h-[400px] px-5 pb-5">
          <div className="space-y-3">
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
                  <div
                    key={v.id}
                    className={cn(
                      "group border rounded-2xl transition-all overflow-hidden bg-white",
                      isSelected
                        ? "border-blue-500 ring-1 ring-blue-500"
                        : "border-gray-100",
                      isInvalid && "opacity-60 grayscale",
                    )}
                  >
                    <div className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 leading-tight truncate">
                          {v.discount.name}
                        </h4>
                        <p className="text-[11px] text-blue-600 font-bold mt-0.5">
                          {v.discount.type === "FIXED"
                            ? `Potongan ${formatRupiah(v.discount.value)}`
                            : `Diskon ${v.discount.value}%`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setExpandedId(isExpanded ? null : v.id)
                          }
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Info className="size-4 text-gray-400" />
                        </button>
                        <Button
                          size="sm"
                          disabled={isInvalid}
                          className={cn(
                            "h-8 w-20 rounded-lg font-bold text-[10px] transition-all",
                            isSelected
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-blue-50 text-blue-700 hover:bg-blue-100",
                          )}
                          onClick={() => onToggle(v.id)}
                        >
                          {isSelected ? (
                            <div className="flex items-center gap-1">
                              <Check className="size-3" /> Terpasang
                            </div>
                          ) : (
                            "Gunakan"
                          )}
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-dashed border-gray-100 animate-in slide-in-from-top-2 duration-200">
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {v.discount.description ||
                              "Tidak ada deskripsi tambahan."}
                          </p>
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <div className="bg-gray-50 p-2 rounded-lg">
                              <p className="text-[9px] text-gray-400 uppercase font-bold">
                                Min. Belanja
                              </p>
                              <p className="text-xs font-bold text-gray-700">
                                {v.discount.min_purchase
                                  ? formatRupiah(v.discount.min_purchase)
                                  : "Tanpa Minimum"}
                              </p>
                            </div>
                            {v.discount.type === "PERCENTAGE" && (
                              <div className="bg-gray-50 p-2 rounded-lg">
                                <p className="text-[9px] text-gray-400 uppercase font-bold">
                                  Maks. Potongan
                                </p>
                                <p className="text-xs font-bold text-gray-700">
                                  {v.discount.max_discount
                                    ? formatRupiah(v.discount.max_discount)
                                    : "Tak Terbatas"}
                                </p>
                              </div>
                            )}
                          </div>
                          {isInvalid && (
                            <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                              * Belum mencapai minimum belanja
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="p-5 border-t bg-gray-50/50">
          <Button
            className="w-full h-11 rounded-xl font-bold"
            onClick={() => setIsOpen(false)}
          >
            Selesai
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
