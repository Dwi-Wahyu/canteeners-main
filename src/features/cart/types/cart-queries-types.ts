import { getCustomerShopCart } from "../lib/cart-queries";

export type GetCustomerShopCartType = NonNullable<
  Awaited<ReturnType<typeof getCustomerShopCart>>
>;

export type GetCustomerShopCartAvaillablePaymentsType =
  GetCustomerShopCartType["shop"]["payments"];

export type GetCustomerShopCartCartItemType =
  GetCustomerShopCartType["items"][number];
