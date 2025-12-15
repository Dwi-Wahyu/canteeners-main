"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import CustomerProductCard from "@/features/product/ui/customer-product-card";
import NoProductFound from "./no-product-found";
import { getShopAndProducts } from "../lib/shop-queries";
import { GetShopAndProducts } from "../types/shop-queries-types";
import CategoryScroller from "@/features/category/ui/category-scroller";
import { GetCategories } from "@/features/category/types/category-queries-types";

export default function ShopProductList({
  shop,
}: {
  shop: GetShopAndProducts;
}) {
  const [productName, setProductName] = useState("");

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
              product_url={`/kedai/${shop.id}/${product.id}`}
            />
          ))}
        </div>
      )}

      {shop.products.length === 0 && <NoProductFound />}
    </div>
  );
}
