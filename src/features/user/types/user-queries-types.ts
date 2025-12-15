import { getCustomerProfile } from "../lib/user-queries";

export type GetCustomerProfileType = NonNullable<
  Awaited<ReturnType<typeof getCustomerProfile>>
>;
