import {
  getCustomerOrderDetail,
  getOrderDetail,
  getOrderTrackingData,
  getShopOrderDetail,
} from "../lib/order-queries";

export type GetOrderDetail = NonNullable<
  Awaited<ReturnType<typeof getOrderDetail>>
>;

export type GetShopOrderDetail = NonNullable<
  Awaited<ReturnType<typeof getShopOrderDetail>>
>;

export type GetCustomerOrderDetail = NonNullable<
  Awaited<ReturnType<typeof getCustomerOrderDetail>>
>;

export type GetOrderTrackingData = Awaited<
  ReturnType<typeof getOrderTrackingData>
>;
