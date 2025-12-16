import ShoppingCartQuestionIcon from "@/components/icons/shopping-cart-question-icon";
import NavButton from "@/components/nav-button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ChevronLeft } from "lucide-react";

export default function EmptyCart({ shopping_url }: { shopping_url: string }) {
  return (
    <div>
      <div className="w-full p-4 flex items-center text-primary-foreground justify-between bg-linear-to-r from-primary to-primary/90">
        <div className="flex gap-2 items-center ">
          <NavButton size="icon" variant="ghost" href="/chat">
            <ChevronLeft />
          </NavButton>

          <h1 className="text-xl">Keranjang</h1>
        </div>
      </div>

      <div className="p-5">
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingCartQuestionIcon />
            </EmptyMedia>
            <EmptyTitle>Keranjang masih kosong nih</EmptyTitle>
            <EmptyDescription>Yuk masukin produk</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NavButton variant="outline" href={shopping_url}>
              Cari Produk
            </NavButton>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
