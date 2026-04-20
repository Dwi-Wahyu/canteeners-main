import Link from "next/link";
import EmptyCart from "../../features/cart/ui/empty-cart";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateToYYYYMMDD } from "@/helper/date-helper";
import { formatToHour } from "@/helper/hour-helper";
import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import { getCart } from "@/features/cart/lib/cart-queries";
import { getImageUrl } from "@/helper/get-image-url";
import { BottomNav } from "@/components/layouts/bottom-nav";

export default async function CartPage() {
  const session = await auth();

  // Redirect jika belum login
  if (!session) {
    redirect("/login-pelanggan");
  }

  // Jika tidak ada cartId atau data keranjang kosong, tampilkan EmptyCart
  const data = session.user.cartId ? await getCart(session.user.cartId) : null;

  if (!data || (data && data.shop_carts.length === 0)) {
    return (
      <div className=" flex flex-col">
        <div className="flex-1 w-full justify-center">
          <EmptyCart shopping_url={"/kantin"} />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="p-5">
      <h1 className="text-lg font-semibold mb-4">Keranjang</h1>

      <div className="flex flex-col gap-7">
        {data.shop_carts.map((shopCart, idx) => (
          <Link href={"/keranjang/" + shopCart.id} key={idx}>
            <Card className="relative">
              <CardContent className="flex gap-4">
                <img
                  src={getImageUrl("/shop/" + shopCart.shop.image_url)}
                  alt="shop image"
                  className="rounded-lg w-[100px] h-[100px] object-cover"
                />

                <div>
                  <h1 className="font-semibold">{shopCart.shop.name}</h1>
                  <h1 className="text-muted-foreground">
                    {shopCart._count.items} Produk
                  </h1>
                  <h1 className="text-sm text-muted-foreground ">
                    {formatDateToYYYYMMDD(shopCart.created_at)}{" "}
                    {formatToHour(shopCart.created_at)}
                  </h1>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
