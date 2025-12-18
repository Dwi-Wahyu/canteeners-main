"use server";

import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
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
    const createdUser = await prisma.user.create({
      data: {
        id: firebaseUserUid,
        name: guestName,
        role: "CUSTOMER",
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

    if (!createdUser) {
      return errorResponse("Terjadi kesalahan saat membuat user");
    }

    const createdCustomer = await prisma.customer.create({
      data: {
        user_id: createdUser.id,
      },
    });

    if (!createdCustomer) {
      return errorResponse("Terjadi kesalahan saat membuat customer");
    }

    const createdCart = await prisma.cart.create({
      data: {
        customer_id: createdCustomer.id,
        status: "ACTIVE",
      },
    });

    if (!createdCart) {
      return errorResponse("Terjadi kesalahan saat membuat keranjang");
    }

    return successResponse(
      {
        user_id: createdUser.id,
        customer_id: createdCustomer.id,
        cart_id: createdCart.id,
      },
      "Sukses membuat guest customer"
    );
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}

export async function changeGuestName({
  id,
  name,
}: {
  id: string;
  name: string;
}): Promise<ServerActionReturn<void>> {
  try {
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    return successResponse(undefined, "Berhasil menyimpan nama");
  } catch (error) {
    return errorResponse("Terjadi kesalahan saat menyimpan nama");
  }
}

export async function chooseCustomerTable({
  customer_id,
  canteen_id,
  floor,
  table_number,
}: {
  customer_id: string;
  floor: number;
  table_number: number;
  canteen_id: number;
}): Promise<ServerActionReturn<void>> {
  try {
    await prisma.customer.update({
      where: {
        id: customer_id,
      },
      data: {
        canteen_id,
        floor,
        table_number,
      },
    });

    return successResponse(undefined, "Sukses mencatat meja");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}
