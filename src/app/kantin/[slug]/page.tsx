import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CreateShopConversation from "@/features/chat/ui/create-shop-conversation";
import { getImageUrl } from "@/helper/get-image-url";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function CanteenDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const canteen = await prisma.canteen.findFirst({
    where: {
      slug,
    },
    include: {
      shops: {
        select: {
          id: true,
          image_url: true,
          name: true,
          minimum_price: true,
          maximum_price: true,
          average_rating: true,
          total_ratings: true,
          owner: {
            select: {
              user_id: true,
            },
          },
        },
      },
    },
  });

  if (!canteen) {
    return (
      <div>
        <h1>Kantin tidak ditemukan</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <h1>{canteen.name}</h1>

      {canteen.shops.map((shop) => (
        <Card key={shop.id}>
          <CardContent>
            <Image
              src={getImageUrl(shop.image_url)}
              alt={shop.name}
              width={400}
              height={400}
              className="rounded-lg shadow mb-2"
            />

            <h1>{shop.name}</h1>

            <CreateShopConversation ownerUserId={shop.owner.user_id} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
