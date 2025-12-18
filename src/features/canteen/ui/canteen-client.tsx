"use client";

import CustomBadge from "@/components/custom-badge";
import { Card, CardContent } from "@/components/ui/card";
import { shopStatusMapping } from "@/constant/shop-status-mapping";
import CanteenTopbar from "@/features/canteen/ui/canteen-topbar";
import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";
import { DollarSign, MessageCircle, Star } from "lucide-react";
import Link from "next/link";
import { GetCanteenBySlug } from "../types/canteen-queries-types";
import CategoryScroller from "@/features/category/ui/category-scroller";
import { GetCategories } from "@/features/category/types/category-queries-types";
import PriceRangeFilter from "./price-range-filter";

export default function CanteenClient({
  canteen,
  categories,
}: {
  canteen: GetCanteenBySlug;
  categories: GetCategories;
}) {
  return (
    <div>
      <CanteenTopbar shopCount={canteen.shops.length} />

      <div className="flex flex-col gap-5 pt-28 p-5">
        <PriceRangeFilter />

        <CategoryScroller categories={categories} />

        {canteen.shops.map((shop, idx) => (
          <Link className="group" href={`/kedai/${shop.id}`} key={idx}>
            <Card>
              <CardContent className="flex gap-4">
                <img
                  src={getImageUrl(shop.image_url)}
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
                        <DollarSign className="w-4 h-4" />
                        <h1 className="">
                          {formatRupiah(shop.minimum_price)} -{" "}
                          {formatRupiah(shop.maximum_price)}
                        </h1>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 text-muted-foreground justify-end w-full">
                    <div className="flex gap-1 items-center">
                      <Star />
                      <h1 className="font-semibold">{shop.average_rating}</h1>
                    </div>

                    <div className="flex gap-1 items-center">
                      <MessageCircle />
                      <h1 className="font-semibold">{shop.average_rating}</h1>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
