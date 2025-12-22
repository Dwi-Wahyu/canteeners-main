import { getOrderAndPaymentMethod } from "@/features/order/lib/order-queries";

export type GetOrderAndPaymentMethod = NonNullable<
  Awaited<ReturnType<typeof getOrderAndPaymentMethod>>
>;
