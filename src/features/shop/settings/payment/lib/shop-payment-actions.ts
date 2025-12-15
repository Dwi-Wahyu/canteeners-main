"use server";

import { PaymentMethod } from "@/generated/prisma";
import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { prisma } from "@/lib/prisma";
import { PaymentSchemaInput } from "../types/shop-payment-schema";

export async function toggleShopPaymentActive({
  method,
  shop_id,
  qr_url,
  account_number,
}: {
  shop_id: string;
  method: PaymentMethod;
  qr_url?: string;
  account_number?: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const payment = await prisma.payment.findFirst({
      where: {
        shop_id,
        method,
      },
    });

    console.log(payment);

    if (!payment) {
      switch (method) {
        case "CASH":
          await prisma.payment.create({
            data: {
              method,
              active: true,
              shop_id,
            },
          });

          return successResponse(
            undefined,
            "Sukses menambahkan metode pembayaran"
          );

        case "QRIS":
          if (!qr_url) {
            return errorResponse("QR Code tidak ditemukan");
          }

          await prisma.payment.create({
            data: {
              method,
              active: true,
              qr_url,
              shop_id,
            },
          });

          return successResponse(
            undefined,
            "Sukses menambahkan metode pembayaran"
          );

        case "BANK_TRANSFER":
          if (!account_number) {
            return errorResponse("Nomor rekening tidak ditemukan");
          }

          await prisma.payment.create({
            data: {
              method,
              active: true,
              account_number,
              shop_id,
            },
          });

          return successResponse(
            undefined,
            "Sukses menambahkan metode pembayaran"
          );

        default:
          return errorResponse("Metode pembayaran tidak ditemukan");
      }
    }

    await prisma.payment.update({
      where: {
        shop_id_method: {
          shop_id,
          method,
        },
      },
      data: {
        active: !payment.active,
      },
    });

    return successResponse(undefined, "Sukses mengubah status");
  } catch (error) {
    console.log(error);

    return errorResponse("Terjadi kesalahan");
  }
}

export async function updateShopQrisPayment({
  payload,
  shop_id,
}: {
  payload: PaymentSchemaInput;
  shop_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const { method, qr_url, note, additional_price } = payload;

    if (method !== "QRIS") {
      return errorResponse("Hanya metode QRIS yang didukung");
    }

    if (!qr_url) {
      return errorResponse("Gambar QR Code wajib diunggah");
    }

    await prisma.payment.update({
      where: {
        shop_id_method: {
          shop_id,
          method,
        },
      },
      data: {
        qr_url,
        note: note || null,
        additional_price: additional_price ? Number(additional_price) : null,
      },
    });

    return successResponse(undefined, "Berhasil memperbarui QRIS");
  } catch (error) {
    console.error("[UpdateShopPayment]", error);
    return errorResponse("Gagal memperbarui data QRIS");
  }
}

export async function updateShopPayment({
  payload,
  shop_id,
}: {
  payload: PaymentSchemaInput;
  shop_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const { method, qr_url, note, additional_price } = payload;

    console.log(shop_id);

    if (method !== "QRIS") {
      return errorResponse("Hanya metode QRIS yang didukung");
    }

    if (!qr_url) {
      return errorResponse("Gambar QR Code wajib diunggah");
    }

    await prisma.payment.update({
      where: {
        shop_id_method: {
          shop_id,
          method,
        },
      },
      data: {
        qr_url,
        note: note || null,
        additional_price: additional_price ? Number(additional_price) : null,
      },
    });

    return successResponse(undefined, "Berhasil memperbarui QRIS");
  } catch (error) {
    console.error("[UpdateShopPayment]", error);
    return errorResponse("Gagal memperbarui data QRIS");
  }
}

export async function createQrisPayment({
  payload,
  shop_id,
}: {
  payload: PaymentSchemaInput;
  shop_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const { method, qr_url, note, additional_price } = payload;

    if (!qr_url) {
      return errorResponse("Gambar QR Code wajib diunggah");
    }

    await prisma.payment.create({
      data: {
        shop_id,
        method,
        qr_url,
        note: note || null,
        additional_price: additional_price ? Number(additional_price) : null,
      },
    });

    return successResponse(undefined, "Berhasil input pembayaran QRIS");
  } catch (error) {
    console.error("[UpdateShopPayment]", error);
    return errorResponse("Gagal input data QRIS");
  }
}

export async function updateQrisPayment({
  payload,
  shop_id,
}: {
  payload: PaymentSchemaInput;
  shop_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const { method, qr_url, note, additional_price } = payload;

    if (!qr_url) {
      return errorResponse("Gambar QR Code wajib diunggah");
    }

    await prisma.payment.update({
      where: {
        shop_id_method: {
          method,
          shop_id,
        },
      },
      data: {
        shop_id,
        method,
        qr_url,
        note: note || null,
        additional_price: additional_price ? Number(additional_price) : null,
      },
    });

    return successResponse(undefined, "Berhasil input pembayaran QRIS");
  } catch (error) {
    console.error("[UpdateShopPayment]", error);
    return errorResponse("Gagal input data QRIS");
  }
}

export async function createBankTransferPayment({
  payload,
  shop_id,
}: {
  payload: PaymentSchemaInput;
  shop_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const { method, account_number, note, additional_price } = payload;

    if (!account_number) {
      return errorResponse("Isi nomor rekening");
    }

    await prisma.payment.create({
      data: {
        shop_id,
        method,
        account_number,
        note: note || null,
        additional_price: additional_price ? Number(additional_price) : null,
      },
    });

    return successResponse(undefined, "Berhasil menyimpan pembayaran");
  } catch (error) {
    console.error("[UpdateShopPayment]", error);
    return errorResponse("Gagal input data pembayaran");
  }
}

export async function updateBankTransferPayment({
  payload,
  shop_id,
}: {
  payload: PaymentSchemaInput;
  shop_id: string;
}): Promise<ServerActionReturn<void>> {
  try {
    const { method, account_number, note, additional_price } = payload;

    if (!account_number) {
      return errorResponse("Isi nomor rekening");
    }

    await prisma.payment.update({
      where: {
        shop_id_method: {
          method,
          shop_id,
        },
      },
      data: {
        shop_id,
        method,
        account_number,
        note: note || null,
        additional_price: additional_price ? Number(additional_price) : null,
      },
    });

    return successResponse(undefined, "Berhasil menyimpan pembayaran");
  } catch (error) {
    console.error("[UpdateShopPayment]", error);
    return errorResponse("Gagal input data pembayaran");
  }
}
