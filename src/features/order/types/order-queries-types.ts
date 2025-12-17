import { getOrderDetail } from "../lib/order-queries";

export type GetOrderDetail = NonNullable<
  Awaited<ReturnType<typeof getOrderDetail>>
>;
