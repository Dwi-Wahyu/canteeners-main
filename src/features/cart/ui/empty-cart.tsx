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

export default function EmptyCart({ shopping_url }: { shopping_url: string }) {
  return (
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
  );
}
