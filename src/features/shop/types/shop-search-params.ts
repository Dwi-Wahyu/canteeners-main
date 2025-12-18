import {
    createSearchParamsCache,
    parseAsString,
    parseAsInteger,
    parseAsArrayOf
} from "nuqs/server";

export const ShopSearchParams = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(5),
    name: parseAsString.withDefault(""),
    categories: parseAsArrayOf(parseAsInteger).withDefault([]),
    minimumPrice: parseAsInteger.withDefault(0),
    maximumPrice: parseAsInteger.withDefault(0),
});

export type ShopSearchParamsInput = {
    page: number;
    perPage: number;
    name: string;
    categories: number[];
    minimumPrice: number;
    maximumPrice: number;
};

export const ShopProductsSearchParams = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(5),
    productName: parseAsString.withDefault(""),
});

export type ShopProductsSearchParamsInput = {
    page: number;
    perPage: number;
    productName: string;
};

