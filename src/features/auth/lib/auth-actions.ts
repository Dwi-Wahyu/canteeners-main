"use server";

import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { RegisterInput, RegisterSchema } from "../types/auth-schemas";

export async function registerCustomer(
  payload: RegisterInput & { firebaseUid: string },
): Promise<ServerActionReturn<void>> {
  const parsed = RegisterSchema.safeParse(payload);

  if (!parsed.success) {
    return errorResponse("Data registrasi tidak valid");
  }

  const { name, username, password } = parsed.data;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }],
      },
    });

    if (existingUser) {
      return errorResponse("Username sudah digunakan");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        id: payload.firebaseUid,
        name,
        username,
        password: hashedPassword,
        role: "CUSTOMER",
        customer: {
          create: {
            cart: {
              create: {
                status: "ACTIVE",
              },
            },
          },
        },
      },
    });

    return successResponse(undefined, "Registrasi berhasil");
  } catch (error) {
    console.error("Error during registration:", error);
    return errorResponse("Terjadi kesalahan saat melakukan registrasi");
  }
}
