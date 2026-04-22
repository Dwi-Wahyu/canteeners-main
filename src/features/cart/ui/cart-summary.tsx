"use client";

import { useQuery } from "@tanstack/react-query";
import { getCart } from "../lib/cart-queries";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { formatRupiah } from "@/helper/format-rupiah";

export function CartSummary({ cartId }: { cartId: string }) {
  const { data: cart } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: () => getCart(cartId),
    enabled: !!cartId,
  });

  const shopCarts = (cart?.shop_carts || []).filter(sc => sc._count.items > 0);
  
  const totalItems = shopCarts.reduce(
    (acc, shopCart) => acc + shopCart._count.items,
    0,
  );
  
  const totalPrice = shopCarts.reduce((acc, shopCart) => {
    return acc + shopCart.items.reduce((sum, item) => sum + item.subtotal, 0);
  }, 0);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-24 left-0 w-full px-5 z-40">
      <Link
        href="/keranjang"
        className="flex items-center justify-between bg-primary text-primary-foreground px-6 py-4 rounded-full shadow-lg active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary">
              {totalItems}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold">{formatRupiah(totalPrice)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 font-bold">
          <span>Lihat Keranjang</span>
        </div>
      </Link>
    </div>
  );
}
