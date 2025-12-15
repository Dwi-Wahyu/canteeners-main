import { getCategories } from "../lib/category-queries";

export type GetCategories = NonNullable<
  Awaited<ReturnType<typeof getCategories>>
>;
