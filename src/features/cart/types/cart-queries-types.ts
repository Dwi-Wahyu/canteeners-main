import { getShopCart } from "../lib/cart-queries";

export type GetShopCartType = NonNullable<
  Awaited<ReturnType<typeof getShopCart>>
>;

export type GetShopCartAvaillablePaymentsType =
  GetShopCartType["shop"]["payments"];

export type GetShopCartItemType = GetShopCartType["items"][number];
