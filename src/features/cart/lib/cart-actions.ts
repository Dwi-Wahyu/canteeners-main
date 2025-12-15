"use server";

import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AddCartItemNotesInput } from "../types/cart-schema";
import { PaymentMethod, PostOrderType } from "@/generated/prisma";

export async function processShopCart({
  shopCartId,
  paymentMethod,
  postOrderType,
  floor,
  table_number,
  guest_name,
}: {
  shopCartId: string;
  paymentMethod: PaymentMethod;
  postOrderType: PostOrderType;
  floor: number | null;
  table_number: number | null;
  guest_name: string;
}): Promise<
  ServerActionReturn<{ conversation_id?: string; order_id?: string }>
> {
  let conversation_id;
  let order_id;

  try {
    await prisma.$transaction(async (tx) => {
      const shopCart = await prisma.shopCart.findFirst({
        where: {
          id: shopCartId,
        },
        select: {
          id: true,
          cart: {
            select: {
              customer_id: true,
              customer: {
                select: {
                  user_id: true,
                },
              },
            },
          },
          post_order_type: true,
          total_price: true,
          notes: true,
          payment_method: true,
          order_id: true,
          shop: {
            select: {
              id: true,
              name: true,
              canteen_id: true,
              canteen: {
                select: {
                  name: true,
                },
              },
              owner_id: true,
              owner: {
                select: {
                  user_id: true,
                },
              },
              payments: {
                select: {
                  method: true,
                },
              },
            },
          },
          items: {
            select: {
              product: {
                select: {
                  id: true,
                  name: true,
                  image_url: true,
                },
              },
              id: true,
              notes: true,
              price_at_add: true,
              quantity: true,
            },
          },
        },
      });

      if (!shopCart) {
        return errorResponse("Keranjang kedai tidak ditemukan");
      }

      const { customer_id } = shopCart.cart;
      const customer_user_id = shopCart.cart.customer.user_id;
      const owner_user_id = shopCart.shop.owner.user_id;

      await prisma.user.update({
        where: {
          id: customer_user_id,
        },
        data: {
          name: guest_name,
        },
      });

      const existingConversation = await tx.conversation.findFirst({
        where: {
          participants: {
            every: {
              user_id: { in: [customer_user_id, owner_user_id] },
            },
          },
        },
      });

      conversation_id =
        existingConversation?.id ??
        (
          await tx.conversation.create({
            data: {
              participants: {
                createMany: {
                  data: [
                    { user_id: customer_user_id },
                    { user_id: owner_user_id },
                  ],
                },
              },
            },
          })
        ).id;

      const order = await tx.order.create({
        data: {
          shop_id: shopCart.shop.id,
          customer_id,
          payment_method: paymentMethod,
          status: "PENDING_CONFIRMATION",
          total_price: shopCart.total_price,
          post_order_type: postOrderType,
          floor: postOrderType === "DELIVERY_TO_TABLE" ? floor : null,
          table_number:
            postOrderType === "DELIVERY_TO_TABLE" ? table_number : null,
          conversation_id,
          order_items: {
            createMany: {
              data: shopCart.items.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.price_at_add * item.quantity,
                note: item.notes,
              })),
            },
          },
        },
      });

      order_id = order.id;

      await tx.shopCart.update({
        where: {
          id: shopCart.id,
        },
        data: {
          order_id: order.id,
        },
      });

      await tx.message.create({
        data: {
          conversation_id,
          sender_id: customer_user_id,
          order_id: order.id,
          type: "ORDER",
          text: `Order masuk. Mohon konfirmasi apakah pesanan tersedia`,
        },
      });
    });

    return successResponse(
      { conversation_id, order_id },
      "Berhasil memproses pesanan"
    );
  } catch (error) {
    console.log(error);

    return errorResponse("Gagal memproses pesanan");
  }
}

export async function addToCart({
  cartId,
  shopId,
  productId,
  quantity,
  selected_option_value_ids,
}: {
  shopId: string;
  cartId: string;
  productId: string;
  quantity: number;
  selected_option_value_ids: string[];
}): Promise<ServerActionReturn<{ shopCartId: string }>> {
  try {
    let shopCartId;

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product tidak ditemukan");
      }

      // Cari shop cart belum checkout
      let shopCart = await tx.shopCart.findFirst({
        where: {
          cart_id: cartId,
          shop_id: shopId,
          order_id: null,
        },
      });

      if (!shopCart) {
        shopCart = await tx.shopCart.create({
          data: {
            cart_id: cartId,
            shop_id: shopId,
          },
        });
      }

      // Masukkan ke variabel luar transaksi
      shopCartId = shopCart.id;

      // Tambah item
      await tx.cartItem.create({
        data: {
          product_id: productId,
          shop_cart_id: shopCart.id,
          quantity,
          price_at_add: product.price,
          selected_options: {
            connect: selected_option_value_ids.map((id) => ({ id })),
          },
        },
      });

      // Hitung ulang total harga shop cart
      const cartItems = await tx.cartItem.findMany({
        where: {
          shop_cart_id: shopCart.id,
        },
        include: {
          selected_options: {
            select: {
              additional_price: true,
            },
          },
        },
      });

      const totals = cartItems.reduce((acc, item) => {
        const additionalOptionsTotal = item.selected_options.reduce(
          (sum, opt) => sum + (opt.additional_price || 0),
          0
        );

        const baseTotal =
          (item.price_at_add + additionalOptionsTotal) * item.quantity;

        const quantityFee = item.quantity * 1000;

        return acc + baseTotal + quantityFee;
      }, 0);

      await tx.shopCart.update({
        where: { id: shopCart.id },
        data: { total_price: totals },
      });
      // Selesai hitung ulang total harga shop cart
    });

    if (!shopCartId) {
      return errorResponse("Gagal tambah ke keranjang");
    }

    console.log(shopCartId);

    return successResponse({ shopCartId }, "Berhasil tambah ke keranjang");
  } catch (error) {
    console.error(error);
    return errorResponse("Gagal tambah ke keranjang");
  }
}

