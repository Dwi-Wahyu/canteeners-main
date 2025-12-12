import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Edit, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ToggleProductAvailableButton from "./toggle-product-available-button";
import { getShopProducts } from "../lib/product-queries";
import { formatRupiah } from "@/helper/format-rupiah";
import { getImageUrl } from "@/helper/get-image-url";

export default function ProductCard({
  product,
}: {
  product: Awaited<ReturnType<typeof getShopProducts>>[number];
}) {
  return (
    <Card className="max-w-xl">
      <CardHeader className="border-b flex justify-between items-center">
        <div>
          <CardTitle>{product.name}</CardTitle>
        </div>
      </CardHeader>

      <div className="flex p-4 py-0">
        <div className="w-1/3 pr-4">
          <img
            src={getImageUrl(product.image_url)}
            alt={product.name}
            className="aspect-square shadow w-full rounded-md object-cover"
          />
        </div>

        <div className="w-2/3">
          <div className="p-0">
            <div className="flex justify-between items-center">
              <h1>Harga Jual</h1>

              <h1 className="text-muted-foreground">
                {formatRupiah(product.price)}
              </h1>
            </div>
            <div className="flex justify-between items-center">
              <h1>Harga Modal</h1>

              {!product.cost ? (
                <h1 className="text-muted-foreground">N/A</h1>
              ) : (
                <h1 className="text-muted-foreground">
                  {formatRupiah(product.cost)}
                </h1>
              )}
            </div>

            <div className="flex justify-between items-center">
              <h1>Margin</h1>

              {!product.cost ? (
                <h1 className="text-muted-foreground">N/A</h1>
              ) : (
                <h1 className="text-primary font-semibold">
                  {formatRupiah(product.price - product.cost)}
                </h1>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-wrap gap-2">
        {product.options.map((each, idx) => (
          <Badge key={idx} variant={"outline"}>
            {each.option}
          </Badge>
        ))}
      </div>

      <CardFooter className="gap-3 flex justify-end items-center border-t pt-3">
        <ToggleProductAvailableButton
          default_is_available={product.is_available}
          product_id={product.id}
        />

        <Button asChild variant={"outline"} size={"icon"}>
          <Link href={`/dashboard-kedai/produk/${product.id}`}>
            <Eye className="w-4 h-4" />
          </Link>
        </Button>

        <Button asChild variant={"outline"} size={"icon"}>
          <Link href={`/dashboard-kedai/produk/${product.id}/edit`}>
            <Edit className="w-4 h-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
