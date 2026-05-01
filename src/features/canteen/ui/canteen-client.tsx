"use client";

import { Suspense, useState } from "react";
import { shopStatusMapping } from "@/constant/shop-status-mapping";
import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";
import {
  MessageCircle,
  Star,
  Store,
  Plus,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { GetCanteenBySlug } from "../types/canteen-queries-types";
import { Badge } from "@/components/ui/badge";
import { usePathname, useSearchParams } from "next/navigation";
import { CartSummary } from "@/features/cart/ui/cart-summary";
import { Session } from "next-auth";
import { useQueryClient } from "@tanstack/react-query";
import { addToCart } from "@/features/cart/lib/cart-actions";
import { createGuestSession } from "@/helper/create-guest-session";
import { toast } from "sonner";
import { useCartAnimationStore } from "@/stores/use-cart-animation-store";
import { ProductFilterDialogInline } from "./product-filter-dialog";
import { useQueryState } from "nuqs";
import CustomBadge from "@/components/custom-badge";
import CashIcon from "@/components/icons/cash-icon";

/* ─── Types ───────────────────────────────────────────────────── */
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

/* ─── Tab type ─────────────────────────────────────────────────── */
type ActiveTab = "menu" | "kedai";

/* ─── Inline styles ────────────────────────────────────────────── */
const STYLES = `
  // @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  // .cc-root * {
  //   font-family: 'Plus Jakarta Sans', sans-serif;
  // }

  /* Fly-to-cart animation */
  @keyframes fly-to-cart {
    0%   { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; }
    100% { transform: translate(var(--target-x), var(--target-y)) scale(0.1) rotate(720deg); opacity: 0.5; }
  }
  .animate-fly-to-cart {
    animation: fly-to-cart 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    pointer-events: none;
    z-index: 9999;
  }

  /* Product card hover */
  .cc-product-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .cc-product-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.12);
  }

  /* Add button press */
  .cc-add-btn:active { transform: scale(0.92); }

  /* Floating cart button */
  .cc-cart-float {
    animation: cc-cart-appear 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  @keyframes cc-cart-appear {
    from { opacity:0; transform:translateY(12px) scale(0.95); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  /* Tab active indicator */
  .cc-tab-active {
    position: relative;
  }
  .cc-tab-active::after {
    content:'';
    position:absolute;
    bottom:-2px; left:50%; transform:translateX(-50%);
    width:24px; height:3px;
    background: #bb0004;
    border-radius: 9999px;
  }

  /* Scrollbar hide */
  .cc-no-scrollbar::-webkit-scrollbar { display:none; }
  .cc-no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }

  /* Image zoom on hover */
  .cc-img-zoom { transition: transform 0.5s ease; }
  .cc-product-card:hover .cc-img-zoom { transform: scale(1.06); }
`;

/* ─── Main Component ───────────────────────────────────────────── */
export default function CanteenClient({
  canteen,
  categoryFilter,
  session,
}: {
  canteen: GetCanteenBySlug;
  categoryFilter: React.ReactNode;
  session: Session | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { triggerShake } = useCartAnimationStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("menu");
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [activeCartId, setActiveCartId] = useState<string | null>(
    session?.user.cartId || null,
  );
  const [flyingImage, setFlyingImage] = useState<FlyingImage | null>(null);

  const [name, setName] = useQueryState("name", {
    shallow: false,
    throttleMs: 500,
  });

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

    const imgElement = e.currentTarget
      .closest(".cc-product-card")
      ?.querySelector("img");
    const cartElement = document.getElementById("cart-summary");

    if (imgElement && cartElement) {
      const imgRect = imgElement.getBoundingClientRect();
      const cartRect = cartElement.getBoundingClientRect();
      setFlyingImage({
        id: Math.random().toString(),
        src: getImageUrl("/product/" + product.image_url),
        startPos: {
          x: imgRect.left + imgRect.width / 2,
          y: imgRect.top + imgRect.height / 2,
        },
        targetPos: {
          x: cartRect.left + cartRect.width / 2,
          y: cartRect.top + cartRect.height / 2,
        },
      });
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
    } catch {
      toast.error("Terjadi kesalahan saat menambahkan ke keranjang");
    } finally {
      setLoadingProductId(null);
    }
  }

  return (
    <div className="cc-root min-h-screen bg-[#f6faff] pb-40">
      <style>{STYLES}</style>

      {/* ── Flying image animation ─────────────────── */}
      {flyingImage && (
        <img
          key={flyingImage.id}
          src={flyingImage.src}
          alt=""
          className="fixed w-16 h-16 object-cover rounded-xl animate-fly-to-cart"
          style={{
            top: flyingImage.startPos.y - 32,
            left: flyingImage.startPos.x - 32,
            // @ts-expect-error CSS vars
            "--target-x": `${flyingImage.targetPos.x - flyingImage.startPos.x}px`,
            "--target-y": `${flyingImage.targetPos.y - flyingImage.startPos.y}px`,
          }}
        />
      )}

      {/* ── Sticky Search Bar ─────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#f6faff]/92 backdrop-blur-md px-4 pt-4 pb-3">
        <div className="flex items-center bg-[#e6eff8] rounded-2xl px-4 py-3 gap-3 transition-all focus-within:ring-2 focus-within:ring-[#bb0004]/20 focus-within:bg-white">
          {/* Search icon */}
          <Search className="size-4 text-[#926f69] flex-shrink-0" />

          {/* Input */}
          <input
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#141d23] placeholder:text-[#926f69] font-medium"
            placeholder="Lagi mau makan apa?"
            value={name ?? ""}
            onChange={(e) => setName(e.target.value || null)}
          />

          {/* Clear button — only when typing */}
          {name && (
            <button
              onClick={() => setName(null)}
              className="text-[#926f69] hover:text-[#bb0004] transition-colors text-lg leading-none flex-shrink-0"
            >
              ×
            </button>
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-[#c8d4e0] flex-shrink-0" />

          {/* Fork & Knife filter icon */}
          <Suspense
            fallback={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 32 32"
                className="opacity-30"
              >
                <path
                  fill="#E4272A"
                  d="M11 5C9.363 5 8.137 6.21 7.312 7.563C6.489 8.913 6 10.515 6 12c0 2.582 1.781 4.465 4 4.906V28h2V16.906c2.219-.441 4-2.324 4-4.906c0-1.484-.488-3.086-1.313-4.438C13.864 6.212 12.637 5 11 5m7 0v7c0 1.852 1.281 3.398 3 3.844V28h2V15.844c1.719-.446 3-1.992 3-3.844V5h-2v7c0 1.117-.883 2-2 2s-2-.883-2-2V5zm3 0v7c0 .55.45 1 1 1s1-.45 1-1V5zM11 7c.574 0 1.344.566 1.969 1.594C13.594 9.62 14 10.996 14 12c0 2.004-1.25 3-3 3s-3-.996-3-3c0-1.004.406-2.379 1.031-3.406S10.426 7 11 7"
                />
              </svg>
            }
          >
            <ProductFilterDialogInline />
          </Suspense>
        </div>
      </div>

      {/* ── Category Filter ───────────────────────── */}
      {categoryFilter}

      {/* ── Segmented Tab (Menu / Kedai) ──────────── */}
      <div className="px-4 mb-5">
        <div className="relative flex bg-[#e6eff8] rounded-2xl p-1">
          {/* sliding pill */}
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-transform duration-250 ease-out"
            style={{
              transform:
                activeTab === "kedai"
                  ? "translateX(calc(100% + 8px))"
                  : "translateX(0)",
            }}
          />
          <button
            onClick={() => setActiveTab("menu")}
            className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 ${
              activeTab === "menu" ? "text-[#bb0004]" : "text-[#5d3f3b]"
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab("kedai")}
            className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 ${
              activeTab === "kedai" ? "text-[#bb0004]" : "text-[#5d3f3b]"
            }`}
          >
            Kedai
          </button>
        </div>
      </div>

      {/* ── Tab Content: Menu ─────────────────────── */}
      {activeTab === "menu" && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-[#141d23] leading-snug">
              Rekomendasi Untukmu
            </h2>
            <span className="text-xs text-[#926f69] font-medium">
              {allProducts.length} menu
            </span>
          </div>

          {allProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 bg-[#e6eff8] rounded-2xl flex items-center justify-center">
                <Store className="size-7 text-[#926f69]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#141d23] text-sm">
                  Menu Tidak Ditemukan
                </h3>
                <p className="text-xs text-[#926f69] mt-1 max-w-[200px] mx-auto">
                  Coba ubah kata kunci pencarian atau hapus filter kategori.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {allProducts.map((product, idx) => (
                <div key={idx} className="relative cc-product-card">
                  <Link
                    href={`/kedai/${product.shop_id}/${product.id}?back_url=${currentUrl}`}
                    className="block"
                  >
                    <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col">
                      {/* Product Image */}
                      <div className="h-32 bg-[#dbe4ed] relative overflow-hidden">
                        <img
                          src={getImageUrl("/product/" + product.image_url)}
                          alt={product.name}
                          className="w-full h-full object-cover cc-img-zoom"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="p-3 flex flex-col flex-1">
                        <h3 className="text-[13px] font-semibold text-[#141d23] line-clamp-2 leading-snug mb-1">
                          {product.name}
                        </h3>
                        <p className="text-[11px] text-[#926f69] mb-3 flex-1 line-clamp-1">
                          {product.shop_name}
                        </p>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[12px] font-bold text-[#141d23]">
                            {formatRupiah(product.price)}
                          </span>
                          <button
                            id={`add-btn-${product.id}`}
                            className="cc-add-btn w-8 h-8 rounded-full bg-[#bb0004] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(187,0,4,0.3)] transition-all active:scale-90"
                            onClick={(e) => handleAddClick(e, product)}
                            disabled={loadingProductId === product.id}
                          >
                            {loadingProductId === product.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Plus className="size-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab Content: Kedai ────────────────────── */}
      {activeTab === "kedai" && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-[#141d23]">
              Kedai Tersedia
            </h2>
            <span className="text-xs text-[#926f69] font-medium">
              {canteen.shops.length} kedai
            </span>
          </div>

          {canteen.shops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 bg-[#e6eff8] rounded-2xl flex items-center justify-center">
                <Store className="size-7 text-[#926f69]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#141d23] text-sm">
                  Kedai Tidak Ditemukan
                </h3>
                <p className="text-xs text-[#926f69] mt-1 max-w-[200px] mx-auto">
                  Coba ubah kata kunci atau hapus filter.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {canteen.shops.map((shop, idx) => (
                <Link
                  key={idx}
                  href={`/kedai/${shop.id}?back_url=${currentUrl}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.07)] overflow-hidden flex gap-0 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
                    {/* Shop Image */}
                    <div className="w-[110px] h-[110px] flex-shrink-0 overflow-hidden bg-[#e6eff8]">
                      <img
                        src={getImageUrl("/shop/" + shop.image_url)}
                        alt={shop.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Shop Info */}
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-[13px] text-[#141d23] leading-tight line-clamp-1">
                            {shop.name}
                          </h3>
                          <CustomBadge
                            value={shop.status}
                            successValues={["ACTIVE"]}
                            outlineValues={["INACTIVE"]}
                            destructiveValues={["SUSPENDED"]}
                          >
                            <span className="text-[9px]">
                              {shopStatusMapping[shop.status]}
                            </span>
                          </CustomBadge>
                        </div>

                        {shop.minimum_price && shop.maximum_price && (
                          <div className="flex items-center gap-1 mt-1">
                            <CashIcon className="w-3.5 h-3.5 text-[#926f69]" />
                            <span className="text-[11px] text-[#5d3f3b]">
                              {formatRupiah(shop.minimum_price)} –{" "}
                              {formatRupiah(shop.maximum_price)}
                            </span>
                          </div>
                        )}

                        {shop.specializations &&
                          shop.specializations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {shop.specializations
                                .slice(0, 3)
                                .map((spec, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="bg-red-50 text-[9px] text-[#bb0004] border-red-100 font-medium py-0 px-1.5 rounded-full"
                                  >
                                    {spec.category.name}
                                  </Badge>
                                ))}
                            </div>
                          )}
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="size-3 text-[#bb0004] fill-[#bb0004]" />
                          <span className="text-[11px] font-semibold text-[#141d23]">
                            {shop.average_rating ?? "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="size-3 text-[#926f69]" />
                          <span className="text-[11px] text-[#926f69]">
                            {shop._count.orders}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Cart Summary (floating) ───────────────── */}
      {activeCartId && <CartSummary cartId={activeCartId} />}
    </div>
  );
}
