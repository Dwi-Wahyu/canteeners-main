import EmptyCart from "../../features/cart/ui/empty-cart";
import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import { getCart } from "@/features/cart/lib/cart-queries";
import { getImageUrl } from "@/helper/get-image-url";
import { BottomNav } from "@/components/layouts/bottom-nav";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CartShopCard from "@/features/cart/ui/cart-shop-card";

export default async function CartPage() {
  const session = await auth();

  const data = session?.user.cartId ? await getCart(session.user.cartId) : null;

  if (!data || (data && data.shop_carts.length === 0)) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 w-full justify-center">
          <EmptyCart shopping_url={"/kantin/kantin-kudapan"} />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 p-5 pb-24">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-xl font-semibold">Keranjang</h1>
          <Badge variant="secondary" className="ml-auto">
            {data.shop_carts.length} Kedai
          </Badge>
        </div>

        <div className="flex flex-col gap-4">
          {data.shop_carts.map((shopCart, idx) => {
            // Ambil maks 3 produk unik untuk preview
            const seen = new Set<string>();
            const uniqueProducts: {
              id: string;
              name: string;
              imageUrl: string;
            }[] = [];
            for (const item of shopCart.items) {
              if (!seen.has(item.product.id) && uniqueProducts.length < 3) {
                seen.add(item.product.id);
                uniqueProducts.push({
                  id: item.product.id,
                  name: item.product.name,
                  imageUrl: getImageUrl("/product/" + item.product.image_url),
                });
              }
            }

            const extraCount =
              shopCart._count.items > 3 ? shopCart._count.items - 3 : 0;

            return (
              <CartShopCard
                key={idx}
                id={shopCart.id}
                shopName={shopCart.shop.name}
                totalPrice={shopCart.total_price}
                itemCount={shopCart._count.items}
                createdAt={shopCart.created_at}
                previewProducts={uniqueProducts}
                extraCount={extraCount}
              />
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
