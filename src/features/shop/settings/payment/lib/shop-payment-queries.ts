"use server";

import { PaymentMethod } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

export async function getShopPaymentByMethod({
  method,
  shop_id,
}: {
  shop_id: string;
  method: PaymentMethod;
}) {
  return await prisma.payment.findFirst({
    where: {
      method,
      shop_id,
    },
  });
}

export async function getShopPayments(owner_id: string) {
  return await prisma.payment.findMany({
    where: {
      shop: {
        owner_id,
      },
    },
  });
}
