"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import CustomerProductCard from "@/features/product/ui/customer-product-card";
import NoProductFound from "./no-product-found";
import { GetShopAndProducts } from "../types/shop-queries-types";
import { useQueryState } from "nuqs";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import AddToCartDialog from "@/features/product/ui/add-to-cart-dialog";
import { useQueryClient } from "@tanstack/react-query";

export default function ShopProductList({
  shop,
  cartId,
}: {
  shop: GetShopAndProducts;
  cartId?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const currentUrl = encodeURIComponent(`${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);

  const [productName, setProductName] = useQueryState("productName", {
    shallow: false,
    clearOnDefault: true,
    defaultValue: "",
  });

  function handleAddClick(product: any) {
    setSelectedProduct({ ...product, shop_id: shop.id });
    setIsDialogOpen(true);
  }

  function handleAddToCartSuccess() {
    queryClient.invalidateQueries({ queryKey: ["cart", cartId] });
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
              onAddClick={() => handleAddClick(product)}
            />
          ))}
        </div>
      )}

      {shop.products.length === 0 && <NoProductFound />}

      {selectedProduct && (
        <AddToCartDialog
          product={selectedProduct}
          cartId={cartId}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={handleAddToCartSuccess}
        />
      )}
    </div>
  );
}
