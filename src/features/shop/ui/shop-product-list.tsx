"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import CustomerProductCard from "@/features/product/ui/customer-product-card";
import NoProductFound from "./no-product-found";
import { GetShopAndProducts } from "../types/shop-queries-types";
import { useQueryState } from "nuqs";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useRouter } from "nextjs-toploader/app";

import { addToCart } from "@/features/cart/lib/cart-actions";
import { createGuestSession } from "@/helper/create-guest-session";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ShopProductList({
  shop,
  cartId,
  onAddToCartClick,
  onAddToCartSuccess,
}: {
  shop: GetShopAndProducts;
  cartId?: string;
  onAddToCartClick?: (e: React.MouseEvent, product: any) => void;
  onAddToCartSuccess?: (shopCartId: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [activeCartId, setActiveCartId] = useState<string | null>(cartId || null);

  const currentUrl = encodeURIComponent(`${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);

  const [productName, setProductName] = useQueryState("productName", {
    shallow: false,
    clearOnDefault: true,
    defaultValue: "",
  });

  async function handleAddClick(e: React.MouseEvent, product: any) {
    if (loadingProductId) return;

    // Trigger animation immediately before async operations
    if (onAddToCartClick) {
      onAddToCartClick(e, product);
    }

    setLoadingProductId(product.id);

    try {
      let currentCartId = activeCartId;

      if (!currentCartId) {
        const { cartId: createdCartId } = await createGuestSession({
          name: "",
        });

        if (!createdCartId) {
          toast.error("Gagal membuat sesi tamu, silakan coba lagi");
          return;
        }
        currentCartId = createdCartId;
        setActiveCartId(currentCartId);
      }

      // Collect required options: use first value for each required option
      const selected_option_value_ids: string[] = [];
      if (product.options) {
        product.options.forEach((option: any) => {
          if (option.is_required && option.values && option.values.length > 0) {
            selected_option_value_ids.push(option.values[0].id);
          }
        });
      }

      const result = await addToCart({
        cartId: currentCartId!,
        shopId: shop.id,
        productId: product.id,
        quantity: 1,
        selected_option_value_ids,
      });

      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["cart", currentCartId] });
        
        if (onAddToCartSuccess) {
          onAddToCartSuccess(result.data!.shopCartId);
        }

        router.refresh();
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
    <div className="w-full pb-10">
      <div className="relative mb-6">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          <Search className="size-4" />
          <span className="sr-only">Product Name</span>
        </div>
        <Input
          placeholder="Cari nama produk..."
          value={productName}
          onChange={(ev) => setProductName(ev.target.value)}
          className="peer pl-9 rounded-lg"
        />
      </div>

      {shop.products.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shop.products.map((product) => (
            <CustomerProductCard
              product={product}
              key={product.id}
              product_url={`/kedai/${shop.id}/${product.id}?back_url=${currentUrl}`}
              onAddClick={(e) => handleAddClick(e, product)}
              isLoading={loadingProductId === product.id}
            />
          ))}
        </div>
      )}

      {shop.products.length === 0 && <NoProductFound />}
    </div>
  );
}
