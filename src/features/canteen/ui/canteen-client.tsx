"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getCanteenBySlug } from "@/features/canteen/lib/canteen-queries";
import CanteenTopbar from "@/features/canteen/ui/canteen-topbar";
import CreateShopConversation from "@/features/chat/ui/create-shop-conversation";
import { getImageUrl } from "@/helper/get-image-url";
import Image from "next/image";

export default function CanteenClient({ data }: { data: NonNullable<Awaited<ReturnType<typeof getCanteenBySlug>>> }) {
  return (
    <div className="flex flex-col pt-24 gap-4 p-5">
      <CanteenTopbar shopCount={data.shops.length} />

      {data.shops.map((shop) => (
        <Card key={shop.id}>
          <CardContent>
            <Image
              src={getImageUrl(shop.image_url)}
              alt={shop.name}
              width={400}
              height={400}
              loading="eager"
              className="rounded-lg shadow mb-2"
            />

            <h1>{shop.name}</h1>

            <CreateShopConversation
              ownerUserId={shop.owner.user_id}
              shopName={shop.name}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

