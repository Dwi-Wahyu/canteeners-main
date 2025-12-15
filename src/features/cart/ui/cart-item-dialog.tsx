"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { EllipsisVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeCartItemOption } from "../lib/cart-actions";
import { GetCustomerShopCartCartItemType } from "../types/cart-queries-types";

export default function CartItemDialog({
  handleDialogOpenChange,
  handleSave,
  isDialogOpen,
  notes,
  setNotes,
  isPending,
  cartItem,
  onOptionRemoved,
}: {
  handleDialogOpenChange: (open: boolean) => void;
  handleSave: () => void;
  notes: string;
  setNotes: (notes: string) => void;
  isDialogOpen: boolean;
  isPending: boolean;
  cartItem: GetCustomerShopCartCartItemType;
  onOptionRemoved: () => void; // refresh data setelah hapus
}) {
  // Fungsi hapus satu variant
  const handleRemoveOption = async (optionValueId: string) => {
    if (isPending) return;

    const confirmed = confirm("Hapus pilihan ini dari pesanan?");
    if (!confirmed) return;

    const result = await removeCartItemOption(cartItem.id, optionValueId);

    if (result) {
      toast.success("Pilihan berhasil dihapus");
      onOptionRemoved(); // trigger refresh di parent
    } else {
      toast.error("Gagal menghapus pilihan");
    }
  };

  // Kelompokkan variant
  const groupedOptions = cartItem.selected_options.reduce((acc, item) => {
    const key = item.product_option.option;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, typeof cartItem.selected_options>);

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical className="text-muted-foreground" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{cartItem.product.name}</DialogTitle>
          <DialogDescription>
            {cartItem.quantity} × Rp
            {cartItem.price_at_add.toLocaleString("id-ID")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5 text-sm">
          {/* Variant yang bisa dihapus */}
          {Object.entries(groupedOptions).length > 0 ? (
            Object.entries(groupedOptions).map(([optionName, values]) => (
              <div
                key={optionName}
                className="border-b last:border-b-0 pb-4 last:pb-0"
              >
                <p className="font-medium text-foreground mb-2">{optionName}</p>
                <div className="space-y-2">
                  {values.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex items-center justify-between bg-accent/30 rounded-md px-3 py-2"
                    >
                      <div className="flex-1">
                        <span className="text-foreground">{opt.value}</span>
                        {opt.additional_price && opt.additional_price > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (+Rp{opt.additional_price.toLocaleString("id-ID")})
                          </span>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveOption(opt.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground italic">
              Tidak ada varian dipilih
            </p>
          )}

          {/* Catatan */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Catatan</label>
            <Textarea
              placeholder="Tanpa bawang, pedas banget, dll..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24 resize-none"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isPending}
            size="lg"
            className="w-full"
          >
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
