import { RefundStatus } from "@/generated/prisma";

import { createSearchParamsCache, parseAsStringEnum } from "nuqs/server";

export const RefundSearchParams = createSearchParamsCache({
  status: parseAsStringEnum<RefundStatus>(Object.values(RefundStatus)),
});

export type RefundSearchParamsInput = {
  status: string;
};
