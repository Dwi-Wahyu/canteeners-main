"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";
import Link from "next/link";
import { EllipsisVertical, StickyNote, Trash, Loader2 } from "lucide-react"; // Menambahkan Loader2 untuk indikator loading
import { formatRupiah } from "@/helper/format-rupiah";
import { changeCartItemDetails, deleteCartItem } from "../lib/cart-actions";
import { GetShopCartItemType } from "../types/cart-queries-types";
import { getImageUrl } from "@/helper/get-image-url";
import { useRouter } from "nextjs-toploader/app";

export default function CartItemCard({
  cartItem,
  disabled,
  disabledDeleteButton,
  cartItemDetailUrl,
}: {
  cartItem: GetShopCartItemType;
  disabled: boolean;
  disabledDeleteButton: boolean;
  cartItemDetailUrl: string;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(cartItem.quantity);
  const [isPending, startTransition] = useTransition();

  async function handleChangeQuantity(newQty: number) {
    if (newQty < 1) return;

    // Optimistic update pada state lokal agar UI terasa responsif
    setQty(newQty);

    startTransition(async () => {
      const result = await changeCartItemDetails({
        id: cartItem.id,
        quantity: newQty,
        note: cartItem.note,
      });

      if (result.success) {
        toast.success("Perubahan keranjang berhasil disimpan.");
        router.refresh();
      } else {
        toast.error("Gagal menyimpan perubahan. Silakan coba lagi.");
        // Revert qty jika gagal (opsional, tapi disarankan)
        setQty(cartItem.quantity);
      }
    });
  }

  // Fungsi untuk menghapus item
  async function handleDelete() {
    startTransition(async () => {
      const result = await deleteCartItem(cartItem.id);

      if (result?.success) {
        toast.success("Berhasil menghapus item.");
        router.refresh();
      } else {
        toast.error("Gagal menghapus item. Silakan coba lagi.");
      }
    });
  }

  return (
    <Card>
      <CardContent>
        <div className="flex gap-4">
          <Image
            src={getImageUrl(cartItem.product.image_url)}
            alt={cartItem.product.name}
            width={100}
            height={100}
            className="rounded-lg object-cover aspect-square"
            onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
          />
          <div className="w-full">
            <div className="flex justify-between items-center w-full">
              <h1 className="font-semibold text-start">
                {cartItem.product.name}
              </h1>
              <Link href={cartItemDetailUrl}>
                <EllipsisVertical className="w-5 h-5 text-muted-foreground" />
              </Link>
            </div>

            <h1 className="text-sm text-muted-foreground">
              {formatRupiah(cartItem.subtotal)}
            </h1>

            <div className="flex gap-4 mt-4 items-center">
              <div className="flex gap-2 items-center">
                <Button
                  size="icon"
                  onClick={() => handleChangeQuantity(qty - 1)}
                  disabled={qty <= 1 || isPending || disabled}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={qty}
                  onChange={(e) => handleChangeQuantity(Number(e.target.value))}
                  className="w-16 text-center"
                  min={1}
                  disabled={isPending || disabled}
                />
                <Button
                  size="icon"
                  onClick={() => handleChangeQuantity(qty + 1)}
                  disabled={isPending || disabled}
                >
                  +
                </Button>
              </div>

              <Button
                variant="destructive"
                size="icon"
                disabled={isPending || disabled || disabledDeleteButton}
                onClick={handleDelete}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {cartItem.note && (
          <div className="flex gap-1 items-center mt-3 text-muted-foreground">
            <StickyNote className="w-4 h-4" />
            <h1>{cartItem.note}</h1>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
