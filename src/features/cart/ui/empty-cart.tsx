import ShoppingCartQuestionIcon from "@/components/icons/shopping-cart-question-icon";
import NavButton from "@/components/nav-button";

export default function EmptyCart({ shopping_url }: { shopping_url: string }) {
  return (
    <div className="p-5">
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="p-6 bg-gray-100 rounded-full">
          <ShoppingCartQuestionIcon className="size-12 text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Keranjang masih kosong nih
          </h3>
          <p className="text-sm text-muted-foreground px-10">
            Yuk masukin produk
          </p>
        </div>
        <NavButton
          className="px-6 py-2 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
          href={shopping_url}
        >
          Cari Produk
        </NavButton>
      </div>
    </div>
  );
}
