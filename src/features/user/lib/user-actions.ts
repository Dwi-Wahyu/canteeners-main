"use server";

import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { prisma } from "@/lib/prisma";
import { ReportUserInput } from "../types/user-schema";
import { auth } from "@/config/auth";
import { revalidatePath } from "next/cache";

export async function createGuestCustomer({
  firebaseUserUid,
  guestName,
  tableData,
}: {
  firebaseUserUid: string;
  guestName: string;
  tableData?: {
    canteen_id: number;
    floor: number;
    table_number: number;
  };
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
      },
    });

    if (!createdUser) {
      return errorResponse("Terjadi kesalahan saat membuat user");
    }

    const createdCustomer = await prisma.customer.create({
      data: {
        user_id: createdUser.id,
        ...(tableData && {
          canteen_id: tableData.canteen_id,
          floor: tableData.floor,
          table_number: tableData.table_number,
          last_visit_at: new Date(),
        }),
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
      "Sukses membuat guest customer",
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

    revalidatePath("/", "layout");

    return successResponse(undefined, "Sukses mencatat meja");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}

export async function reportUser(payload: ReportUserInput) {
  const session = await auth();

  if (!session) {
    return errorResponse("Sesi tidak terdeteksi");
  }

  try {
    await prisma.userReport.create({
      data: {
        reporter_id: session.user.id,
        reported_id: payload.reported_id,
        category: payload.reasons,
        description: payload.description,
      },
    });

    return successResponse(undefined, "Sukses membuat laporan");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan membuat laporan");
  }
}

export async function activateReferralCode(): Promise<
  ServerActionReturn<string>
> {
  const session = await auth();

  if (!session || session.user.role !== "CUSTOMER") {
    return errorResponse("Sesi tidak valid");
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { user_id: session.user.id },
      include: {
        _count: {
          select: {
            orders: {
              where: {
                status: "COMPLETED",
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return errorResponse("Customer tidak ditemukan");
    }

    if (customer.referral_code) {
      return successResponse(
        customer.referral_code,
        "Referral code sudah aktif",
      );
    }

    if (customer._count.orders < 2) {
      return errorResponse("Belum memenuhi syarat (minimal 2 pesanan selesai)");
    }

    // Generate random referral code
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const referralCode = `${session.user.name?.split(" ")[0].toUpperCase() || "USER"}-${randomCode}`;

    await prisma.customer.update({
      where: { id: customer.id },
      data: { referral_code: referralCode },
    });

    return successResponse(referralCode, "Referral code berhasil diaktifkan");
  } catch (error) {
    console.log(error);
    return errorResponse("Terjadi kesalahan saat mengaktifkan referral code");
  }
}

export async function validateReferralCode(
  code: string,
): Promise<ServerActionReturn<{ discount: number; code: string }>> {
  const session = await auth();

  if (!session) {
    return errorResponse("Sesi tidak valid");
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { user_id: session.user.id },
      select: { id: true, has_used_referral: true },
    });

    if (!customer) {
      return errorResponse("Customer tidak ditemukan");
    }

    if (customer.has_used_referral) {
      return errorResponse("Anda sudah pernah menggunakan kode referral");
    }

    const referrer = await prisma.customer.findUnique({
      where: { referral_code: code },
      select: {
        id: true,
        user_id: true,
      },
    });

    if (!referrer) {
      return errorResponse("Kode referral tidak valid atau tidak ditemukan");
    }

    if (referrer.user_id === session.user.id) {
      return errorResponse("Anda tidak bisa menggunakan kode referral sendiri");
    }

    // Fixed discount of 10,000
    return successResponse(
      { discount: 10000, code },
      "Kode referral berhasil diterapkan",
    );
  } catch (error) {
    console.log(error);
    return errorResponse("Terjadi kesalahan saat validasi kode referral");
  }
}

export async function getUnseenVouchers(): Promise<ServerActionReturn<any[]>> {
  const session = await auth();
  if (!session || session.user.role !== "CUSTOMER") {
    return errorResponse("Sesi tidak valid");
  }

  try {
    const unseenVouchers = await prisma.customerDiscount.findMany({
      where: {
        customer: {
          user_id: session.user.id,
        },
        is_seen: false,
      },
      include: {
        discount: true,
      },
    });

    return successResponse(unseenVouchers, "Berhasil mengambil voucher baru");
  } catch (error) {
    console.error(error);
    return errorResponse("Terjadi kesalahan");
  }
}

export async function markVouchersAsSeen(
  voucherIds: string[],
): Promise<ServerActionReturn<void>> {
  try {
    await prisma.customerDiscount.updateMany({
      where: {
        id: { in: voucherIds },
      },
      data: {
        is_seen: true,
      },
    });

    return successResponse(
      undefined,
      "Berhasil menandai voucher sebagai dilihat",
    );
  } catch (error) {
    console.error(error);
    return errorResponse("Terjadi kesalahan");
  }
}

import { ChangePasswordSchemaType } from "@/features/auth/types/auth-schemas";
import { compareSync, hashSync } from "bcryptjs";

export async function changePassword(
  payload: ChangePasswordSchemaType,
): Promise<ServerActionReturn<void>> {
  const session = await auth();

  if (!session || !session.user.id) {
    return errorResponse("Sesi tidak valid");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user || !user.password) {
      return errorResponse("User tidak ditemukan atau tidak memiliki password");
    }

    const isPasswordValid = compareSync(payload.current_password, user.password);

    if (!isPasswordValid) {
      return errorResponse("Kata sandi saat ini salah");
    }

    const hashedPassword = hashSync(payload.new_password, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return successResponse(undefined, "Kata sandi berhasil diubah");
  } catch (error) {
    console.error(error);
    return errorResponse("Terjadi kesalahan saat mengubah kata sandi");
  }
}
