import { 
  getCustomerProfile, 
  getCustomerViolations, 
  getCustomerViolationDetail,
  getCustomerSuspensionStatus
} from "../lib/user-queries";

export type GetCustomerProfileType = NonNullable<
  Awaited<ReturnType<typeof getCustomerProfile>>
>;

export type GetCustomerViolationsType = Awaited<
  ReturnType<typeof getCustomerViolations>
>;

export type GetCustomerViolationDetailType = Awaited<
  ReturnType<typeof getCustomerViolationDetail>
>;

export type GetCustomerSuspensionStatusType = Awaited<
  ReturnType<typeof getCustomerSuspensionStatus>
>;
