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
} from "@/generated/prisma";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { formatRupiah } from "@/helper/format-rupiah";
import { calculateItemCommission, calculateCommission } from "@/helper/pricing-helper";
import { orderQueue } from "@/lib/queue";
import { getPaymentTimeoutMinutes, getShopOrderAcceptanceTimeoutMinutes } from "@/lib/settings";

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

  const totalCartQty = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  let shopCartTotalPrice = 0;

  for (const item of items) {
    const totalOptionsPrice = item.selected_options.reduce(
      (sum: number, opt: any) => sum + (opt.additional_price || 0),
      0,
    );

    const itemCommission = calculateItemCommission(
      item.quantity,
      totalCartQty,
    );

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
  let conversation_id;
  let order_id;

  try {
    // 1. Ambil Data Awal (Gather data first)
    const shopCartData = await prisma.shopCart.findFirst({
      where: { id: shopCartId },
      select: {
        id: true,
        cart: {
          select: {
            customer_id: true,
            customer: {
              select: {
                user: { select: { name: true, avatar: true, username: true } },
                user_id: true,
                has_used_referral: true,
              },
            },
          },
        },
        total_price: true,
        shop: {
          select: {
            id: true,
            name: true,
            is_auto_accept: true,
            owner: {
              select: {
                user_id: true,
                user: { select: { name: true, avatar: true } },
              },
            },
          },
        },
        items: {
          select: {
            id: true,
            product_id: true,
            product: { select: { name: true } },
            note: true,
            price_at_add: true,
            quantity: true,
            subtotal: true,
            selected_options: { 
              select: { 
                id: true,
                additional_price: true 
              } 
            },
          },
        },
      },
    });

    if (!shopCartData) return errorResponse("Keranjang kedai tidak ditemukan");

    // Skema voucher yang hanya memotong harga menu (tidak memotong komisi)
    const ITEM_ONLY_DISCOUNT_CODES = ["EVENT_REWARD_VOUCHER"];

    const totalQty = shopCartData.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalCommission = calculateCommission(totalQty);
    const itemsOnlyTotal = shopCartData.total_price - totalCommission;

    const customer = shopCartData.cart.customer;
    const isGuest = !customer.user.username; // Guest has no username in this system

    // Validasi Referral
    if (referralCode) {
      if (isGuest) {
        return errorResponse("Pengguna tamu tidak dapat menggunakan kode referral");
      }

      if (customer.has_used_referral) {
        return errorResponse("Anda sudah pernah menggunakan kode referral sebelumnya");
      }
    }

    // Validasi Voucher (Guest tidak boleh pakai voucher)
    if (appliedCustomerDiscountIds && appliedCustomerDiscountIds.length > 0) {
      if (isGuest) {
        return errorResponse("Pengguna tamu tidak dapat menggunakan voucher");
      }
    }

    const customer_user_id = shopCartData.cart.customer.user_id;
    const owner_user_id = shopCartData.shop.owner.user_id;
    const chatId = `${customer_user_id}_${owner_user_id}`;
    conversation_id = chatId;

    // 2. Transaksi Database Saja (Prisma Only)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Hitung Diskon & Handle Referral
      let total_discount_amount = 0;
      const appliedDiscountsData: {
        name: string;
        amount: number;
        discount_id?: string;
      }[] = [];

      if (appliedCustomerDiscountIds && appliedCustomerDiscountIds.length > 0) {
        const vouchers = await tx.customerDiscount.findMany({
          where: {
            id: { in: appliedCustomerDiscountIds },
            customer_id: shopCartData.cart.customer_id,
            is_used: false,
          },
          include: { discount: true },
        });

        for (const v of vouchers) {
          const isItemOnly = v.discount.code && ITEM_ONLY_DISCOUNT_CODES.includes(v.discount.code);
          const discountBase = isItemOnly ? itemsOnlyTotal : shopCartData.total_price;

          let amount = 0;
          if (v.discount.type === DiscountType.FIXED) {
            amount = v.discount.value;
          } else {
            amount = (discountBase * v.discount.value) / 100;
            if (v.discount.max_discount && amount > v.discount.max_discount) {
              amount = v.discount.max_discount;
            }
          }

          if (
            v.discount.min_purchase &&
            shopCartData.total_price < v.discount.min_purchase
          )
            continue;
          if (v.discount.shop_id && v.discount.shop_id !== shopCartData.shop.id)
            continue;

          // Jika item-only, pastikan tidak memotong melebihi harga menu
          if (isItemOnly && amount > itemsOnlyTotal) {
            amount = itemsOnlyTotal;
          }

          total_discount_amount += amount;
          appliedDiscountsData.push({
            name: v.discount.name,
            amount: amount,
            discount_id: v.discount.id,
          });

          await tx.customerDiscount.update({
            where: { id: v.id },
            data: { is_used: true, used_at: new Date() },
          });
        }
      }

      let initialStatus: OrderStatus = "PENDING_CONFIRMATION";
      if (shopCartData.shop.is_auto_accept) {
        initialStatus =
          paymentMethod === "CASH"
            ? "WAITING_SHOP_CONFIRMATION"
            : "WAITING_PAYMENT";
      }

      const order = await tx.order.create({
        data: {
          shop_id: shopCartData.shop.id,
          customer_id: shopCartData.cart.customer_id,
          payment_method: paymentMethod,
          status: initialStatus,
          confirmed_at: shopCartData.shop.is_auto_accept ? new Date() : null,
          total_price: shopCartData.total_price - total_discount_amount,
          total_discount_amount,
          post_order_type: postOrderType,
          note,
          floor: postOrderType === "DELIVERY_TO_TABLE" ? floor : null,
          table_number:
            postOrderType === "DELIVERY_TO_TABLE" ? table_number : null,
          conversation_id: chatId,
          referral_code_used: referralCode,
          applied_discounts: {
            create: appliedDiscountsData.map((d) => ({
              name: d.name,
              amount: d.amount,
              discount_id: d.discount_id,
            })),
          },
        },
      });

      await Promise.all(
        shopCartData.items.map((item) =>
          tx.orderItem.create({
            data: {
              order_id: order.id,
              product_id: item.product_id,
              quantity: item.quantity,
              price_at_add: item.price_at_add,
              subtotal: item.subtotal,
              note: item.note,
              selected_options: {
                connect: item.selected_options.map((opt) => ({ id: opt.id })),
              },
            },
          }),
        ),
      );

      await tx.shopCart.update({
        where: { id: shopCartId },
        data: { order_id: order.id },
      });

      return {
        order_id: order.id,
        total_price: order.total_price,
        status: order.status,
      };
    });

    order_id = result.order_id;

    // Trigger BullMQ untuk auto-cancel jika is_auto_accept aktif
    if (shopCartData.shop.is_auto_accept) {
      const timeoutMinutes = await getPaymentTimeoutMinutes();
      try {
        await orderQueue.add(
          "cancel-unpaid-order",
          { orderId: order_id },
          {
            delay: (timeoutMinutes * 60 * 1000) + 15000,
            jobId: order_id,
            removeOnComplete: true,
            removeOnFail: true,
          },
        );
      } catch (queueError) {
        console.error("Failed to add job to orderQueue in processShopCart:", queueError);
      }
    } else {
      // Jika auto-accept tidak aktif, tambahkan job untuk otomatis tolak pesanan jika kedai tidak merespons
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

    // 3. Update Firestore (After Commit)
    const chatRef = adminDb.collection("chats").doc(chatId);
    const chatSnap = await chatRef.get();

    let chatMessage = "Order masuk. Mohon konfirmasi apakah pesanan tersedia";
    let notificationBody = `Pesanan ${shopCartData.items.length} item oleh ${
      shopCartData.cart.customer.user.name
    } dengan total ${formatRupiah(result.total_price)}, tolong segera ditinjau`;

    if (shopCartData.shop.is_auto_accept) {
      if (paymentMethod === "CASH") {
        chatMessage =
          "Pesanan otomatis diterima! Silakan lakukan pembayaran tunai di kedai.";
        notificationBody = `Pesanan otomatis diterima. ${
          shopCartData.cart.customer.user.name
        } akan membayar tunai sebesar ${formatRupiah(result.total_price)}`;
      } else {
        chatMessage =
          "Pesanan otomatis diterima! Silakan upload bukti pembayaran agar pesanan segera diproses.";
        notificationBody = `Pesanan otomatis diterima. Menunggu bukti pembayaran dari ${
          shopCartData.cart.customer.user.name
        } sebesar ${formatRupiah(result.total_price)}`;
      }
    }

    const chatMetadata = {
      lastMessage: chatMessage,
      lastMessageAt: FieldValue.serverTimestamp(),
      lastMessageType: "ORDER",
      lastMessageSenderId: customer_user_id,
    };

    if (!chatSnap.exists) {
      await chatRef.set({
        id: chatId,
        participantsInfo: {
          [customer_user_id]: {
            name: shopCartData.cart.customer.user.name,
            avatar: shopCartData.cart.customer.user.avatar,
            role: "CUSTOMER",
          },
          [owner_user_id]: {
            name: shopCartData.shop.owner.user.name,
            avatar: shopCartData.shop.owner.user.avatar,
            role: "SHOP_OWNER",
          },
        },
        participantIds: [customer_user_id, owner_user_id],
        unreadCounts: { [customer_user_id]: 0, [owner_user_id]: 1 },
        ...chatMetadata,
      });
    } else {
      await chatRef.update({
        ...chatMetadata,
        [`unreadCounts.${owner_user_id}`]: FieldValue.increment(1),
      });
    }

    await Promise.all([
      chatRef.collection("messages").add({
        senderId: customer_user_id,
        text: chatMessage,
        type: "ORDER",
        order_id,
        attachments: [],
        readBy: [customer_user_id],
        createdAt: FieldValue.serverTimestamp(),
      }),
      adminDb.collection("orders").doc(order_id).set({
        id: order_id,
        lastUpdatedAt: FieldValue.serverTimestamp(),
        shopId: shopCartData.shop.id,
        status: result.status,
        customerName: shopCartData.cart.customer.user.name,
        totalPrice: result.total_price,
        items: shopCartData.items.map((item) => ({
          name: item.product.name,
          price: item.price_at_add,
          quantity: item.quantity,
          subtotal: item.subtotal,
          note: item.note,
        })),
      }),
      adminDb.collection("notifications").doc(order_id).set({
        recipientId: owner_user_id,
        type: "ORDER",
        subType: shopCartData.shop.is_auto_accept ? "ACCEPTED" : "CREATED",
        resourcePath: "/dashboard-kedai/order/" + order_id,
        createdAt: FieldValue.serverTimestamp(),
        isRead: false,
        title: shopCartData.shop.is_auto_accept
          ? "Pesanan Baru Diterima"
          : "Pesanan Baru Masuk",
        body: notificationBody,
        intent: shopCartData.shop.is_auto_accept ? "SUCCESS" : "INFO",
        senderInfo: {
          name: shopCartData.cart.customer.user.name,
          avatar: shopCartData.cart.customer.user.avatar,
        },
        metadata: {
          orderId: order_id,
          itemCount: shopCartData.items.length,
          totalPrice: result.total_price,
        },
      }),
    ]);

    revalidatePath("/keranjang/" + shopCartId);

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

    revalidatePath("/kedai/" + shopId);
    revalidatePath("/keranjang/" + shopCartId);

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

      revalidatePath("/keranjang/" + cartItem.shop_cart_id);
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

    revalidatePath("/keranjang/" + shopCartId);

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
