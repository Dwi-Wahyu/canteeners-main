import { FileWarning, Ban, MessageSquareX } from "lucide-react";

export const customerViolationTitleMapping = {
  ORDER_CANCEL_WITHOUT_PAY: "Pembatalan Order",
  REFUND_FRAUD: "Kecurangan Refund",
  REVIEW_VIOLATION: "Pelanggaran Ulasan",
};

export const customerViolationDescriptionMapping = {
  ORDER_CANCEL_WITHOUT_PAY: "Pembatalan order tanpa melakukan pembayaran secara berulang.",
  REFUND_FRAUD: "Ditemukan indikasi kecurangan atau manipulasi dalam pengajuan pengembalian dana (refund).",
  REVIEW_VIOLATION: "Ulasan yang diberikan mengandung kata-kata tidak pantas, SARA, atau bersifat menjatuhkan tanpa bukti.",
};

export const customerViolationIconMapping = {
  ORDER_CANCEL_WITHOUT_PAY: <FileWarning />,
  REFUND_FRAUD: <Ban />,
  REVIEW_VIOLATION: <MessageSquareX />,
};
