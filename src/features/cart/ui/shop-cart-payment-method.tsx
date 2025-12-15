import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import {
  paymentMethodIconMapping,
  paymentMethodMapping,
} from "@/constant/payment-method";
import { toast } from "sonner";
import { PaymentMethod } from "@/generated/prisma";
import { GetCustomerShopCartAvaillablePaymentsType } from "../types/cart-queries-types";

export default function ShopCartPaymentMethod({
  shopPayments,
  paymentMethod,
  setPaymentMethod,
  disabled,
}: {
  shopPayments: GetCustomerShopCartAvaillablePaymentsType;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <h1 className="font-semibold mb-2">Pilih Metode Pembayaran</h1>

      <div className="flex flex-col gap-3">
        {shopPayments.map((payment, idx) => (
          <Item
            onClick={() => {
              if (disabled) {
                toast.info("Keranjang telah dicheckout");
              } else {
                setPaymentMethod(payment.method);
              }
            }}
            key={idx}
            variant={"outline"}
            className={`cursor-pointer ${
              payment.method === paymentMethod
                ? "bg-primary text-primary-foreground"
                : ""
            }`}
          >
            <ItemMedia>{paymentMethodIconMapping[payment.method]}</ItemMedia>
            <ItemContent>
              <ItemTitle>{paymentMethodMapping[payment.method]}</ItemTitle>
            </ItemContent>
          </Item>
        ))}
      </div>
    </div>
  );
}
