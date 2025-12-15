import { getShopAndProducts } from "../lib/shop-queries";

export type GetShopAndProducts = NonNullable<
  Awaited<ReturnType<typeof getShopAndProducts>>
>;
