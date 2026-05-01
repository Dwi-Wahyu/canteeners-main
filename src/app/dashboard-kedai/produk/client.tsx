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
import {
  Edit,
  Eye,
  Plus,
  SquareArrowOutUpRight,
  Trash,
  Search,
  Filter,
} from "lucide-react";
import { getShopProducts } from "../../../features/product/lib/product-queries";
import NavButton from "@/components/nav-button";
import { useQueryState, parseAsInteger, parseAsBoolean } from "nuqs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getImageUrl } from "@/helper/get-image-url";
import { formatRupiah } from "@/helper/format-rupiah";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/features/category/lib/category-queries";
import { Badge } from "@/components/ui/badge";

export default function ProductClientPage({
  data,
  categories,
}: {
  data: Awaited<ReturnType<typeof getShopProducts>>;
  categories: Awaited<ReturnType<typeof getCategories>>;
}) {
  const [filterName, setFilterName] = useQueryState("name", {
    shallow: false,
    clearOnDefault: true,
    defaultValue: "",
  });

  const [filterCategory, setFilterCategory] = useQueryState(
    "categoryId",
    parseAsInteger.withOptions({
      shallow: false,
      clearOnDefault: true,
    }),
  );

  const [filterAvailable, setFilterAvailable] = useQueryState(
    "isAvailable",
    parseAsBoolean.withOptions({
      shallow: false,
      clearOnDefault: true,
    }),
  );

  const [sortBy, setSortBy] = useQueryState("sortBy", {
    shallow: false,
    clearOnDefault: true,
    defaultValue: "newest",
  });

  return (
    <div className="min-h-screen pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Daftar Produk</h1>
        <div className="text-muted-foreground text-sm">
          Manajemen produk yang tersedia di kedai Anda
        </div>
      </div>

      <div className="mb-6">
        <NavButton
          className="w-full h-12 text-md shadow-md hover:shadow-lg transition-all"
          href="/dashboard-kedai/produk/create"
          variant="default"
        >
          <Plus className="mr-2 h-5 w-5" />
          Input Produk Baru
        </NavButton>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama produk..."
            value={filterName}
            onChange={(ev) => setFilterName(ev.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          <Select
            value={filterCategory?.toString() || "all"}
            onValueChange={(val) =>
              setFilterCategory(val === "all" ? null : parseInt(val))
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={
              filterAvailable === null
                ? "all"
                : filterAvailable === true
                  ? "available"
                  : "unavailable"
            }
            onValueChange={(val) => {
              if (val === "all") setFilterAvailable(null);
              else if (val === "available") setFilterAvailable(true);
              else if (val === "unavailable") setFilterAvailable(false);
            }}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="available">Tersedia</SelectItem>
              <SelectItem value="unavailable">Habis</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy || "newest"}
            onValueChange={(val) => setSortBy(val)}
          >
            <SelectTrigger className="h-10 col-span-2 md:col-span-1">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="best_selling">Terlaris</SelectItem>
              <SelectItem value="price_asc">Harga Terendah</SelectItem>
              <SelectItem value="price_desc">Harga Tertinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {data && data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.map((product, idx) => (
            <Card
              key={idx}
              className="overflow-hidden border-gray-100 shadow-sm"
            >
              <div className="relative">
                <img
                  src={getImageUrl("/product/" + product.image_url)}
                  alt={product.name}
                  className="aspect-video w-full object-cover"
                />
                {!product.is_available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Badge variant="destructive" className="px-4 py-1">
                      Stok Habis
                    </Badge>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <Badge
                    variant="secondary"
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    {product._count.order_items} Terjual
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1">
                  {product.name}
                </CardTitle>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-xl text-primary">
                    {formatRupiah(product.price)}
                  </span>
                </div>
                <CardDescription className="line-clamp-2 text-xs h-8">
                  {product.description || "Tidak ada deskripsi"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2 gap-2">
                <NavButton
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9"
                  href={`/dashboard-kedai/produk/${product.id}`}
                >
                  <Eye className="w-4 h-4 mr-1" /> Detail
                </NavButton>

                <NavButton
                  size="sm"
                  className="flex-1 h-9"
                  href={`/dashboard-kedai/produk/${product.id}/edit`}
                >
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </NavButton>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Empty className="border-dashed py-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search className="size-10 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Produk Tidak Ditemukan</EmptyTitle>
            <EmptyDescription>
              Coba sesuaikan filter atau cari nama produk lain
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NavButton
              size="sm"
              href="/dashboard-kedai/produk/create"
              variant="outline"
              className="px-8"
            >
              Tambah Produk Baru
            </NavButton>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
