import { CanteenCategoryFilterClient } from "./canteen-category-filter-client";
import { getCategories } from "@/features/category/lib/category-queries";

export const CanteenCategoryFilter = async () => {
  const categories = await getCategories();
  return <CanteenCategoryFilterClient categories={categories} />;
};
