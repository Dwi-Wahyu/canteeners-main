import { Input } from "@/components/ui/input";
import { CartDrawer } from "@/features/cart/ui/cart-drawer";
import { Search } from "lucide-react";
import { ProductFilterDialog } from "./product-filter-dialog";

export default function CanteenTopbar({ shopCount, cart_id }: { shopCount: number, cart_id?: string }) {
  return (
    <div className="p-4 flex gap-4 items-center">
      <div className='relative w-full h-10'>
        <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
          <Search className='size-4' />
          <span className='sr-only'>User</span>
        </div>
        <Input type='text' placeholder='Cari Produk' className='peer pl-9 h-10' />
      </div>

      <ProductFilterDialog />

      <CartDrawer cart_id={cart_id} />
    </div>


    // <div className="p-5 shadow border-b fixed top-0 left-0 w-full bg-card">
    //   <div className="flex justify-between items-center">
    //     <div className="flex gap-2 items-center">
    //       <Link href={"/"}>
    //         <ChevronLeft className="text-muted-foreground" />
    //       </Link>
    //       <div>
    //         <h1 className="font-semibold leading-tight text-xl">Pilih Kedai</h1>
    //         <h1 className="text-sm text-muted-foreground">
    //           {shopCount} kedai tersedia
    //         </h1>
    //       </div>
    //     </div>

    //     <CartDrawer />
    //   </div>
    // </div>
  );
}
