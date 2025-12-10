"use client";

import NavButton from "@/components/nav-button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCanteenBySlug } from "@/features/canteen/lib/canteen-queries";
import CreateShopConversation from "@/features/chat/ui/create-shop-conversation";
import { getImageUrl } from "@/helper/get-image-url";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CanteenClient({ slug }: { slug: string }) {
  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["canteen", slug],
    queryFn: async () => {
      return getCanteenBySlug(slug);
    },
  });

  return (
    <div className="flex flex-col pt-24 gap-4 p-5">
      {isFetching && (
        <>
          <CanteenTopbar shopCount={0} />

          <div className="p-5 flex-col flex gap-5">
            <Skeleton className="w-full h-10" />

            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
            </div>

            <div className="flex gap-4">
              <Skeleton className="w-1/3 h-30 rounded-full" />
              <Skeleton className="w-1/3 h-30 rounded-full" />
              <Skeleton className="w-1/3 h-30 rounded-full" />
            </div>

            <Skeleton className="w-full h-44" />
            <Skeleton className="w-full h-44" />
            <Skeleton className="w-full h-44" />
          </div>
        </>
      )}

      {isError && <div>Error: {(error as Error).message}</div>}

      {!isFetching && !isError && data && data.shops.length > 0 && (
        <>
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
        </>
      )}
    </div>
  );
}

function CanteenTopbar({ shopCount }: { shopCount: number }) {
  return (
    <div className="p-5 shadow border-b">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Link href={"/"}>
            <ChevronLeft className="text-muted-foreground" />
          </Link>
          <div>
            <h1 className="font-semibold leading-tight text-xl">Pilih Kedai</h1>
            <h1 className="text-sm text-muted-foreground">
              {shopCount} kedai tersedia
            </h1>
          </div>
        </div>

        <NavButton href={"/chat"}>
          <MessageCircle />
          Chat
        </NavButton>
      </div>
    </div>
  );
}
