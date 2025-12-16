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
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

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
      // Ambil Data ShopCart
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
                  user: {
                    select: {
                      name: true,
                      avatar: true,
                    },
                  },
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
              owner_id: true,
              owner: {
                select: {
                  user_id: true,
                  user: {
                    select: {
                      name: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          },
          items: {
            select: {
              id: true,
              product_id: true,
              notes: true,
              price_at_add: true,
              quantity: true,
              subtotal: true,
              selected_options: {
                select: {
                  id: true,
                },
              },
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

      // Handle Conversation (Chat)
      const chatId = `${customer_user_id}_${owner_user_id}`;

      const chatRef = adminDb.collection("chats").doc(chatId);
      const chatSnap = await chatRef.get();

      // Buat percakapan jika belum ada
      if (!chatSnap.exists) {
        await chatRef.set({
          id: chatId,
          buyerId: customer_user_id,
          sellerId: owner_user_id,

          participantIds: [customer_user_id, owner_user_id],

          shopName: shopCart.shop.name,

          buyerAvatar: shopCart.cart.customer.user.avatar,
          buyerName: shopCart.cart.customer.user.name,

          lastMessageTimestamp: FieldValue.serverTimestamp(),
          lastMessage: "Order masuk. Mohon konfirmasi apakah pesanan tersedia",

          unreadCountBuyer: 0,
          unreadCountSeller: 0,
        });
      }

      // Buat Order Utama
      const order = await tx.order.create({
        data: {
          shop_id: shopCart.shop.id,
          customer_id,
          payment_method: paymentMethod,
          status: "PENDING_CONFIRMATION",
          total_price: shopCart.total_price, // total_price ShopCart yang sudah dihitung
          post_order_type: postOrderType,
          floor: postOrderType === "DELIVERY_TO_TABLE" ? floor : null,
          table_number:
            postOrderType === "DELIVERY_TO_TABLE" ? table_number : null,
          conversation_id: chatId,
        },
      });

      order_id = order.id;

      // Buat Order Items satu per satu (Looping)
      // looping menghubungkan 'selected_options' (Relation)
      // createMany tidak mendukung 'connect' relation.
      await Promise.all(
        shopCart.items.map((item) =>
          tx.orderItem.create({
            data: {
              order_id: order.id,
              product_id: item.product_id,
              quantity: item.quantity,

              // HARGA SNAPSHOT
              price_at_add: item.price_at_add, // Harga Satuan Dasar
              subtotal: item.subtotal, // Total Kalkulasi (Qty * (Base + 1000 + Options))

              note: item.notes,

              // Hubungkan Opsi yang dipilih
              selected_options: {
                connect: item.selected_options.map((opt) => ({
                  id: opt.id,
                })),
              },
            },
          })
        )
      );

      // Link Order ke ShopCart (untuk menandai cart ini sudah jadi order)
      await tx.shopCart.update({
        where: {
          id: shopCart.id,
        },
        data: {
          order_id: order.id,
        },
      });

      // Kirim pesan otomatis
      const messageData = {
        senderId: customer_user_id,
        text: "Order masuk. Mohon konfirmasi apakah pesanan tersedia",
        type: "order",
        order_id,
        attachments: [],
        readBy: [customer_user_id],
        createdAt: FieldValue.serverTimestamp(),
      };

      revalidatePath("/keranjang/" + shopCart.id);

      await chatRef.collection("messages").add(messageData);
    });

    return successResponse(
      { conversation_id, order_id },
      "Berhasil memproses pesanan"
    );
  } catch (error) {
    console.error("Error processing shop cart:", error);
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
    const { shopCartId } = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product tidak ditemukan");
      }

      // Hitung Harga Opsi Tambahan (Additional Options)
      const selectedOptionsData = await tx.productOptionValue.findMany({
        where: {
          id: { in: selected_option_value_ids },
        },
        select: {
          additional_price: true,
        },
      });

      const totalOptionsPrice = selectedOptionsData.reduce(
        (sum, opt) => sum + (opt.additional_price || 0),
        0
      );

      // Hitung Subtotal Item
      // Qty * (Harga Produk + 1000 Komisi + Harga Opsi)
      const itemSubtotal =
        quantity * (product.price + 1000 + totalOptionsPrice);

      // Cari shop cart
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
            total_price: 0,
          },
        });
      }

      // Buat CartItem dengan field 'subtotal'
      await tx.cartItem.create({
        data: {
          product_id: productId,
          shop_cart_id: shopCart.id,
          quantity,
          price_at_add: product.price,
          subtotal: itemSubtotal,
          selected_options: {
            connect: selected_option_value_ids.map((id) => ({ id })),
          },
        },
      });

      // Update Total Harga ShopCart
      const aggregate = await tx.cartItem.aggregate({
        where: {
          shop_cart_id: shopCart.id,
        },
        _sum: {
          subtotal: true,
        },
      });

      await tx.shopCart.update({
        where: { id: shopCart.id },
        data: {
          total_price: aggregate._sum.subtotal || 0,
        },
      });

      return { shopCartId: shopCart.id };
    });

    if (!shopCartId) {
      return errorResponse("Gagal tambah ke keranjang");
    }

    return successResponse({ shopCartId }, "Berhasil tambah ke keranjang");
  } catch (error) {
    console.error("Error addToCart:", error);
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

      // Hitung ulang total harga ShopCart menggunakan AGGREGATE
      const aggregate = await tx.cartItem.aggregate({
        where: {
          shop_cart_id: cartItem.shop_cart_id,
        },
        _sum: {
          subtotal: true, // Jumlahkan field subtotal
        },
      });

      // Update Total Harga Shop Cart
      await tx.shopCart.update({
        where: { id: cartItem.shop_cart_id },
        data: { total_price: aggregate._sum.subtotal || 0 },
      });

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
  selected_option_value_ids,
}: {
  id: string;
  quantity: number;
  notes: string | null;
  selected_option_value_ids?: string[];
}): Promise<ServerActionReturn<void>> {
  try {
    if (quantity < 1) {
      return errorResponse("Jumlah harus lebih besar dari 0");
    }

    const shopCartId = await prisma.$transaction(async (tx) => {
      // Jika ada perubahan opsi, update relasinya dulu
      if (selected_option_value_ids) {
        await tx.cartItem.update({
          where: { id },
          data: {
            selected_options: {
              set: [], // Lepas semua opsi lama
              connect: selected_option_value_ids.map((optId) => ({
                id: optId,
              })), // Pasang opsi baru
            },
          },
        });
      }

      // Ambil Data Item Terbaru (termasuk opsi yang baru diupdate)
      const cartItem = await tx.cartItem.findUnique({
        where: { id },
        include: {
          selected_options: {
            select: {
              additional_price: true,
            },
          },
        },
      });

      if (!cartItem) {
        throw new Error("Item keranjang tidak ditemukan");
      }

      // Hitung Total Harga Opsi (Per Unit)
      const totalOptionsPrice = cartItem.selected_options.reduce(
        (sum, opt) => sum + (opt.additional_price || 0),
        0
      );

      // Qty * (Base Price + 1000 + Options Price)
      const newSubtotal =
        quantity * (cartItem.price_at_add + 1000 + totalOptionsPrice);

      await tx.cartItem.update({
        where: { id },
        data: {
          quantity,
          notes,
          subtotal: newSubtotal,
        },
      });

      const aggregate = await tx.cartItem.aggregate({
        where: { shop_cart_id: cartItem.shop_cart_id },
        _sum: { subtotal: true },
      });

      await tx.shopCart.update({
        where: { id: cartItem.shop_cart_id },
        data: { total_price: aggregate._sum.subtotal || 0 },
      });

      return cartItem.shop_cart_id;
    });

    revalidatePath("/dashboard-pelanggan/keranjang/" + shopCartId);

    return successResponse(undefined, "Sukses menyimpan perubahan");
  } catch (error) {
    console.error("Error in changeCartItemDetails:", error);
    return errorResponse("Gagal menyimpan perubahan");
  }
}

