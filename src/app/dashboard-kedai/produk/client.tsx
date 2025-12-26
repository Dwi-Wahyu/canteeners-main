"use client";

import { Input } from "@/components/ui/input";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Edit, Eye, Plus, SquareArrowOutUpRight, Trash } from "lucide-react";
import { getShopProducts } from "../../../features/product/lib/product-queries";
import NavButton from "@/components/nav-button";
import { useQueryState } from "nuqs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getImageUrl } from "@/helper/get-image-url";
import { formatRupiah } from "@/helper/format-rupiah";

export default function ProductClientPage({
  data,
}: {
  data: Awaited<ReturnType<typeof getShopProducts>>;
}) {
  const [filterName, setFilterName] = useQueryState("name", {
    shallow: false,
    clearOnDefault: true,
    defaultValue: "",
  });

  return (
    <div className="min-h-screen">
      <div className="flex justify-between mb-4 items-center">
        <h1 className="font-semibold text-lg">Daftar Produk</h1>

        {data && data.length > 0 && (
          <NavButton
            size={"sm"}
            href="/dashboard-kedai/produk/create"
            variant="default"
          >
            <Plus />
            Input Produk
          </NavButton>
        )}
      </div>

      <Input
        placeholder="Cari nama"
        value={filterName}
        onChange={(ev) => setFilterName(ev.target.value)}
      />



      {data && (
        <div className="grid mt-4 grid-cols-1 gap-4 md:grid-cols-3">
          {data.map((product) => (
            <Card className='max-w-md pt-0'>
              <CardContent className='px-0'>
                <img
                  src={getImageUrl(product.image_url)}

                  alt='Banner'
                  className='aspect-video h-70 rounded-t-xl object-cover'
                />
              </CardContent>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <h1 className="font-semibold text-xl">{formatRupiah(product.price)}</h1>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardFooter className='gap-3 grid grid-cols-2'>
                <NavButton variant="outline" href={`/dashboard-kedai/produk/${product.id}`}>
                  <SquareArrowOutUpRight /> Detail
                </NavButton>

                <NavButton href={`/dashboard-kedai/produk/${product.id}/edit`}>
                  <Edit /> Edit
                </NavButton>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {data.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Trash />
            </EmptyMedia>
            <EmptyTitle>Belum Ada Produk</EmptyTitle>
            <EmptyDescription>Mulai menambahkan produk</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NavButton
              size={"sm"}
              href="/dashboard-kedai/produk/create"
              variant="outline"
            >
              Input Produk
            </NavButton>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
