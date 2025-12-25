"use client";

import * as React from "react";
import { ShoppingBasket, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getCart } from "../lib/cart-queries";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/helper/get-image-url";

// Define types based on query return since we can't import them directly if they aren't exported
type CartData = Awaited<ReturnType<typeof getCart>>;

export function CartDrawer({ cart_id }: { cart_id?: string }) {
  const [open, setOpen] = React.useState(false);
  const [cart, setCart] = React.useState<CartData | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && cart_id) {
      setLoading(true);
      getCart(cart_id)
        .then((data) => setCart(data))
        .catch((err) => console.error("Failed to fetch cart", err))
        .finally(() => setLoading(false));
    }
  }, [open, cart_id]);

  const totalItemCount =
    cart?.shop_carts.reduce((acc, shopCart) => {
      return acc + (shopCart._count?.items ?? 0);
    }, 0) ?? 0;

  const totalPrice =
    cart?.shop_carts.reduce((acc, shopCart) => {
      // Calculate total manually or use shopCart.total_price if reliable.
      // The query returns items with subtotals, let's sum them up for accuracy or use shop_cart total.
      // Using item subtotals might be safer if logic matches.
      const shopTotal = shopCart.items.reduce(
        (sAcc, item) => sAcc + item.subtotal,
        0
      );
      return acc + shopTotal;
    }, 0) ?? 0;

  const isEmpty = !cart || cart.shop_carts.length === 0 || totalItemCount === 0;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size={"icon-lg"} className="relative">
          <ShoppingBasket className="h-5 w-5" />
          {totalItemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {totalItemCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full flex flex-col h-full">
          <DrawerHeader>
            <DrawerTitle className="text-start flex items-center gap-2">
              {!isEmpty && (
                <>
                  <ShoppingBasket className="w-5 h-5" /> Keranjang Belanja
                </>
              )}
            </DrawerTitle>
            <DrawerDescription className="text-start">
              {!isEmpty && "Review item yang akan dibeli dari berbagai kedai."}
            </DrawerDescription>
          </DrawerHeader>

          {loading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBasket className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-1 mb-24">
                <h3 className="font-semibold text-lg">Keranjang Kosong</h3>
                <p className="text-sm text-muted-foreground">
                  Belum ada menu yang dipilih. Yuk mulai jajan sekarang!
                </p>
              </div>
              <DrawerClose asChild>
                <Button className="w-full">Mulai Jajan</Button>
              </DrawerClose>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-4 overflow-y-auto">
                <div className="space-y-6 pb-6">
                  {cart?.shop_carts.map(
                    (shopCart) =>
                      shopCart.items.length > 0 && (
                        <div key={shopCart.id} className="space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b">
                            <Store className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-sm">
                              {shopCart.shop.name}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {shopCart.items.map((item) => (
                              <div key={item.id} className="flex gap-3">
                                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                                  {item.product.image_url ? (
                                    <Image
                                      src={getImageUrl(item.product.image_url)}
                                      alt={item.product.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                      No Img
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium truncate">
                                    {item.product.name}
                                  </h4>
                                  {item.selected_options.length > 0 && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {item.selected_options
                                        .map((opt) => opt.value)
                                        .join(", ")}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-muted-foreground">
                                      {item.quantity} x Rp{" "}
                                      {(
                                        item.subtotal / item.quantity || 0
                                      ).toLocaleString("id-ID")}
                                    </p>
                                    <p className="text-sm font-semibold">
                                      Rp {item.subtotal.toLocaleString("id-ID")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t bg-background mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Total Estimasi</span>
                  <span className="text-lg font-bold">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <DrawerFooter className="p-0">
                  <DrawerClose asChild>
                    <Link
                      href={
                        cart.shop_carts.length === 1
                          ? "/keranjang/" + cart.shop_carts[0].id
                          : "/keranjang"
                      }
                      className="w-full"
                    >
                      <Button className="w-full" size="lg">
                        Lihat Keranjang
                      </Button>
                    </Link>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
