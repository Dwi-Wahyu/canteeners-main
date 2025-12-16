import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";

import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";
import Link from "next/link";
import { EllipsisVertical, StickyNote, Trash } from "lucide-react";
import { formatRupiah } from "@/helper/format-rupiah";
import { changeCartItemDetails, deleteCartItem } from "../lib/cart-actions";
import { GetShopCartItemType } from "../types/cart-queries-types";
import CartItemDialog from "./cart-item-dialog";
import { getImageUrl } from "@/helper/get-image-url";

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
  const [qty, setQty] = useState(cartItem.quantity);

  const mutation = useMutation({
    mutationFn: async ({ quantity }: { quantity: number }) => {
      return await changeCartItemDetails({
        id: cartItem.id,
        quantity,
        notes: null,
      });
    },
    onSuccess: () => {
      toast.success("Perubahan keranjang berhasil disimpan.");
    },
    onError: (error) => {
      toast.error("Gagal menyimpan perubahan. Silakan coba lagi.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await deleteCartItem(cartItem.id);
    },
    onSuccess: () => {
      toast.success("Berhasil menghapus item.");
    },
    onError: (error) => {
      toast.error("Gagal menghapus item. Silakan coba lagi.");
    },
  });

  const changeQuantity = useCallback(
    (newQty: number) => {
      if (newQty >= 1) {
        setQty(newQty);
        mutation.mutate({ quantity: newQty });
      }
    },
    [mutation]
  );

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
            onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")} // Fallback jika gambar gagal dimuat
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
                  onClick={() => changeQuantity(qty - 1)}
                  disabled={qty <= 1 || mutation.isPending || disabled}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={qty}
                  onChange={(e) => changeQuantity(Number(e.target.value))}
                  className="w-16 text-center "
                  min={1}
                />
                <Button
                  size="icon"
                  onClick={() => changeQuantity(qty + 1)}
                  disabled={mutation.isPending || disabled}
                >
                  +
                </Button>
              </div>

              <Button
                variant="destructive"
                size="icon"
                disabled={
                  deleteMutation.isPending || disabled || disabledDeleteButton
                }
                onClick={() => deleteMutation.mutate()}
              >
                <Trash />
              </Button>
            </div>
          </div>
        </div>

        {cartItem.notes && (
          <div className="flex gap-1 items-center mt-3 text-muted-foreground">
            <StickyNote className="w-4 h-4" />
            <h1>{cartItem.notes}</h1>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
