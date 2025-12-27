"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { Card, CardContent } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getShopRatings,
  getShopTestimonies,
} from "@/features/shop/lib/shop-queries";
import { MessageCircle, Star, ThumbsUp } from "lucide-react";

export default function ShopDashboardTestimonyClient({
  shopRatings,
  testimonies,
}: {
  shopRatings: NonNullable<Awaited<ReturnType<typeof getShopRatings>>>;
  testimonies: NonNullable<Awaited<ReturnType<typeof getShopTestimonies>>>;
}) {
  return (
    <div className="p-5 pt-20">
      <div className="mb-4 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-1">
            <h1 className="font-semibold text-lg">Rating Toko</h1>
            <div className="flex gap-1 items-center">
              <Star className="w-5 h-5" />
              <h1 className="font-semibold text-lg">
                {shopRatings.average_rating.toFixed(1)}{" "}
              </h1>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-1">
            <h1 className="font-semibold text-lg">Jumlah Ulasan</h1>
            <div className="flex gap-1 items-center">
              <ThumbsUp className="w-5 h-5" />
              <h1 className="font-semibold text-lg">
                {shopRatings.total_ratings}{" "}
              </h1>
            </div>
          </CardContent>
        </Card>
      </div>

      {testimonies.length === 0 && <EmptyTestimony />}

      <div className="flex flex-col gap-4">
        {testimonies.map((testimony, idx) => (
          <Card key={idx}>
            <CardContent className="flex gap-3 items-start">
              <Avatar>
                <AvatarImage
                  src={
                    "/uploads/avatar/" + testimony.order.customer.user.avatar
                  }
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>

              <div className="w-full">
                <div className="flex gap-1 items-center justify-between">
                  <h1 className="font-semibold">
                    {testimony.order.customer.user.name}
                  </h1>

                  <div className="flex gap-1 items-center">
                    <Star className="w-4 h-4" />
                    <h1 className="font-semibold">{testimony.rating}</h1>
                  </div>
                </div>
                <h1>{testimony.message}</h1>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmptyTestimony() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessageCircle />
        </EmptyMedia>
        <EmptyTitle>Belum Ada Ulasan</EmptyTitle>
        <EmptyDescription>
          Berikan pelayanan terbaik agar pelanggan memberikan ulasan positif
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