export async function removeCartItemOption(
  cart_item_id: string,
  option_value_id: string
): Promise<ServerActionReturn<void>> {
  try {
    const shopCartId = await prisma.$transaction(async (tx) => {
      // Lepaskan hubungan opsi dari item
      await tx.cartItem.update({
        where: { id: cart_item_id },
        data: {
          selected_options: {
            disconnect: [{ id: option_value_id }],
          },
        },
      });

      // Ambil data item terbaru beserta sisa opsi yang masih ada
      const cartItem = await tx.cartItem.findUnique({
        where: { id: cart_item_id },
        include: {
          selected_options: {
            select: {
              additional_price: true,
            },
          },
        },
      });

      if (!cartItem) {
        throw new Error("Item keranjang tidak ditemukan");
      }

      // Hitung ulang subtotal berdasarkan total harga opsi yang tersisa
      const totalOptionsPrice = cartItem.selected_options.reduce(
        (sum, opt) => sum + (opt.additional_price || 0),
        0
      );

      // Qty * (Base Price + 1000 + Sisa Options Price)
      const newSubtotal =
        cartItem.quantity * (cartItem.price_at_add + 1000 + totalOptionsPrice);

      // Update subtotal di database
      await tx.cartItem.update({
        where: { id: cart_item_id },
        data: {
          subtotal: newSubtotal,
        },
      });

      // Update Total Harga ShopCart (Agregasi dari semua subtotal item)
      const aggregate = await tx.cartItem.aggregate({
        where: { shop_cart_id: cartItem.shop_cart_id },
        _sum: { subtotal: true },
      });

      await tx.shopCart.update({
        where: { id: cartItem.shop_cart_id },
        data: { total_price: aggregate._sum.subtotal || 0 },
      });

      return cartItem.shop_cart_id;
    });

    revalidatePath("/keranjang/" + shopCartId);

    return successResponse(undefined, "Berhasil menghapus opsi");
  } catch (error) {
    console.error("Error removing cart item option:", error);
    return errorResponse("Gagal menghapus opsi");
  }
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
