import NavButton from "@/components/nav-button";
import { auth } from "@/config/auth";
import { getExistingPendingShopCart } from "@/features/cart/lib/cart-queries";
import { getShopAndProducts } from "@/features/shop/lib/shop-queries";
import { ShopProductsSearchParams } from "@/features/shop/types/shop-search-params";
import ShopProductList from "@/features/shop/ui/shop-product-list";
import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";
import { ChevronLeft, MessageCircle, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SearchParams } from "nuqs";

interface IndexPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function ShopDetail({
  params,
  searchParams,
}: IndexPageProps) {
  const { id } = await params;

  const search = await ShopProductsSearchParams.parse(searchParams);

  const shop = await getShopAndProducts(id, search);

  if (!shop) {
    return notFound();
  }

  const session = await auth();

  const pendingShopCart = await getExistingPendingShopCart({
    cart_id: session?.user.cartId ?? "",
    shop_id: id,
  });

  return (
    <div className="relative w-full min-h-screen bg-background">
      <div className="fixed top-0 left-0 w-full h-[25vh] z-0">
        <img
          className="w-full h-full object-cover"
          src={getImageUrl(shop.image_url)}
          alt={shop.name}
        />

        <div className="absolute inset-0 bg-black/50 z-10" />

        <div className="absolute inset-0 z-20 p-5 flex flex-col justify-between text-white">
          <div className="flex justify-between items-center">
            <Link href={"/kantin/" + shop.canteen.slug}>
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <div className="flex gap-1 items-center">
              <NavButton href={""} variant="ghost">
                <MessageCircle />
              </NavButton>

              <NavButton href={"/"} variant="ghost">
                <Star />
              </NavButton>
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight">{shop.name}</h1>
            <p className="text-muted text-sm mt-1">{shop.description}</p>
          </div>
        </div>
      </div>

      <div className="relative z-30 mt-[20vh] w-full bg-background min-h-screen shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="p-5">
          <ShopProductList shop={shop} />

          {pendingShopCart && (
            <div className="fixed w-full p-4 bottom-0 left-0">
              <Link
                href={"/keranjang/" + pendingShopCart.id}
                className="w-full flex justify-between  items-center bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow"
              >
                <div className="flex gap-1 items-center">
                  <ShoppingCart className="w-4 h-4" />
                  Lihat keranjang {pendingShopCart._count.items} item
                </div>

                <h1>{formatRupiah(pendingShopCart.total_price)}</h1>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
