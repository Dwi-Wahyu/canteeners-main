import NavButton from "@/components/nav-button";
import { Card, CardContent } from "@/components/ui/card";
import { GetShopAndProducts } from "@/features/shop/types/shop-queries-types";
import { getImageUrl } from "@/helper/get-image-url";
import { Plus } from "lucide-react";

export default function CustomerProductCard({
  product,
  product_url,
}: {
  product: GetShopAndProducts["products"][number];
  product_url: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent>
        <div className="flex gap-4">
          <div className="w-1/3 shrink-0">
            <div className="relative shadow aspect-square w-full overflow-hidden rounded-md bg-muted">
              <img
                src={getImageUrl(product.image_url)}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h3 className="font-semibold line-clamp-1 text-base">
                {product.name}
              </h3>
              <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg">Rp{product.price}</span>

              <NavButton variant="default" size="icon" href={product_url}>
                <Plus />
              </NavButton>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
