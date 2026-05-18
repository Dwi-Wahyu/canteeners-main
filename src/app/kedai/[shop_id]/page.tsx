import NavButton from "@/components/nav-button";
import { auth } from "@/config/auth";
import { getExistingPendingShopCart } from "@/features/cart/lib/cart-queries";
import CreateShopConversation from "@/features/chat/ui/create-shop-conversation";
import { getShopAndProducts } from "@/features/shop/lib/shop-queries";
import { ShopProductsSearchParams } from "@/features/shop/types/shop-search-params";
import { getImageUrl } from "@/helper/get-image-url";
import { formatToHour } from "@/helper/hour-helper";
import { ChevronLeft, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SearchParams } from "nuqs";

interface IndexPageProps {
  params: Promise<{ shop_id: string }>;
  searchParams: Promise<SearchParams>;
}

import ShopDetailClient from "@/features/shop/ui/shop-detail-client";

export default async function ShopDetail({
  params,
  searchParams,
}: IndexPageProps) {
  const { shop_id } = await params;

  const search = await ShopProductsSearchParams.parse(searchParams);

  const shop = await getShopAndProducts(shop_id, search);

  if (!shop) {
    return notFound();
  }

  const session = await auth();

  const pendingShopCart = await getExistingPendingShopCart({
    cart_id: session?.user.cartId ?? "",
    shop_id,
  });

  return (
    <div className="relative w-full min-h-screen bg-background">
      <div className="fixed top-0 left-0 w-full h-[25vh] z-0">
        <img
          className="w-full h-full object-cover"
          src={getImageUrl("/shop/" + shop.image_url)}
          alt={shop.name}
        />

        <div className="absolute inset-0 bg-black/50 z-10" />

        <div className="absolute inset-0 z-20 p-5 flex flex-col justify-between text-white">
          <div className="flex justify-between items-center">
            <Link href={"/kantin/" + shop.canteen.slug}>
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <div className="flex gap-1 items-center">
              <CreateShopConversation
                userId={session?.user.id}
                displayName={session?.user.name}
                ownerId={shop.owner.user.id}
                ownerName={shop.owner.user.name}
                ownerAvatar={shop.owner.user.avatar}
              />

              <NavButton
                href={"/kedai/" + shop_id + "/testimoni"}
                variant="ghost"
              >
                <Star />
              </NavButton>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{shop.name}</h1>
              {shop.status === "BUSY" && (
                <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  Sibuk
                </span>
              )}
              {shop.status === "SUSPENDED" && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  Dinonaktifkan
                </span>
              )}
            </div>
            <p className="text-muted text-sm mt-1">{shop.description}</p>
            {shop.open_time && shop.close_time && (
              <p className="text-muted text-sm mt-1">
                {formatToHour(shop.open_time)} - {formatToHour(shop.close_time)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-30 mt-[20vh] w-full bg-background min-h-screen shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="p-5 flex flex-col gap-4">
          {shop.status === "SUSPENDED" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-2">
              <h3 className="font-bold text-red-800 text-sm">
                Kedai Saat Ini Tidak Tersedia
              </h3>
              <p className="text-xs text-red-700 mt-1">
                {shop.suspended_reason ||
                  "Kedai ini sedang dinonaktifkan oleh administrator dan tidak dapat menerima pesanan."}
              </p>
            </div>
          )}

          {shop.violations && shop.violations.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-bold text-amber-800 text-sm flex items-center gap-2">
                Peringatan Performa Kedai
              </h3>
              <p className="text-xs text-amber-700 mt-1">
                Kedai ini memiliki catatan pelanggaran yang mungkin mempengaruhi
                pengalaman pesanan Anda.
              </p>
            </div>
          )}

          {shop.status !== "SUSPENDED" ? (
            <ShopDetailClient
              shop={shop}
              cartId={session?.user.cartId}
              pendingShopCart={pendingShopCart}
            />
          ) : (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
              Menu tidak tersedia saat kedai dinonaktifkan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
