import CashIcon from "@/components/icons/cash-icon";
import { CreditCard, QrCode } from "lucide-react";

export const paymentMethodMapping = {
  QRIS: "QRIS",
  BANK_TRANSFER: "Transfer Bank",
  CASH: "Tunai",
};

export const paymentMethodIconMapping = {
  CASH: <CashIcon />,
  QRIS: <QrCode />,
  BANK_TRANSFER: <CreditCard />,
};
