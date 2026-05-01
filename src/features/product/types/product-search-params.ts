import {
    createSearchParamsCache,
    parseAsString,
    parseAsInteger,
    parseAsBoolean,
} from "nuqs/server";

export const ProductSearchParams = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(5),
    name: parseAsString.withDefault(""),
    categoryId: parseAsInteger,
    isAvailable: parseAsBoolean,
    sortBy: parseAsString.withDefault("newest"),
});

export type ProductSearchParamsInput = {
    page: number;
    perPage: number;
    name: string;
    categoryId?: number;
    isAvailable?: boolean;
    sortBy: string;
};