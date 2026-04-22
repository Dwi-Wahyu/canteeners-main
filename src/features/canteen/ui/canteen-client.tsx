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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CanteenClient({
  canteen,
  categories,
}: {
  canteen: GetCanteenBySlug;
  categories: any[];
}) {
  const allProducts = canteen.shops.flatMap((shop) =>
    shop.products.map((product) => ({
      ...product,
      shop_id: shop.id,
      shop_name: shop.name,
    }))
  );

  return (
    <div>
      <Suspense fallback={<div className="p-4 h-16" />}>
        <CanteenTopbar shopCount={canteen.shops.length} />
      </Suspense>

      <CanteenCategoryFilter categories={categories} />

      <Tabs defaultValue="kedai" className="w-full">
        <div className="px-5">
          <TabsList className="w-full">
            <TabsTrigger value="kedai" className="w-full">
              Kedai
            </TabsTrigger>
            <TabsTrigger value="menu" className="w-full">
              Menu
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
                <Link className="group" href={`/kedai/${shop.id}`} key={idx}>
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
                <Link
                  className="group"
                  href={`/kedai/${product.shop_id}/${product.id}`}
                  key={idx}
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

                        <div className="flex justify-between items-center mt-2">
                          <p className="font-semibold text-primary">
                            {formatRupiah(product.price)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
