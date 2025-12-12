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

import ProductCard from "./product-card";
import { Trash } from "lucide-react";
import { getShopProducts } from "../lib/product-queries";
import NavButton from "@/components/nav-button";
import { useQueryState } from "nuqs";

export default function ProductClientPage({ data }: { data: Awaited<ReturnType<typeof getShopProducts>> }) {
  const [filterName, setFilterName] = useQueryState("name", {
    shallow: false,
    clearOnDefault: true,
    defaultValue: "",
  });

  return (
    <div>
      <div className="flex justify-between mb-4 items-center">
        <h1 className="font-semibold text-lg">Daftar Produk</h1>

        {data && data.length > 0 && (
          <NavButton
            size={"sm"}
            href="/dashboard-kedai/produk/input"
            variant="default"
          >
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
            <ProductCard product={product} key={product.id} />
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
