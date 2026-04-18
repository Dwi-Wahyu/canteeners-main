import slugify from "slugify";

export function generateCategorySlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    replacement: "-",
  }).trim();
}