export async function deleteShopCart(
  shop_cart_id: string
): Promise<ServerActionReturn<void>> {
  try {
    await prisma.$transaction(async (tx) => {
      // Hapus semua item dalam shop cart terlebih dahulu
      await tx.cartItem.deleteMany({
        where: {
          shop_cart_id,
        },
      });
      // Hapus shop cart
      await tx.shopCart.delete({
        where: {
          id: shop_cart_id,
        },
      });
    });
    return successResponse(undefined, "Berhasil menghapus keranjang");
  } catch (error) {
    console.error("Error deleting shop cart:", error);
    return errorResponse("Gagal menghapus keranjang");
  }
}

export async function deleteCartItem(
  cart_item_id: string
): Promise<ServerActionReturn<void>> {
  try {
    await prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findUnique({
        where: { id: cart_item_id },
        select: { shop_cart_id: true },
      });

      if (!cartItem) {
        throw new Error("Item keranjang tidak ditemukan");
      }

      await tx.cartItem.delete({
        where: { id: cart_item_id },
      });

      // Hitung ulang total harga shop cart
      const cartItems = await tx.cartItem.findMany({
        where: {
          shop_cart_id: cartItem.shop_cart_id,
        },
        include: {
          selected_options: {
            select: {
              additional_price: true,
            },
          },
        },
      });

      const totals = cartItems.reduce((acc, item) => {
        const additionalOptionsTotal = item.selected_options.reduce(
          (sum, opt) => sum + (opt.additional_price || 0),
          0
        );

        const baseTotal =
          (item.price_at_add + additionalOptionsTotal) * item.quantity;

        const quantityFee = item.quantity * 1000;

        return acc + baseTotal + quantityFee;
      }, 0);

      await tx.shopCart.update({
        where: { id: cartItem.shop_cart_id },
        data: { total_price: totals },
      });
      // Selesai hitung ulang total harga shop cart

      revalidatePath("/dashboard-pelanggan/keranjang/" + cartItem.shop_cart_id);
    });

    return successResponse(undefined, "Berhasil menghapus item");
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return errorResponse("Gagal menghapus item");
  }
}

export async function changeCartItemDetails({
  id,
  quantity,
  notes,
}: {
  id: string;
  quantity: number;
  notes: string | null;
}): Promise<ServerActionReturn<void>> {
  try {
    if (quantity < 1) {
      return errorResponse("Jumlah harus lebih besar dari 0");
    }

    // Ambil cartItem untuk mendapatkan shop_cart_id dan price_at_add
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      select: { shop_cart_id: true, price_at_add: true },
    });

    if (!cartItem) {
      throw new Error("Item keranjang tidak ditemukan");
    }

    // Lakukan transaksi untuk memastikan konsistensi data
    const result = await prisma.$transaction(async (tx) => {
      // Perbarui cartItem
      await tx.cartItem.update({
        where: { id },
        data: {
          quantity,
          notes,
        },
      });

      // Ambil semua item di shop_cart yang sama
      const cartItems = await tx.cartItem.findMany({
        where: { shop_cart_id: cartItem.shop_cart_id },
        select: { quantity: true, price_at_add: true },
      });

      // Hitung total harga dengan biaya tambahan 1000 per kuantitas produk
      const totalPrice = cartItems.reduce(
        (sum, item) => sum + (item.price_at_add + 1000) * item.quantity,
        0
      );

      await tx.shopCart.update({
        where: { id: cartItem.shop_cart_id },
        data: { total_price: totalPrice },
      });

      return undefined;
    });

    // Revalidasi path untuk memperbarui cache
    revalidatePath("/dashboard-pelanggan/keranjang/" + cartItem.shop_cart_id);

    return successResponse(result, "Sukses mengubah detail dan total harga");
  } catch (error) {
    console.error("Error in changeCartItemDetails:", error);
    return errorResponse("Gagal mengubah detail dan total harga");
  }
}

export async function removeCartItemOption(
  cart_item_id: string,
  option_value_id: string
) {
  return await prisma.cartItem.update({
    where: { id: cart_item_id },
    data: {
      selected_options: {
        disconnect: [{ id: option_value_id }],
      },
    },
    select: { id: true },
  });
}

export async function addCartItemNotes(
  payload: AddCartItemNotesInput
): Promise<ServerActionReturn<void>> {
  try {
    await prisma.cartItem.update({
      where: {
        id: payload.cart_item_id,
      },
      data: {
        notes: payload.notes,
      },
    });

    return successResponse(undefined, "Sukses menyimpan catatan");
  } catch (error) {
    return errorResponse("Terjadi kesalahan");

    console.log(error);
  }
}
