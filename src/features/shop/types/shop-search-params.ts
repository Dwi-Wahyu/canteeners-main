import {
    createSearchParamsCache,
    parseAsString,
    parseAsInteger,
} from "nuqs/server";

export const ShopSearchParams = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(5),
    name: parseAsString.withDefault(""),
});

export type ShopSearchParamsInput = {
    page: number;
    perPage: number;
    name: string;
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

