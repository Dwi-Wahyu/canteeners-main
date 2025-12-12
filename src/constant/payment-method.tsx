import { CreditCard, DollarSign, QrCode } from "lucide-react";

export const paymentMethodMapping = {
  QRIS: "QRIS",
  BANK_TRANSFER: "Transfer Bank",
  CASH: "Tunai",
};

export const paymentMethodIconMapping = {
  CASH: <DollarSign />,
  QRIS: <QrCode />,
  BANK_TRANSFER: <CreditCard />,
};
