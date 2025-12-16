import { GetShopCartItemType } from "../types/cart-queries-types";

export default async function CartItemClient({
  data,
}: {
  data: GetShopCartItemType;
}) {
  return (
    <div>
      <h1>{data.product.name}</h1>
    </div>
  );
}
