import NavButton from "@/components/nav-button";
import { getCustomerShopCart } from "@/features/cart/lib/cart-queries";
import DeleteShopCartDialog from "@/features/cart/ui/delete-shop-cart-dialog";
import ShopCartClient from "@/features/cart/ui/shop-cart-client";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function GuestShopCartPage({
  params,
}: {
  params: Promise<{ shop_cart_id: string }>;
}) {
  const { shop_cart_id } = await params;

  const shopCart = await getCustomerShopCart(shop_cart_id);

  if (!shopCart) {
    return notFound();
  }

  const now = new Date();

  const open_time = shopCart.shop.open_time;
  const close_time = shopCart.shop.close_time;

  const ableToCheckout =
    shopCart.shop.status === "ACTIVE" ||
    (open_time !== null &&
      close_time !== null &&
      now >= open_time &&
      now <= close_time);

  return (
    <div>
      <div className="w-full p-4 flex justify-between items-center bg-linear-to-r text-primary-foreground from-primary to-primary/90">
        <div className="flex gap-2 items-center">
          <NavButton size="icon" variant="ghost" href="/chat">
            <ChevronLeft />
          </NavButton>

          <div>
            <h1 className="text-xl leading-tight">Keranjang</h1>

            <h1 className="text-sm">
              {shopCart.items.length} item dari {shopCart.shop.name}
            </h1>
          </div>
        </div>

        <DeleteShopCartDialog backUrl="/keranjang" shop_cart_id={shopCart.id} />
      </div>

      <ShopCartClient
        // customerProfile={}
        shopCart={shopCart}
        ableToCheckout={ableToCheckout}
        open_time={open_time}
        close_time={close_time}
      />
    </div>
  );
}
