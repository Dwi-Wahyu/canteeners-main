import { Input } from "@/components/ui/input";
import { CartDrawer } from "@/features/cart/ui/cart-drawer";
import { Search } from "lucide-react";
import { ProductFilterDialog } from "./product-filter-dialog";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CanteenTopbar({
  shopCount,
  cart_id,
}: {
  shopCount: number;
  cart_id?: string;
}) {
  return (
    <div className="p-4 flex gap-4 items-center">
      <div className="relative w-full h-10">
        <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
          <Search className="size-4" />
          <span className="sr-only">User</span>
        </div>
        <Input
          type="text"
          placeholder="Cari Produk"
          className="peer pl-9 h-10"
        />
      </div>

      <Suspense fallback={<Skeleton className="h-10 w-10" />}>
        <ProductFilterDialog />
      </Suspense>

      <CartDrawer cart_id={cart_id} />
    </div>
  );
}
