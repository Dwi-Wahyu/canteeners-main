import { Card, CardContent } from "@/components/ui/card";
import { GetShopAndProducts } from "@/features/shop/types/shop-queries-types";
import { getImageUrl } from "@/helper/get-image-url";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/helper/format-rupiah";

export default function CustomerProductCard({
  product,
  product_url,
  onAddClick,
}: {
  product: GetShopAndProducts["products"][number];
  product_url: string;
  onAddClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="relative group">
      <Link href={product_url} className="block">
        <Card className="overflow-hidden hover:bg-accent/5 transition-colors">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="w-24 h-24 shrink-0">
                <div className="relative shadow aspect-square w-full h-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={getImageUrl("/product/" + product.image_url)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-bold line-clamp-1 text-base">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <span className="text-primary font-bold text-base mt-2">
                  {formatRupiah(product.price)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Button
        variant="default"
        size="icon"
        className="h-9 w-9 rounded-full absolute bottom-4 right-4 z-10 shadow-lg"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddClick?.(e);
        }}
      >
        <Plus className="h-5 h-5" />
      </Button>
    </div>
  );
}
