import {
  getCanteenBySlug,
  getCanteenIncludeMaps,
} from "../lib/canteen-queries";

export type GetCanteenBySlug = NonNullable<
  Awaited<ReturnType<typeof getCanteenBySlug>>
>;

export type GetCanteenIncludeMaps = NonNullable<
  Awaited<ReturnType<typeof getCanteenIncludeMaps>>
>;
