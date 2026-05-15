import { 
  getCustomerProfile, 
  getCustomerViolations, 
  getCustomerViolationDetail,
  getCustomerSuspensionStatus,
  getUserReports
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

export type GetUserReportsType = Awaited<
  ReturnType<typeof getUserReports>
>;
