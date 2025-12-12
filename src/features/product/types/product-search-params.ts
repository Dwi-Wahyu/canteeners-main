import {
    createSearchParamsCache,
    parseAsString,
    parseAsInteger,
} from "nuqs/server";

export const productSearchParams = createSearchParamsCache({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(5),
    name: parseAsString.withDefault(""),
});

export type productSearchParamsInput = {
    page: number;
    perPage: number;
    name: string;
};