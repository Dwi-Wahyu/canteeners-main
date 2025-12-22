import { createSearchParamsCache, parseAsString } from "nuqs/server";

export const billingSearchParamsCache = createSearchParamsCache({
  status: parseAsString.withDefault("all"),
});

export type BillingSearchParamsInput = {
  status: string;
};
