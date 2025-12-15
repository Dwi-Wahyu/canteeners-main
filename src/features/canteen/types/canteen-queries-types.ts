import { getCanteenBySlug } from "../lib/canteen-queries";

export type GetCanteenBySlug = NonNullable<
  Awaited<ReturnType<typeof getCanteenBySlug>>
>;
