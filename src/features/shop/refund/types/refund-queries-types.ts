import { getRefundById } from "../lib/refund-queries";

export type GetRefundById = NonNullable<
  Awaited<ReturnType<typeof getRefundById>>
>;
