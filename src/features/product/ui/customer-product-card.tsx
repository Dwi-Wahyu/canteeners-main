import { Card, CardContent } from "@/components/ui/card";
import { GetShopAndProducts } from "@/features/shop/types/shop-queries-types";
import { getImageUrl } from "@/helper/get-image-url";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/helper/format-rupiah";
import { truncateString } from "@/helper/truncate-helper";
import { cn } from "@/lib/utils";

export default function CustomerProductCard({
  product,
  product_url,
  onAddClick,
  isLoading,
}: {
  product: GetShopAndProducts["products"][number];
  product_url: string;
  onAddClick?: (e: React.MouseEvent) => void;
  isLoading?: boolean;
}) {
  const isAvailable = product.is_available;

  return (
    <div className="relative group">
      <Link href={product_url} className="block">
        <Card
          className={cn(
            "overflow-hidden hover:bg-accent/5 transition-colors",
            !isAvailable && "bg-muted/30",
          )}
        >
          <CardContent>
            <div className="flex gap-4">
              <div className="w-24 h-24 shrink-0">
                <div className="relative shadow aspect-square w-full h-full overflow-hidden rounded-lg bg-muted">
                  <img
                    src={getImageUrl("/product/" + product.image_url)}
                    alt={product.name}
                    className={cn(
                      "h-full w-full object-cover",
                      !isAvailable && "grayscale opacity-60",
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  {!isAvailable && (
                    <span className="text-[10px] font-bold text-destructive uppercase">
                      Tidak Tersedia
                    </span>
                  )}
                  <h3
                    className={cn(
                      "font-bold line-clamp-1 text-base",
                      !isAvailable && "text-muted-foreground",
                    )}
                  >
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                      {truncateString({
                        string: product.description,
                        maxChars: 70,
                      })}
                    </p>
                  )}
                </div>

                <span
                  className={cn(
                    "text-primary font-bold text-base mt-2",
                    !isAvailable && "text-muted-foreground",
                  )}
                >
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
        disabled={isLoading || !isAvailable}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Plus className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}
