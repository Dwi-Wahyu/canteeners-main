"use client";

import { useQuery } from "@tanstack/react-query";
import { getCart } from "../lib/cart-queries";
import Link from "next/link";
import { formatRupiah } from "@/helper/format-rupiah";
import { useCartAnimationStore } from "@/stores/use-cart-animation-store";
import { cn } from "@/lib/utils";

/* ─── Cart bag SVG icon ────────────────────────────────────────── */
function CartBagIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 15 15"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.383 5L6.93.757L6.07.243L3.217 5H.703A.703.703 0 0 0 0 5.703v.439c0 2.944.685 5.847 2.002 8.48a.69.69 0 0 0 .612.378h9.772c.26 0 .496-.146.612-.379A18.96 18.96 0 0 0 15 6.141v-.438A.703.703 0 0 0 14.297 5h-2.514L8.93.243l-.86.514L10.617 5zM7 12v-2H5V9h2V7h1v2h2v1H8v2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CartSummary({ cartId }: { cartId: string }) {
  const { isShaking } = useCartAnimationStore();

  const { data: cart } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: () => getCart(cartId),
    enabled: !!cartId,
  });

  const shopCarts = (cart?.shop_carts || []).filter(
    (sc) => sc._count.items > 0,
  );

  const totalItems = shopCarts.reduce(
    (acc, shopCart) => acc + shopCart._count.items,
    0,
  );

  const totalPrice = shopCarts.reduce((acc, shopCart) => {
    return acc + shopCart.items.reduce((sum, item) => sum + item.subtotal, 0);
  }, 0);

  /* Shop name(s) for subtitle */
  const shopNames = shopCarts.map((sc) => sc.shop?.name).filter(Boolean);
  const shopLabel =
    shopNames.length === 1
      ? shopNames[0]
      : shopNames.length > 1
        ? `${shopNames[0]} +${shopNames.length - 1} lainnya`
        : "Keranjang";

  if (totalItems === 0) {
    return (
      <div className="fixed bottom-[88px] left-0 right-0 px-4 z-40 invisible pointer-events-none">
        <div id="cart-summary" className="h-14 rounded-full" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes cs-shake {
          0%,100% { transform: scale(1); }
          20%      { transform: scale(1.04) rotate(1.5deg); }
          40%      { transform: scale(1.04) rotate(-1.5deg); }
          60%      { transform: scale(1.04) rotate(1deg); }
          80%      { transform: scale(1.04) rotate(-1deg); }
        }
        .cs-shake { animation: cs-shake 0.45s ease-in-out; }

        @keyframes cs-appear {
          from { opacity:0; transform:translateY(14px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .cs-appear { animation: cs-appear 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

      <div className="fixed bottom-[88px] left-0 right-0 px-4 z-40 cs-appear">
        <Link
          id="cart-summary"
          href="/keranjang"
          className={cn(
            "flex items-center justify-between rounded-full px-5 py-2.5 active:scale-[0.97] transition-transform select-none",
            isShaking && "cs-shake",
          )}
          style={{
            background: "linear-gradient(90deg, #bb0004 0%, #e1251b 100%)",
            boxShadow: "0 8px 20px rgba(187,0,4,0.35)",
          }}
        >
          {/* ── Left: item count + shop name ── */}
          <div className="flex flex-col leading-tight">
            <span className="text-white font-bold text-[14px] leading-snug">
              {totalItems} item
            </span>
            <span className="text-white/80 text-[11px] font-medium leading-none mt-0.5 truncate max-w-[140px]">
              {shopLabel}
            </span>
          </div>

          {/* ── Right: price + bag icon ── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-white font-extrabold text-[14px] tracking-tight">
              {formatRupiah(totalPrice).replace("Rp\u00a0", "Rp ")}
            </span>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <CartBagIcon className="w-[18px] h-[18px] text-white" />
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
