import Link from "next/link";
import EmptyCart from "../../features/cart/ui/empty-cart";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateToYYYYMMDD } from "@/helper/date-helper";
import { formatToHour } from "@/helper/hour-helper";
import NavButton from "@/components/nav-button";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/config/auth";
import { redirect } from "next/navigation";
import { getCart } from "@/features/cart/lib/cart-queries";
import { getImageUrl } from "@/helper/get-image-url";

export default async function GuestCartPage() {
  const session = await auth();

  // Redirect untuk pilih barang
  if (!session) {
    redirect("/kantin/kantin-kudapan");
  }

  if (!session.user.cartId) {
    redirect("/kantin/kantin-kudapan");
  }

  const data = await getCart(session.user.cartId);

  if (!data || (data && data.shop_carts.length === 0)) {
    return <EmptyCart shopping_url={"/kantin/kantin-kudapan"} />;
  }

  return (
    <div>
      <div className="w-full p-4 flex items-center text-primary-foreground justify-between bg-linear-to-r from-primary to-primary/90">
        <div className="flex gap-2 items-center ">
          <NavButton size="icon" variant="ghost" href="/chat">
            <ChevronLeft />
          </NavButton>

          <h1 className="text-xl">Keranjang</h1>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-7">
        {data.shop_carts.map((shopCart, idx) => (
          <Link href={"/keranjang/" + shopCart.id} key={idx}>
            <Card className="relative">
              <CardContent className="flex gap-4">
                <Image
                  src={getImageUrl(shopCart.shop.image_url)}
                  alt="shop image"
                  className="rounded-lg"
                  width={100}
                  height={100}
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
    </div>
  );
}
