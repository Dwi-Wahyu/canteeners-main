import TopbarWithBackButton from "@/components/layouts/topbar-with-backbutton";
import { auth } from "@/config/auth";
import { redirect } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, DollarSign, QrCode } from "lucide-react";
import NotFoundResource from "@/components/pages/not-found-resource";
import BankTransferPayment from "@/features/shop/settings/payment/ui/bank-transfer-payment";
import PaymentMethodExplanationDialog from "@/features/shop/settings/payment/ui/payment-method-explanation-dialog";
import QrisShopPayment from "@/features/shop/settings/payment/ui/qris-shop-payment";
import CashShopPayment from "@/features/shop/settings/payment/ui/cash-shop-payment";
import CashIcon from "@/components/icons/cash-icon";

const tabs = [
  {
    name: "Tunai",
    value: "CASH",
    icon: CashIcon,
  },
  {
    name: "QRIS",
    value: "QRIS",
    icon: QrCode,
  },
  {
    name: "Transfer Bank",
    value: "BANK_TRANSFER",
    icon: CreditCard,
  },
];

export default async function ShopPaymentMethodPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  if (!session.user.shopId) {
    return <NotFoundResource />;
  }

  return (
    <div className="pt-16">
      <TopbarWithBackButton
        title="Metode Pembayaran"
        backUrl="/dashboard-kedai/pengaturan"
        actionButton={<PaymentMethodExplanationDialog />}
      />

      <Tabs defaultValue="CASH" className="gap-4 m-5">
        <TabsList className="w-full">
          {tabs.map(({ icon: Icon, name, value }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-1.5"
            >
              <Icon />
              {name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={"CASH"}>
          <CashShopPayment shop_id={session.user.shopId} />
        </TabsContent>

        <TabsContent value={"QRIS"}>
          <QrisShopPayment shop_id={session.user.shopId} />
        </TabsContent>

        <TabsContent value={"BANK_TRANSFER"}>
          <BankTransferPayment shop_id={session.user.shopId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
