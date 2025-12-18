import { getShopAndProducts, getShopTestimonies } from "../lib/shop-queries";

export type GetShopAndProducts = NonNullable<
  Awaited<ReturnType<typeof getShopAndProducts>>
>;

export type GetShopTestimonies = NonNullable<
  Awaited<ReturnType<typeof getShopTestimonies>>
>;

