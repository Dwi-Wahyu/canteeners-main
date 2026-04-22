"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ProductFilterDialog } from "./product-filter-dialog";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryState } from "nuqs";

export default function CanteenTopbar({
  shopCount,
}: {
  shopCount: number;
}) {
  const [name, setName] = useQueryState("name", {
    shallow: false,
    throttleMs: 500,
  });

  return (
    <div className="p-4 flex gap-4 items-center">
      <div className="relative w-full h-10">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          <Search className="size-4" />
          <span className="sr-only">User</span>
        </div>
        <Input
          type="text"
          placeholder="Cari Kedai atau Menu"
          className="peer pl-9 h-10"
          value={name ?? ""}
          onChange={(e) => setName(e.target.value || null)}
        />
      </div>

      <Suspense fallback={<Skeleton className="h-10 w-10" />}>
        <ProductFilterDialog />
      </Suspense>
    </div>
  );
}
