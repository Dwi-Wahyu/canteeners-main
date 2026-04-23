"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ShoppingBag, Clock } from "lucide-react";
import { formatRupiah } from "@/helper/format-rupiah";
import { formatDateToYYYYMMDD } from "@/helper/date-helper";
import { formatToHour } from "@/helper/hour-helper";

interface CartShopCardProps {
  id: string;
  shopName: string;
  totalPrice: number;
  itemCount: number;
  createdAt: Date;
  previewProducts: { id: string; name: string; imageUrl: string }[];
  extraCount: number;
}

export default function CartShopCard({
  id,
  shopName,
  totalPrice,
  itemCount,
  createdAt,
  previewProducts,
  extraCount,
}: CartShopCardProps) {
  return (
    <Link href={"/keranjang/" + id}>
      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]">
        <CardContent className="p-4">
          {/* Baris atas: nama kedai + harga */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <ShoppingBag className="w-4 h-4 text-primary flex-shrink-0" />
              <h2 className="font-semibold text-base leading-tight line-clamp-1">
                {shopName}
              </h2>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <p className="font-bold text-primary text-sm">
                {formatRupiah(totalPrice)}
              </p>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t mb-3" />

          {/* Baris bawah: preview produk + info item & waktu */}
          <div className="flex items-center justify-between gap-3">
            {/* Avatar stack produk */}
            {previewProducts.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {previewProducts.map((product, i) => (
                    <img
                      key={i}
                      src={product.imageUrl}
                      alt={product.name}
                      title={product.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-background"
                      onError={(e) =>
                        (e.currentTarget.src = "/placeholder-image.webp")
                      }
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {itemCount} item
                  {extraCount > 0 && ` (+${extraCount})`}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                {itemCount} item
              </span>
            )}

            {/* Waktu */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <Clock className="w-3 h-3" />
              <span>
                {formatDateToYYYYMMDD(createdAt)} {formatToHour(createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
