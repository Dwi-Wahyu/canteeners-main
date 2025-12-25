"use client";

import { formatRupiah } from "@/helper/format-rupiah";
import { getBestSellingProducts } from "../lib/product-queries";
import { Card, CardContent } from "@/components/ui/card";
import { getImageUrl } from "@/helper/get-image-url";

export function ShopBestSellingProduct({
  products,
}: {
  products: Awaited<ReturnType<typeof getBestSellingProducts>>;
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Produk Terlaris 🔥</h2>
        <span className="text-xs font-medium text-orange-600">Bulan Ini</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent>
              <div className="flex items-center gap-4">
                {/* Ranking Badge - posisi absolute di kiri atas */}
                <div className="absolute -left-2 -top-2 z-10">
                  <div className="w-10 h-10 bg-orange-500 text-white font-black text-lg rounded-full flex items-center justify-center shadow-lg italic">
                    #{index + 1}
                  </div>
                </div>

                {/* Thumbnail */}
                <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(product?.image_url ?? "")}
                    alt={product?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-image.jpg"; // fallback image
                    }}
                  />
                </div>

                {/* Info Produk */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {product?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatRupiah(product?.price ?? 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Terjual {product?.total_sold} pcs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
