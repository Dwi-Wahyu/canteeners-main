import { Card, CardContent } from "@/components/ui/card";
import { getImageUrl } from "@/helper/get-image-url";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CanteenPage() {
  const canteens = await prisma.canteen.findMany();

  return (
    <div className="p-5 flex flex-col gap-4">
      <h1>Daftar Kantin</h1>

      {canteens.map((canteen) => (
        <Link href={"/kantin/" + canteen.slug} key={canteen.id}>
          <Card>
            <CardContent>
              <Image
                src={getImageUrl(canteen.image_url)}
                alt={canteen.name}
                width={400}
                height={400}
                className="rounded-lg shadow mb-2"
              />

              <h1>{canteen.name}</h1>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
