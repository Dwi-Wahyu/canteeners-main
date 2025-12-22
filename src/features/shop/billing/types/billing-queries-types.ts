import { getShopBillings, getBillingById } from "../lib/billing-queries";

export type GetShopBillings = NonNullable<
  Awaited<ReturnType<typeof getShopBillings>>
>;

export type GetBillingDetail = NonNullable<
  Awaited<ReturnType<typeof getBillingById>>
>;

export type ShopBilling = GetShopBillings[number];
