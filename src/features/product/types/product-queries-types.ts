import { getProductById } from "../lib/product-queries";

export type GetProductById = Awaited<ReturnType<typeof getProductById>>;
