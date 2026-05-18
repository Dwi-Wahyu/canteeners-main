import {
  Clock,
  XCircle,
  Timer,
  MailX,
  AlertTriangle,
  ShieldX,
  Siren,
  RefreshCcwDot,
} from "lucide-react";

export const shopViolationTitleMapping: Record<string, string> = {
  HIGH_DAILY_CANCEL_RATE: "Tingkat Pembatalan Tinggi",
  SLOW_ORDER_CONFIRMATION: "Konfirmasi Order Lambat",
  HIGH_ORDER_LATE_RATE: "Sering Melebihi Estimasi",
  REFUND_IGNORED: "Refund Diabaikan",
  REFUND_SLOW_RESPONSE: "Respons Refund Lambat",
  POLICY_VIOLATION: "Pelanggaran Kebijakan",
  REFUND_FRAUD_SUSPECTED: "Indikasi Kecurangan Refund",
  REPEATED_CRITICAL_VIOLATIONS: "Pelanggaran Berulang",
};

export const shopViolationDescriptionMapping: Record<string, string> = {
  HIGH_DAILY_CANCEL_RATE:
    "Jumlah order yang dibatalkan dalam satu hari melebihi batas yang diizinkan.",
  SLOW_ORDER_CONFIRMATION:
    "Terdapat pola konfirmasi order yang terlalu lambat sehingga merugikan pelanggan.",
  HIGH_ORDER_LATE_RATE:
    "Pesanan sering diselesaikan melebihi estimasi waktu yang dijanjikan.",
  REFUND_IGNORED:
    "Permintaan refund dari pelanggan tidak direspons dalam batas waktu 1x24 jam sesuai ketentuan.",
  REFUND_SLOW_RESPONSE:
    "Respons terhadap permintaan refund mendekati atau melewati batas waktu yang ditentukan.",
  POLICY_VIOLATION:
    "Terdapat tindakan yang melanggar syarat & ketentuan platform.",
  REFUND_FRAUD_SUSPECTED:
    "Ditemukan indikasi manipulasi atau kecurangan dalam penanganan pengembalian dana.",
  REPEATED_CRITICAL_VIOLATIONS:
    "Terdapat akumulasi pelanggaran berat yang terjadi berulang kali.",
};

export const shopViolationIconMapping: Record<string, React.ReactNode> = {
  HIGH_DAILY_CANCEL_RATE: <XCircle className="size-5" />,
  SLOW_ORDER_CONFIRMATION: <Clock className="size-5" />,
  HIGH_ORDER_LATE_RATE: <Timer className="size-5" />,
  REFUND_IGNORED: <MailX className="size-5" />,
  REFUND_SLOW_RESPONSE: <AlertTriangle className="size-5" />,
  POLICY_VIOLATION: <ShieldX className="size-5" />,
  REFUND_FRAUD_SUSPECTED: <Siren className="size-5" />,
  REPEATED_CRITICAL_VIOLATIONS: <RefreshCcwDot className="size-5" />,
};
