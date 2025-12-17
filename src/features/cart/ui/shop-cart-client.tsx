"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import { PaymentMethod, PostOrderType } from "@/generated/prisma";
import { useMutation } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { notificationDialog } from "@/hooks/use-notification-dialog";
import { formatRupiah } from "@/helper/format-rupiah";
import SnkCheckoutDialog from "@/features/cart/ui/snk-checkout-dialog";
import CartItemCard from "@/features/cart/ui/cart-item-card";
import PostOrderTypeTab from "@/features/cart/ui/post-order-type-tab";
import { processShopCart } from "@/features/cart/lib/cart-actions";
import ShopCartPaymentMethod from "@/features/cart/ui/shop-cart-payment-method";
import NavButton from "@/components/nav-button";
import { GetShopCartType } from "../types/cart-queries-types";
import { GetCustomerProfileType } from "@/features/user/types/user-queries-types";
import { GuestDetailsFormDialog } from "./guest-details-form-dialog";

export default function ShopCartClient({
  userId,
  shopCart,
  customerProfile,
  ableToCheckout,
  open_time,
  close_time,
}: {
  userId: string;
  shopCart: GetShopCartType;
  customerProfile: GetCustomerProfileType;
  ableToCheckout: boolean;
  open_time: Date | null;
  close_time: Date | null;
}) {
  const [showSnk, setShowSnk] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    shopCart.payment_method
  );

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [checkouted, setCheckouted] = useState(false);
  const [showGuestDetailsFormDialog, setShowGuestDetailsFormDialog] =
    useState(false);

  const [postOrderType, setPostOrderType] = useState<PostOrderType>(
    shopCart.post_order_type
  );

  function handleClickCheckout() {
    setShowGuestDetailsFormDialog(true);
  }

  function saveGuestDetails() {
    setShowSnk(true);
  }

  const mutations = useMutation({
    mutationFn: async () => {
      return await processShopCart({
        shopCartId: shopCart.id,
        paymentMethod,
        postOrderType,
        floor: customerProfile.floor,
        table_number: customerProfile.table_number,
      });
    },
    onSuccess(data) {
      if (data.success) {
        setShowSnk(false);

        notificationDialog.success({
          title: "Sukses checkout keranjang",
          message: "Order berhasil dicatat",
          actionButtons: (
            <>
              <Button
                onClick={notificationDialog.hide}
                variant={"outline"}
                asChild
              >
                <Link
                  href={"/dashboard-pelanggan/order/" + data.data?.order_id}
                >
                  Lihat Detail Order
                </Link>
              </Button>
              <Button
                variant="default"
                onClick={notificationDialog.hide}
                asChild
              >
                <Link href={"/chat/" + data.data?.conversation_id}>
                  Hubungi Pemilik Kedai
                </Link>
              </Button>
            </>
          ),
        });
      } else {
        notificationDialog.error({
          title: "Gagal checkout keranjang",
          message: data.error.message,
        });
      }
    },
  });

  useEffect(() => {
    if (checkouted) {
      mutations.mutateAsync();
    }
  }, [checkouted]);

  return (
    <div className="flex flex-col gap-4">
      {/* <Card>
        <CardContent>
          <div className="flex  gap-1 items-center justify-between">
            <h1 className="font-semibold text-lg">{shopCart.shop.name}</h1>
          </div>

          {open_time && close_time && (
            <div>
              <h1 className="mt-2">Jam Operasional</h1>

              <h1 className="text-muted-foreground">
                {formatToHour(open_time)} - {formatToHour(close_time)}
              </h1>
            </div>
          )}
        </CardContent>
      </Card> */}

      <div className="">
        <h1 className="font-semibold mb-2">Daftar Pesanan</h1>

        <div className="flex flex-col gap-2">
          {shopCart.items.map((item, idx) => (
            <CartItemCard
              cartItem={item}
              disabled={shopCart.order_id !== null}
              disabledDeleteButton={shopCart.items.length === 1}
              cartItemDetailUrl={`/keranjang/${shopCart.id}/${item.id}`}
              key={idx}
            />
          ))}
        </div>
      </div>

      {shopCart.order_id === null && (
        <div className="flex justify-between ">
          <div>
            <h1 className="font-semibold">Ada lagi yang mau dibeli?</h1>
            <h1 className="text-muted-foreground text-sm">
              Masih bisa tambah menu lain
            </h1>
          </div>

          <NavButton href={`/kedai/${shopCart.shop.id}`} variant={"outline"}>
            Tambah
          </NavButton>
        </div>
      )}

      <ShopCartPaymentMethod
        shopPayments={shopCart.shop.payments}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        disabled={shopCart.order_id !== null}
      />

      <PostOrderTypeTab
        canteen_name={shopCart.shop.canteen.name}
        customerProfile={customerProfile}
        postOrderType={postOrderType}
        setPostOrderType={setPostOrderType}
        selectTablePageUrl={`/kantin/${shopCart.shop.canteen_id}/pilih-meja`}
      />

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center text-muted-foreground">
          <h1>Biaya Tambahan</h1>

          <h1>1000</h1>
        </div>

        <div className="flex justify-between items-center text-muted-foreground">
          <h1>Total Biaya Tambahan</h1>

          <h1>
            {shopCart.items.reduce((sum, item) => sum + item.quantity, 0) *
              1000}
          </h1>
        </div>

        <div className="flex font-semibold justify-between items-center text-muted-foreground">
          <h1>
            Subtotal{" "}
            {shopCart.items.reduce((sum, item) => sum + item.quantity, 0)} Item
          </h1>

          <h1>{formatRupiah(shopCart.total_price)}</h1>
        </div>
      </div>

      {shopCart.order_id !== null && (
        <div className="grid grid-cols-2 gap-4">
          <Button className="py-6" size={"lg"} asChild>
            <Link href={"/order/" + shopCart.order_id}>Lihat Detail Order</Link>
          </Button>

          <Button className="py-6" size={"lg"} asChild>
            <Link
              href={
                "/chat/" +
                `${customerProfile.user_id}_${shopCart.shop.owner_id}`
              }
            >
              Hubungi Pemilik Kedai
            </Link>
          </Button>
        </div>
      )}

      {shopCart.order_id === null && (
        <Button
          className="w-full bg-linear-to-t from-primary to-primary/80 border border-primary flex justify-between py-6 items-center"
          size={"lg"}
          onClick={handleClickCheckout}
          disabled={customerProfile.suspend_until !== null || !ableToCheckout}
        >
          <h1>{shopCart.items.length} Item</h1>

          <div className="flex gap-2 h-4">
            <h1>Rp {shopCart.total_price}</h1>

            <Separator orientation="vertical" />

            <h1 className="font-semibold">Checkout</h1>
          </div>
        </Button>
      )}

      <GuestDetailsFormDialog
        userId={userId}
        setShowGuestDetailsFormDialog={setShowGuestDetailsFormDialog}
        showGuestDetailsFormDialog={showGuestDetailsFormDialog}
        saveGuestDetails={saveGuestDetails}
      />

      <SnkCheckoutDialog
        showSnk={showSnk}
        setShowSnk={setShowSnk}
        setCheckouted={setCheckouted}
        isCheckoutPending={mutations.isPending}
      />
    </div>
  );
}
