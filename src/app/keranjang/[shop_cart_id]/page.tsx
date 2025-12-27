import NavButton from "@/components/nav-button";
import { auth } from "@/config/auth";
import { getShopCart } from "@/features/cart/lib/cart-queries";
import DeleteShopCartDialog from "@/features/cart/ui/delete-shop-cart-dialog";
import ShopCartClient from "@/features/cart/ui/shop-cart-client";
import { getCustomerProfile } from "@/features/user/lib/user-queries";
import { ChevronLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

export default async function GuestShopCartPage({
  params,
}: {
  params: Promise<{ shop_cart_id: string }>;
}) {
  const session = await auth();

  // fix agar menampilkan text sesi tidak terbaca
  if (!session) {
    redirect("/kantin/kantin-kudapan");
  }

  if (!session.user.cartId) {
    redirect("/kantin/kantin-kudapan");
  }

  if (!session.user.customerId) {
    redirect("/kantin/kantin-kudapan");
  }

  const { shop_cart_id } = await params;

  const shopCart = await getShopCart({
    shop_cart_id,
    cart_id: session.user.cartId,
  });

  if (!shopCart) {
    return notFound();
  }

  const customerProfile = await getCustomerProfile(session.user.customerId);

  if (!customerProfile) {
    return notFound();
  }

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

      <div className="p-5">
        <ShopCartClient
          userId={session.user.id}
          customerProfile={customerProfile}
          shopCart={shopCart}
          nameAlreadySet={session.user.name !== ""}
        />
      </div>
    </div>
  );
}
