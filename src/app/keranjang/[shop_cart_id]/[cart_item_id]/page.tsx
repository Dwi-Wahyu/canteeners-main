import NavButton from "@/components/nav-button";
import { getCartItem } from "@/features/cart/lib/cart-queries";
import CartItemClient from "@/features/cart/ui/cart-item-client";
import DeleteCartItemDialog from "@/features/cart/ui/delete-cart-item-dialog";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function CartItemDetail({
  params,
}: {
  params: Promise<{ shop_cart_id: string; cart_item_id: string }>;
}) {
  const { cart_item_id, shop_cart_id } = await params;

  const data = await getCartItem(cart_item_id);

  if (!data) {
    return notFound();
  }

  return (
    <div>
      <div className="w-full p-4 flex justify-between items-center bg-linear-to-r text-primary-foreground from-primary to-primary/90">
        <div className="flex gap-2 items-center">
          <NavButton
            size="icon"
            variant="ghost"
            href={"/keranjang/" + shop_cart_id}
          >
            <ChevronLeft />
          </NavButton>

          <h1 className="text-xl leading-tight">Detail Item</h1>
        </div>

        <DeleteCartItemDialog
          cart_item_id={cart_item_id}
          shop_cart_id={shop_cart_id}
        />
      </div>

      <div className="p-5">
        <CartItemClient data={data} />
      </div>
    </div>
  );
}
