"use client";

import { orderStatusMapping } from "@/constant/order-status-mapping";

import CustomBadge from "@/components/custom-badge";
import { OrderStatus } from "@/generated/prisma";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

import Image from "next/image";
import { paymentMethodMapping } from "@/constant/payment-method";
import { postOrderTypeMapping } from "@/constant/post-order-type-mapping";
import CustomerPositionBreadcrumb from "@/features/cart/ui/customer-position-breadcrumb";
import CancelOrderDialog from "./cancel-order-dialog";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatToHour } from "@/helper/hour-helper";
import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { GetCustomerOrderDetail } from "../types/order-queries-types";
import ShoppingCartExclamationIcon from "@/components/icons/shopping-cart-exclamation-icon";
import { CircleAlert, Copy, CopyCheck, Edit, StickyNote } from "lucide-react";
import NavButton from "@/components/nav-button";
import { getImageUrl } from "@/helper/get-image-url";
import CashIcon from "@/components/icons/cash-icon";

export default function CustomerOrderDetailClient({
  order,
}: {
  order: GetCustomerOrderDetail;
}) {
  const router = useRouter();

  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-2 mb-5">
      <div>
        <h1 className="font-semibold">Status</h1>

        <CustomBadge
          value={order.status}
          outlineValues={[
            OrderStatus.WAITING_SHOP_CONFIRMATION,
            OrderStatus.WAITING_PAYMENT,
            OrderStatus.PENDING_CONFIRMATION,
          ]}
          successValues={[OrderStatus.COMPLETED]}
          destructiveValues={[OrderStatus.CANCELLED, OrderStatus.REJECTED]}
        >
          {orderStatusMapping[order.status]}
        </CustomBadge>
      </div>

      {order.status === "REJECTED" && (
        <Alert variant={"destructive"}>
          <ShoppingCartExclamationIcon />
          <AlertTitle>Pesanan Ditolak</AlertTitle>
          <AlertDescription>{order.rejected_reason}</AlertDescription>
        </Alert>
      )}

      {order.status === "CANCELLED" &&
        order.cancelled_by_id === order.shop.owner_id && (
          <Alert variant={"destructive"}>
            <ShoppingCartExclamationIcon />
            <AlertTitle>Pesanan Dibatalkan Oleh Pemilik Kedai</AlertTitle>
            <AlertDescription>{order.cancelled_reason}</AlertDescription>
          </Alert>
        )}

      {order.status === "PAYMENT_REJECTED" && (
        <Alert variant={"destructive"}>
          <CircleAlert />
          <AlertTitle>Bukti Pembayaran Ditolak</AlertTitle>
          <AlertDescription>{order.rejected_reason}</AlertDescription>
        </Alert>
      )}

      {order.status === "WAITING_SHOP_CONFIRMATION" &&
        order.payment_method === "CASH" && (
          <Alert variant="default">
            <CashIcon />
            <AlertTitle>Silakan lakukan pembayaran di kedai</AlertTitle>
          </Alert>
        )}

      <div>
        <h1 className="font-semibold mb-1">Pesanan</h1>

        <div className="flex flex-col gap-2">
          {order.order_items.map((item, idx) => (
            <Item key={idx} variant={"outline"}>
              <ItemMedia variant={"image"}>
                <Image
                  src={getImageUrl(item.product.image_url)}
                  width={100}
                  height={100}
                  alt="product image"
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{item.product.name}</ItemTitle>
                <ItemDescription>{item.subtotal}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <h1 className="text-lg font-semibold mr-1">{item.quantity}x</h1>
              </ItemActions>
              {item.note && (
                <ItemFooter className="flex gap-2 justify-start">
                  <StickyNote className="w-4 h-4" />
                  <h1>{item.note}</h1>
                </ItemFooter>
              )}
            </Item>
          ))}
        </div>
      </div>

      <div>
        <h1 className="font-semibold">Total Harga</h1>
        <h1>{order.total_price}</h1>
      </div>

      {order.estimation && (
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="font-semibold">Estimasi</h1>
            <h1>{order.estimation} Menit</h1>
          </div>

          {order.status === "PROCESSING" && (
            <>
              <div>
                <h1 className="font-semibold">Diproses Pada</h1>
                <h1>{formatToHour(order.processed_at)}</h1>
              </div>

              <div>
                <h1 className="font-semibold">Sisa Waktu</h1>
                {/* <OrderEstimationCountDown
                  estimation={order.estimation}
                  processed_at={order.processed_at}
                /> */}
              </div>
            </>
          )}
        </div>
      )}

      <div>
        <h1 className="font-semibold">Metode Pembayaran</h1>
        <h1>{paymentMethodMapping[order.payment_method]}</h1>
      </div>

      {order.status === "WAITING_PAYMENT" &&
        order.payment_method === "BANK_TRANSFER" && (
          <div>
            <h1 className="font-semibold">Nomor Rekening</h1>

            <div className="flex gap-2 items-center">
              <h1>
                {
                  order.shop.payments.filter(
                    (payment) => payment.method === "BANK_TRANSFER"
                  )[0].account_number
                }
              </h1>

              <button
                onClick={() => {
                  const bankTransferPayment = order.shop.payments.filter(
                    (payment) => payment.method === "BANK_TRANSFER"
                  )[0]; // Ambil elemen pertama, bisa jadi undefined

                  const accountNumber =
                    bankTransferPayment?.account_number?.toString();

                  if (accountNumber) {
                    navigator.clipboard.writeText(accountNumber);
                    setCopied(true);
                  } else {
                    console.error("Nomor akun BANK_TRANSFER tidak ditemukan.");
                  }
                }}
              >
                {copied ? (
                  <CopyCheck className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

      {order.status === "WAITING_PAYMENT" &&
        order.payment_method === "QRIS" && (
          <div>
            <h1 className="font-semibold">QRCode QRIS</h1>
            <div>
              {order.shop.payments
                .filter((p) => p.method === "QRIS")
                .map((payment, idx) => {
                  if (!payment.qr_url) {
                    return <div>Belum ada qr code</div>;
                  }

                  return <img key={idx} src={getImageUrl(payment.qr_url)} />;
                })}
            </div>
          </div>
        )}

      {/* {order.payment_method !== "CASH" &&
        ["WAITING_PAYMENT", "WAITING_SHOP_CONFIRMATION"].includes(
          order.status
        ) && (
          <div>
            <h1 className="font-semibold mb-1">Bukti Pembayaran</h1>

            {!order.payment_proof_url ? (
              <SendPaymentProofForm
                order_id={order.id}
                conversation_id={order.conversation_id}
                customer_id={order.customer_id}
              />
            ) : (
              <img
                src={"/uploads/payment-proof/" + order.payment_proof_url}
                width={400}
                height={300}
                alt="payment proof"
              />
            )}
          </div>
        )} */}

      {/* {order.status === "PAYMENT_REJECTED" && (
        <div>
          <h1 className="font-semibold mb-1">Kirim Ulang Bukti Pembayaran</h1>

          <SendPaymentProofForm
            order_id={order.id}
            conversation_id={order.conversation_id}
            customer_id={order.customer_id}
          />
        </div>
      )} */}

      <div>
        <h1 className="font-semibold">Jenis Order</h1>
        <div className="p-4 flex flex-col gap-1 rounded-lg border mt-1">
          {order.post_order_type === "DELIVERY_TO_TABLE" &&
          order.customer &&
          order.customer.floor &&
          order.customer.table_number ? (
            <div>
              <h1 className="font-medium">
                {postOrderTypeMapping[order.post_order_type]}
              </h1>

              <CustomerPositionBreadcrumb
                canteen_name={order.shop.canteen.name}
                floor={order.customer.floor}
                table_number={order.customer.table_number}
              />
              <div className="mt-1">
                <NavButton
                  href={`/dashboard-pelanggan/kantin/${order.shop.canteen.slug}/pilih-meja`}
                  size="sm"
                >
                  <Edit />
                  Pilih Ulang
                </NavButton>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="font-medium">
                {postOrderTypeMapping[order.post_order_type]}
              </h1>

              <h1 className="text-sm text-muted-foreground">
                Pesanan diambil di kedai
              </h1>
            </div>
          )}
        </div>
      </div>

      {![
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
        "WAITING_CUSTOMER_ESTIMATION_CONFIRMATION",
      ].includes(order.status) && (
        <CancelOrderDialog
          order_id={order.id}
          user_id={order.customer_id}
          order_status={order.status}
        />
      )}

      {/* {order.status !== "COMPLETED" && (
        <div>
          <h1 className="font-semibold">Konfirmasi Order</h1>
          <h1 className="text-muted-foreground">
            Pilih terima atau tolak pesanan ini, pastikan stok atau bahan
            tersedia.
          </h1>

          <div className="grid grid-cols-2 mt-2 gap-4">
            <Button size={"lg"} variant={"destructive"}>
              Tolak
            </Button>
            
          </div>
        </div>
      )} */}
    </div>
  );
}
