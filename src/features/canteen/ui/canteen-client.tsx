"use client";

import { Suspense } from "react";
import CustomBadge from "@/components/custom-badge";
import { Card, CardContent } from "@/components/ui/card";
import { shopStatusMapping } from "@/constant/shop-status-mapping";
import CanteenTopbar from "@/features/canteen/ui/canteen-topbar";
import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";
import { MessageCircle, Star, Store } from "lucide-react";
import Link from "next/link";
import { GetCanteenBySlug } from "../types/canteen-queries-types";
import CashIcon from "@/components/icons/cash-icon";
import { CanteenCategoryFilter } from "./canteen-category-filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CartSummary } from "@/features/cart/ui/cart-summary";
import { Session } from "next-auth";
import { Loader2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { addToCart } from "@/features/cart/lib/cart-actions";
import { createGuestSession } from "@/helper/create-guest-session";
import { toast } from "sonner";
import { getCategories } from "@/features/category/lib/category-queries";
import { useCartAnimationStore } from "@/stores/use-cart-animation-store";

type ProductWithShopInfo =
  GetCanteenBySlug["shops"][number]["products"][number] & {
    shop_id: string;
    shop_name: string;
  };

interface FlyingImage {
  id: string;
  src: string;
  startPos: { x: number; y: number };
  targetPos: { x: number; y: number };
}

export default function CanteenClient({
  canteen,
  categories,
  session,
}: {
  canteen: GetCanteenBySlug;
  categories: Awaited<ReturnType<typeof getCategories>>;
  session: Session | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { triggerShake } = useCartAnimationStore();

  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [activeCartId, setActiveCartId] = useState<string | null>(
    session?.user.cartId || null,
  );
  const [flyingImage, setFlyingImage] = useState<FlyingImage | null>(null);

  const currentUrl = encodeURIComponent(
    `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
  );

  const allProducts: ProductWithShopInfo[] = canteen.shops.flatMap((shop) =>
    shop.products.map((product) => ({
      ...product,
      shop_id: shop.id,
      shop_name: shop.name,
    })),
  );

  async function handleAddClick(
    e: React.MouseEvent,
    product: ProductWithShopInfo,
  ) {
    e.preventDefault();
    e.stopPropagation();

    if (loadingProductId) return;

    // Animation logic
    const imgElement = e.currentTarget.closest(".group")?.querySelector("img");
    const cartElement = document.getElementById("cart-summary");

    if (imgElement && cartElement) {
      const imgRect = imgElement.getBoundingClientRect();
      const cartRect = cartElement.getBoundingClientRect();

      const startPos = {
        x: imgRect.left + imgRect.width / 2,
        y: imgRect.top + imgRect.height / 2,
      };

      const targetPos = {
        x: cartRect.left + cartRect.width / 2,
        y: cartRect.top + cartRect.height / 2,
      };

      setFlyingImage({
        id: Math.random().toString(),
        src: getImageUrl("/product/" + product.image_url),
        startPos,
        targetPos,
      });

      // Duration should match CSS animation
      setTimeout(() => {
        setFlyingImage(null);
        triggerShake();
      }, 600);
    }

    setLoadingProductId(product.id);

    try {
      let cartId = activeCartId;

      if (!cartId) {
        const { cartId: createdCartId } = await createGuestSession({
          name: "",
        });

        if (!createdCartId) {
          toast.error("Gagal membuat sesi tamu, silakan coba lagi");
          return;
        }
        cartId = createdCartId;
        setActiveCartId(cartId);
      }

      // Collect required options: use first value for each required option
      const selected_option_value_ids: string[] = [];
      if (product.options) {
        product.options.forEach((option) => {
          if (option.is_required && option.values && option.values.length > 0) {
            selected_option_value_ids.push(option.values[0].id);
          }
        });
      }

      const result = await addToCart({
        cartId: cartId!,
        shopId: product.shop_id,
        productId: product.id,
        quantity: 1,
        selected_option_value_ids,
      });

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["cart", cartId] });
      } else {
        toast.error(result.error.message || "Gagal menambahkan ke keranjang");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Terjadi kesalahan saat menambahkan ke keranjang");
    } finally {
      setLoadingProductId(null);
    }
  }

  return (
    <div>
      <style jsx global>{`
        @keyframes fly-to-cart {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--target-x), var(--target-y)) scale(0.1)
              rotate(720deg);
            opacity: 0.5;
          }
        }
        .animate-fly-to-cart {
          animation: fly-to-cart 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)
            forwards;
          pointer-events: none;
          z-index: 100;
        }
      `}</style>

      {flyingImage && (
        <img
          key={flyingImage.id}
          src={flyingImage.src}
          alt=""
          className="fixed w-20 h-20 object-cover rounded-lg animate-fly-to-cart"
          style={{
            top: flyingImage.startPos.y - 40,
            left: flyingImage.startPos.x - 40,
            // @ts-expect-error - CSS variables in style object
            "--target-x": `${flyingImage.targetPos.x - flyingImage.startPos.x}px`,
            "--target-y": `${flyingImage.targetPos.y - flyingImage.startPos.y}px`,
          }}
        />
      )}

      <Suspense fallback={<div className="p-4 h-16" />}>
        <CanteenTopbar shopCount={canteen.shops.length} />
      </Suspense>

      <CanteenCategoryFilter categories={categories} />

      <Tabs defaultValue="menu" className="w-full">
        <div className="px-5">
          <TabsList className="w-full">
            <TabsTrigger value="menu" className="w-full">
              Menu
            </TabsTrigger>
            <TabsTrigger value="kedai" className="w-full">
              Kedai
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kedai">
          <div className="flex flex-col gap-5 p-5">
            {canteen.shops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="bg-gray-100 p-4 rounded-full">
                  <Store className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Kedai Tidak Ditemukan
                  </h3>
                  <p className="text-sm text-gray-500 max-w-[200px] mx-auto">
                    Coba ubah kata kunci pencarian atau hapus filter kategori.
                  </p>
                </div>
              </div>
            ) : (
              canteen.shops.map((shop, idx) => (
                <Link
                  className="group"
                  href={`/kedai/${shop.id}?back_url=${currentUrl}`}
                  key={idx}
                >
                  <Card>
                    <CardContent className="flex gap-4">
                      <img
                        src={getImageUrl("/shop/" + shop.image_url)}
                        alt=""
                        className="aspect-square shadow rounded-lg w-1/3"
                      />

                      <div className="flex flex-col justify-between w-full">
                        <div>
                          <div className="flex items-center justify-between">
                            <h1 className="font-semibold">{shop.name}</h1>
                            <CustomBadge
                              value={shop.status}
                              successValues={["INACTIVE"]}
                              outlineValues={["INACTIVE"]}
                              destructiveValues={["SUSPENDED"]}
                            >
                              {shopStatusMapping[shop.status]}
                            </CustomBadge>
                          </div>

                          {shop.minimum_price && shop.maximum_price && (
                            <div className="flex gap-1 mt-2 items-center">
                              <CashIcon className="w-4 h-4" />
                              <h1 className="">
                                {formatRupiah(shop.minimum_price)} -{" "}
                                {formatRupiah(shop.maximum_price)}
                              </h1>
                            </div>
                          )}

                          {shop.specializations &&
                            shop.specializations.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {shop.specializations.map((spec, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="bg-red-50 text-[10px] text-red-600 border-red-100 font-medium py-0 px-1.5"
                                  >
                                    {spec.category.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                        </div>

                        <div className="flex gap-2 text-muted-foreground justify-end w-full">
                          <div className="flex gap-1 items-center">
                            <Star />
                            <h1 className="font-semibold">
                              {shop.average_rating}
                            </h1>
                          </div>

                          {/* Jumlah testimoni */}
                          <div className="flex gap-1 items-center">
                            <MessageCircle />
                            <h1 className="font-semibold">
                              {shop._count.orders}
                            </h1>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="menu">
          <div className="flex flex-col gap-5 p-5">
            {allProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="bg-gray-100 p-4 rounded-full">
                  <Store className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Menu Tidak Ditemukan
                  </h3>
                  <p className="text-sm text-gray-500 max-w-[200px] mx-auto">
                    Coba ubah kata kunci pencarian atau hapus filter kategori.
                  </p>
                </div>
              </div>
            ) : (
              allProducts.map((product, idx) => (
                <div key={idx} className="relative group">
                  <Link
                    href={`/kedai/${product.shop_id}/${product.id}?back_url=${currentUrl}`}
                    className="block"
                  >
                    <Card>
                      <CardContent className="flex gap-4">
                        <img
                          src={getImageUrl("/product/" + product.image_url)}
                          alt=""
                          className="aspect-square shadow rounded-lg w-1/3 object-cover"
                        />

                        <div className="flex flex-col justify-between w-full">
                          <div>
                            <h1 className="font-semibold">{product.name}</h1>
                            <p className="text-sm text-muted-foreground">
                              {product.shop_name}
                            </p>
                          </div>

                          <p className="font-semibold text-primary mt-2">
                            {formatRupiah(product.price)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full absolute bottom-4 right-4 z-10"
                    onClick={(e) => handleAddClick(e, product)}
                    disabled={loadingProductId === product.id}
                  >
                    {loadingProductId === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {activeCartId && <CartSummary cartId={activeCartId} />}
    </div>
  );
}
