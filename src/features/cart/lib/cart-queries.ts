"use server";

import { prisma } from "@/lib/prisma";

export async function getCart(cart_id: string) {
  return await prisma.cart.findFirst({
    where: {
      id: cart_id,
    },
    include: {
      shop_carts: {
        orderBy: {
          created_at: "desc",
        },
        select: {
          id: true,
          created_at: true,
          shop: {
            select: {
              id: true,
              image_url: true,
              name: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      },
    },
  });
}

export async function getShopCart({
  cart_id,
  shop_cart_id,
}: {
  shop_cart_id: string;
  cart_id: string;
}) {
  return await prisma.shopCart.findFirst({
    where: {
      id: shop_cart_id,
      cart_id,
    },
    select: {
      id: true,
      cart: {
        select: {
          id: true,
          customer_id: true,
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
          status: true,
          open_time: true,
          close_time: true,
          canteen_id: true,
          canteen: {
            select: {
              name: true,
            },
          },
          owner_id: true,
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
              options: {
                include: {
                  values: true,
                },
              },
            },
          },
          selected_options: {
            select: {
              id: true,
              value: true,
              additional_price: true,
              product_option: {
                select: {
                  option: true,
                  type: true,
                },
              },
            },
          },
          id: true,
          notes: true,
          price_at_add: true,
          quantity: true,
          subtotal: true,
        },
      },
    },
  });
}

export async function getExistingPendingShopCart({
  cart_id,
  shop_id,
}: {
  cart_id: string;
  shop_id: string;
}) {
  return await prisma.shopCart.findFirst({
    where: {
      cart_id,
      shop_id,
      order_id: null,
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  });
}

export async function getCartItem(id: string) {
  return await prisma.cartItem.findUnique({
    where: {
      id,
    },
    select: {
      product: {
        select: {
          id: true,
          name: true,
          image_url: true,
          options: {
            include: {
              values: true,
            },
          },
        },
      },
      selected_options: {
        select: {
          id: true,
          value: true,
          additional_price: true,
          product_option: {
            select: {
              option: true,
              type: true,
            },
          },
        },
      },
      id: true,
      notes: true,
      price_at_add: true,
      quantity: true,
      subtotal: true,
    },
  });
}
