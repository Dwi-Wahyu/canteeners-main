"use client";

import { CardDescription, CardTitle } from "@/components/ui/card";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import NavButton from "@/components/nav-button";
import CreateProductOptionDialog from "@/features/product/ui/create-product-option-dialog";
import { formatDateToYYYYMMDD } from "@/helper/date-helper";
import ToggleProductAvailableButton from "@/features/product/ui/toggle-product-available-button";
import { getImageUrl } from "@/helper/get-image-url";
import { GetProductById } from "@/features/product/types/product-queries-types";
import DeleteProductDialog from "@/features/product/ui/delete-product-dialog";
import ProductOptionClient from "@/features/product/ui/product-option-client";

export default function ShopProductDetail({
  data,
}: {
  data: NonNullable<GetProductById>;
}) {
  return (
    <div>
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div>
            <CardTitle className="text-lg mb-1">{data.name}</CardTitle>
            <CardDescription>{data.description}</CardDescription>
          </div>

          <img
            className="rounded-lg shadow"
            src={getImageUrl(data.image_url)}
          />

          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <h1>Harga</h1>

              <h1 className="text-muted-foreground">Rp{data.price}</h1>
            </div>

            <div className="flex justify-between items-center">
              <h1>Modal</h1>

              <h1 className="text-muted-foreground">Rp{data.cost}</h1>
            </div>

            <div className="flex justify-between items-center">
              <h1>Margin</h1>

              <h1 className="text-muted-foreground">
                Rp{data.price - (data.cost ?? 0)}
              </h1>
            </div>

            <div className="flex justify-between items-center">
              <h1>Dibuat pada</h1>

              <h1 className="text-muted-foreground">
                {formatDateToYYYYMMDD(data.created_at)}
              </h1>
            </div>

            <div className="flex justify-between items-center">
              <h1>Diubah pada</h1>

              <h1 className="text-muted-foreground">
                {formatDateToYYYYMMDD(data.updated_at)}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2 items-center justify-center">
            <NavButton href={`/dashboard-kedai/produk/${data.id}/edit`}>
              Edit Produk
            </NavButton>

            <DeleteProductDialog product_id={data.id} />

            <ToggleProductAvailableButton
              default_is_available={data.is_available}
              product_id={data.id}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-5">
        {data.options.length === 0 && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <List />
              </EmptyMedia>
              <EmptyTitle>Belum Ada Varian</EmptyTitle>
              <EmptyDescription>
                Produk ini belum punya varian. Klik dibawah jika ingin tambah
                pilihan
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <CreateProductOptionDialog product_id={data.id} />
            </EmptyContent>
          </Empty>
        )}

        <ProductOptionClient options={data.options} product_id={data.id} />

        {data.options.length !== 0 && (
          <div className="flex justify-center mt-4 mb-3">
            <CreateProductOptionDialog product_id={data.id} />
          </div>
        )}
      </div>
    </div>
  );
}
