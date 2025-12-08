"use server";

import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { prisma } from "@/lib/prisma";

export async function createGuestCustomer(): Promise<
  ServerActionReturn<{ user_id: string; customer_id: string; cart_id: string }>
> {
  try {
    const user = await prisma.user.create({
      data: {
        name: "",
        role: "CUSTOMER",
      },
      include: {
        customer: {
          select: {
            id: true,
          },
        },
      },
    });

    const customer = await prisma.customer.create({
      data: {
        user_id: user.id,
      },
    });

    const cart = await prisma.cart.create({
      data: {
        customer_id: customer.id,
      },
    });

    return successResponse(
      { user_id: user.id, customer_id: customer.id, cart_id: cart.id },
      "Sukses menambahkan ke keranjang"
    );
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}
