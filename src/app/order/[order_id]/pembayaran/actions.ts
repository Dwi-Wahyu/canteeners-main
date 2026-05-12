"use server";

import { getPaymentTimeoutMinutes } from "@/lib/settings";

export async function getPaymentTimeoutAction() {
  return await getPaymentTimeoutMinutes();
}
