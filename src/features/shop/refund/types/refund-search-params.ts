import { RefundStatus } from "@/generated/prisma";
import { parseAsStringEnum } from "nuqs";
import { createSearchParamsCache } from "nuqs/server";

export const RefundSearchParams = createSearchParamsCache({
  status: parseAsStringEnum(Object.values(RefundStatus)),
});

export type RefundSearchParamsInput = {
  status: string;
};
