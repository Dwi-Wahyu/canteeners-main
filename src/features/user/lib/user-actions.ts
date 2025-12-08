"use server";

import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { adminAuth } from "@/lib/firebase/admin";
import { prisma } from "@/lib/prisma";

export async function createGuestCustomer({
  firebaseUserUid,
  guestName,
}: {
  firebaseUserUid: string;
  guestName: string;
}): Promise<
  ServerActionReturn<{
    user_id: string;
    customer_id: string;
    cart_id: string;
  }>
> {
  try {
    const user = await prisma.user.create({
      data: {
        id: firebaseUserUid,
        name: guestName,
        role: "CUSTOMER",
        customer: {
          create: {
            cart: {
              create: { status: "ACTIVE" },
            },
          },
        },
      },
      select: {
        id: true,
        customer: {
          select: {
            id: true,
            cart: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // todo: cari cara yang lebih elegan untuk memastikan customer dan cart id pasti ada
    return successResponse(
      {
        user_id: user.id,
        customer_id: user.customer?.id ?? "",
        cart_id: user.customer?.cart?.id ?? "",
      },
      "Sukses membuat guest customer"
    );
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}
