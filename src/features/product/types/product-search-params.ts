import {
    createSearchParamsCache,
    parseAsString,
    parseAsInteger,
} from "nuqs/server";

export const ProductSearchParams = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(5),
    name: parseAsString.withDefault(""),
});

export type ProductSearchParamsInput = {
    page: number;
    perPage: number;
    name: string;
};