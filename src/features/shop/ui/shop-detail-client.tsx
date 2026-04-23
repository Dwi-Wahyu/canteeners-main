"use client";

import { useState } from "react";
import { getImageUrl } from "@/helper/get-image-url";
import { useCartAnimationStore } from "@/stores/use-cart-animation-store";
import Link from "next/link";
import { formatRupiah } from "@/helper/format-rupiah";
import ShopProductList from "./shop-product-list";
import { GetShopAndProducts } from "../types/shop-queries-types";
import { cn } from "@/lib/utils";

interface FlyingImage {
  id: string;
  src: string;
  startPos: { x: number; y: number };
  targetPos: { x: number; y: number };
}

export default function ShopDetailClient({
  shop,
  cartId,
  pendingShopCart,
}: {
  shop: GetShopAndProducts;
  cartId?: string;
  pendingShopCart: any;
}) {
  const { triggerShake, isShaking } = useCartAnimationStore();
  const [flyingImage, setFlyingImage] = useState<FlyingImage | null>(null);

  const handleAddProductAnimation = (e: React.MouseEvent, product: any) => {
    const target = e.currentTarget as HTMLElement;
    const imgElement = target.closest(".group")?.querySelector("img");
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
  };

  const handleAddToCartSuccess = (shopCartId: string) => {
    // We could refetch the shop cart here if needed, but for now we just rely on query invalidation
    // and router.refresh() which is handled in ShopProductList
  };

  return (
    <>
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
        @keyframes cart-shake {
          0% { transform: scale(1); }
          25% { transform: scale(1.05) rotate(2deg); }
          50% { transform: scale(1.05) rotate(-2deg); }
          75% { transform: scale(1.05) rotate(2deg); }
          100% { transform: scale(1); }
        }
        .animate-cart-shake {
          animation: cart-shake 0.4s ease-in-out;
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

      <ShopProductList 
        shop={shop} 
        cartId={cartId} 
        onAddToCartClick={handleAddProductAnimation}
        onAddToCartSuccess={handleAddToCartSuccess}
      />

      {pendingShopCart && pendingShopCart._count.items > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50">
          <div className="max-w-md mx-auto">
            <Link
              id="cart-summary"
              href={"/keranjang/" + pendingShopCart.id}
              className={cn(
                "w-full flex justify-between items-center bg-primary text-primary-foreground px-6 py-4 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]",
                isShaking && "animate-cart-shake"
              )}
            >
              <div className="flex gap-3 items-center">
                <div className="flex flex-col items-start">
                  <span className="font-bold text-lg leading-none">
                    Lihat Keranjang
                  </span>
                  <span className="text-xs opacity-80">
                    {pendingShopCart._count.items} Item pesanan
                  </span>
                </div>
              </div>

              <h1 className="text-xl font-bold">
                {formatRupiah(pendingShopCart.total_price)}
              </h1>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
