"use server";

import {
  errorResponse,
  ServerActionReturn,
  successResponse,
} from "@/helper/action-helper";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AddCartItemNoteInput } from "../types/cart-schema";
import {
  PaymentMethod,
  PostOrderType,
  RewardType,
  DiscountType,
  OrderStatus,
} from "@prisma/client";
import {
  publishRealtime,
  createAndPublishNotification,
} from "@/lib/realtime/publish-internal";
import { formatRupiah } from "@/helper/format-rupiah";
import { calculateItemCommission } from "@/helper/pricing-helper";
import { orderQueue } from "@/lib/queue";
import {
  getPaymentTimeoutMinutes,
  getShopOrderAcceptanceTimeoutMinutes,
} from "@/lib/settings";

/**
 * Helper internal untuk menghitung ulang semua subtotal item dan total harga keranjang
 * berdasarkan skema komisi bertingkat ( tiered commission ).
 */
async function recalculateShopCart(tx: any, shopCartId: string) {
  const items = await tx.cartItem.findMany({
    where: { shop_cart_id: shopCartId },
    include: {
      selected_options: {
        select: {
          additional_price: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  const totalCartQty = items.reduce(
    (sum: number, item: any) => sum + item.quantity,
    0,
  );
  let shopCartTotalPrice = 0;

  for (const item of items) {
    const totalOptionsPrice = item.selected_options.reduce(
      (sum: number, opt: any) => sum + (opt.additional_price || 0),
      0,
    );

    const itemCommission = calculateItemCommission(item.quantity, totalCartQty);

    const newItemSubtotal =
      item.quantity * (item.price_at_add + totalOptionsPrice) + itemCommission;

    await tx.cartItem.update({
      where: { id: item.id },
      data: { subtotal: newItemSubtotal },
    });

    shopCartTotalPrice += newItemSubtotal;
  }

  await tx.shopCart.update({
    where: { id: shopCartId },
    data: { total_price: shopCartTotalPrice },
  });

  return shopCartTotalPrice;
}

export async function processShopCart({
  shopCartId,
  paymentMethod,
  postOrderType,
  floor,
  table_number,
  note,
  referralCode,
  appliedCustomerDiscountIds,
}: {
  shopCartId: string;
  paymentMethod: PaymentMethod;
  postOrderType: PostOrderType;
  floor: number | null;
  table_number: number | null;
  note?: string;
  referralCode?: string;
  appliedCustomerDiscountIds?: string[];
}): Promise<
  ServerActionReturn<{ conversation_id?: string; order_id?: string }>
> {
  let conversation_id: string | undefined;
  let order_id: string | undefined;
  let customer_user_id: string | undefined;
  let owner_user_id: string | undefined;
  let chatMessage = "Order masuk. Mohon konfirmasi apakah pesanan tersedia";
  let notificationBody: string | undefined;
  let shopCartItemsCount = 0;
  let shopCartItemsSubtotal = 0;
  let isAutoAccept = false;
  let shopId = "";

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
          note: true,
          payment_method: true,
          order_id: true,
          shop: {
            select: {
              id: true,
              name: true,
              owner_id: true,
              is_auto_accept: true,
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
              note: true,
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
      customer_user_id = shopCart.cart.customer.user_id;
      owner_user_id = shopCart.shop.owner.user_id;
      shopId = shopCart.shop.id;
      isAutoAccept = shopCart.shop.is_auto_accept;
      shopCartItemsCount = shopCart.items.length;
      shopCartItemsSubtotal = shopCart.items.reduce(
        (acc: number, item: any) => acc + item.subtotal,
        0,
      );

      // Handle Conversation (Chat)
      const [participant_one_id, participant_two_id] =
        customer_user_id < owner_user_id
          ? [customer_user_id, owner_user_id]
          : [owner_user_id, customer_user_id];

      const existingChat = await tx.chat.findFirst({
        where: {
          participant_one_id,
          participant_two_id,
          type: "CUSTOMER_OWNER",
        },
      });

      if (!existingChat) {
        const createdChat = await tx.chat.create({
          data: {
            participant_one_id,
            participant_two_id,
            type: "CUSTOMER_OWNER",
            last_message:
              "Order masuk, Mohon konfirmasi apakah pesanan tersedia",
            last_message_type: "ORDER",
            last_message_sender_id: customer_user_id,
            last_message_at: new Date(),
            unread_counts: {
              [customer_user_id]: 0,
              [owner_user_id]: 1,
            },
          },
        });
        conversation_id = createdChat.id;
      } else {
        conversation_id = existingChat.id;
        await tx.chat.update({
          where: { id: existingChat.id },
          data: {
            last_message:
              "Order masuk, Mohon konfirmasi apakah pesanan tersedia",
            last_message_type: "ORDER",
            last_message_sender_id: customer_user_id,
            last_message_at: new Date(),
            unread_counts: {
              ...(existingChat.unread_counts as Record<string, number>),
              [owner_user_id]:
                ((existingChat.unread_counts as Record<string, number>)?.[
                  owner_user_id
                ] || 0) + 1,
            },
          },
        });
      }

      // 1. Hitung Diskon & Handle Referral
      let total_discount_amount = 0;
      const appliedDiscountsData: {
        name: string;
        amount: number;
        discount_id?: string;
      }[] = [];

      // Handle Vouchers (CustomerDiscount)
      if (appliedCustomerDiscountIds && appliedCustomerDiscountIds.length > 0) {
        const vouchers = await tx.customerDiscount.findMany({
          where: {
            id: { in: appliedCustomerDiscountIds },
            customer_id,
            is_used: false,
          },
          include: { discount: true },
        });

        for (const v of vouchers) {
          let amount = 0;
          if (v.discount.type === DiscountType.FIXED) {
            amount = v.discount.value;
          } else {
            amount = (shopCart.total_price * v.discount.value) / 100;
            if (v.discount.max_discount && amount > v.discount.max_discount) {
              amount = v.discount.max_discount;
            }
          }

          // Validasi Sederhana
          if (
            v.discount.min_purchase &&
            shopCart.total_price < v.discount.min_purchase
          )
            continue;
          if (v.discount.shop_id && v.discount.shop_id !== shopCart.shop.id)
            continue;

          total_discount_amount += amount;
          appliedDiscountsData.push({
            name: v.discount.name,
            amount: amount,
            discount_id: v.discount.id,
          });

          // Tandai sudah dipakai
          await tx.customerDiscount.update({
            where: { id: v.id },
            data: { is_used: true, used_at: new Date() },
          });
        }
      }

      // Tentukan Status Awal Order
      let initialStatus: OrderStatus = "PENDING_CONFIRMATION";
      chatMessage = "Order masuk. Mohon konfirmasi apakah pesanan tersedia";
      notificationBody = `Pesanan ${shopCart.items.length} item oleh ${
        shopCart.cart.customer.user.name
      } dengan total ${formatRupiah(
        shopCart.total_price - total_discount_amount,
      )}, tolong segera ditinjau`;

      if (shopCart.shop.is_auto_accept) {
        if (paymentMethod === "CASH") {
          initialStatus = "WAITING_SHOP_CONFIRMATION";
          chatMessage =
            "Pesanan otomatis diterima! Silakan lakukan pembayaran tunai di kedai.";
          notificationBody = `Pesanan otomatis diterima. ${
            shopCart.cart.customer.user.name
          } akan membayar tunai sebesar ${formatRupiah(
            shopCart.total_price - total_discount_amount,
          )}`;
        } else {
          initialStatus = "WAITING_PAYMENT";
          chatMessage =
            "Pesanan otomatis diterima! Silakan upload bukti pembayaran agar pesanan segera diproses.";
          notificationBody = `Pesanan otomatis diterima. Menunggu bukti pembayaran dari ${
            shopCart.cart.customer.user.name
          } sebesar ${formatRupiah(
            shopCart.total_price - total_discount_amount,
          )}`;
        }
      }

      // Buat Order Utama
      const order = await tx.order.create({
        data: {
          shop_id: shopCart.shop.id,
          customer_id,
          payment_method: paymentMethod,
          status: initialStatus,
          total_price: shopCart.total_price - total_discount_amount,
          total_discount_amount,
          post_order_type: postOrderType,
          note,
          floor: postOrderType === "DELIVERY_TO_TABLE" ? floor : null,
          table_number:
            postOrderType === "DELIVERY_TO_TABLE" ? table_number : null,
          conversation_id: conversation_id,
          referral_code_used: referralCode, // Catat kode referral untuk diproses saat bayar
          applied_discounts: {
            create: appliedDiscountsData.map((d) => ({
              name: d.name,
              amount: d.amount,
              discount_id: d.discount_id,
            })),
          },
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
              subtotal: item.subtotal, // Total Kalkulasi dengan Komisi Bertingkat

              note: item.note,

              // Hubungkan Opsi yang dipilih
              selected_options: {
                connect: item.selected_options.map((opt) => ({
                  id: opt.id,
                })),
              },
            },
          }),
        ),
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

      revalidatePath("/keranjang/" + shopCart.id);

      // Kirim pesan otomatis
      const msgId = crypto.randomUUID();
      await tx.message.create({
        data: {
          id: msgId,
          chat_id: conversation_id,
          sender_id: customer_user_id,
          text: chatMessage,
          type: "ORDER",
          order_id,
          attachments: [],
          read_by: [customer_user_id],
          created_at: new Date(),
        },
      });
    });

    // Publish WebSocket events after transaction completes
    if (conversation_id && order_id) {
      await publishRealtime(`chat:${conversation_id}`, {
        event: "chat:message",
        message: {
          id: crypto.randomUUID(),
          chat_id: conversation_id,
          sender_id: customer_user_id,
          text: chatMessage,
          type: "ORDER",
          order_id,
          attachments: [],
          read_by: [customer_user_id],
          created_at: new Date(),
        },
      });

      await publishRealtime(`order:${order_id}`, {
        event: "order:update",
        order: {
          id: order_id,
          status: isAutoAccept ? "ACCEPTED" : "CREATED",
        },
      });

      await publishRealtime(`shop:${shopId}`, {
        event: "shop:update",
        order: {
          id: order_id,
          status: isAutoAccept ? "ACCEPTED" : "CREATED",
        },
      });

      await createAndPublishNotification({
        recipient_id: owner_user_id || "",
        type: "ORDER",
        subtype: isAutoAccept ? "ACCEPTED" : "CREATED",
        title: isAutoAccept ? "Pesanan Baru Diterima" : "Pesanan Baru Masuk",
        body: notificationBody || "",
        data: {
          orderId: order_id,
          itemCount: shopCartItemsCount,
          totalPrice: shopCartItemsSubtotal,
          resourcePath: "/dashboard-kedai/chat/" + conversation_id,
        },
      });
    }

    // Schedule queue job for auto-cancellation or auto-rejection
    if (order_id) {
      if (isAutoAccept) {
        const timeoutMinutes = await getPaymentTimeoutMinutes();
        try {
          await orderQueue.add(
            "cancel-unpaid-order",
            { orderId: order_id },
            {
              delay: (timeoutMinutes * 60 * 1000) + 15000, // 15s grace buffer
              jobId: order_id,
              removeOnComplete: true,
              removeOnFail: true,
            },
          );
        } catch (queueError) {
          console.error("Failed to add cancel-unpaid-order job to orderQueue:", queueError);
        }
      } else {
        const timeoutMinutes = await getShopOrderAcceptanceTimeoutMinutes();
        try {
          await orderQueue.add(
            "auto-reject-unconfirmed-order",
            { orderId: order_id },
            {
              delay: timeoutMinutes * 60 * 1000,
              jobId: `auto-reject-${order_id}`,
              removeOnComplete: true,
              removeOnFail: true,
            },
          );
        } catch (queueError) {
          console.error("Failed to add auto-reject-unconfirmed-order job to orderQueue:", queueError);
        }
      }
    }

    return successResponse(
      { conversation_id, order_id },
      "Berhasil memproses pesanan",
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
        0,
      );

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

      // Buat CartItem dengan field 'subtotal' (sementara 0, akan diupdate oleh recalculateShopCart)
      await tx.cartItem.create({
        data: {
          product_id: productId,
          shop_cart_id: shopCart.id,
          quantity,
          price_at_add: product.price,
          subtotal: 0,
          selected_options: {
            connect: selected_option_value_ids.map((id) => ({ id })),
          },
        },
      });

      // Hitung ulang semua subtotal dan total harga di keranjang
      await recalculateShopCart(tx, shopCart.id);

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
  shop_cart_id: string,
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
  cart_item_id: string,
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

      // Hitung ulang semua subtotal dan total harga di keranjang
      await recalculateShopCart(tx, cartItem.shop_cart_id);

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
  note,
  selected_option_value_ids,
}: {
  id: string;
  quantity: number;
  note: string | null;
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

      await tx.cartItem.update({
        where: { id },
        data: {
          quantity,
          note,
        },
      });

      // Hitung ulang semua subtotal dan total harga di keranjang
      await recalculateShopCart(tx, cartItem.shop_cart_id);

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
  option_value_id: string,
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

      // Hitung ulang semua subtotal dan total harga di keranjang
      await recalculateShopCart(tx, cartItem.shop_cart_id);

      return cartItem.shop_cart_id;
    });

    revalidatePath("/keranjang/" + shopCartId);

    return successResponse(undefined, "Berhasil menghapus opsi");
  } catch (error) {
    console.error("Error removing cart item option:", error);
    return errorResponse("Gagal menghapus opsi");
  }
}

export async function addCartItemNote(
  payload: AddCartItemNoteInput,
): Promise<ServerActionReturn<void>> {
  try {
    await prisma.cartItem.update({
      where: {
        id: payload.cart_item_id,
      },
      data: {
        note: payload.note,
      },
    });

    return successResponse(undefined, "Sukses menyimpan catatan");
  } catch (error) {
    return errorResponse("Terjadi kesalahan");

    console.log(error);
  }
}
