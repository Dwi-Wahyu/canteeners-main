export const refundReasonMapping = {
  SHOP_CANCELLATION: "Pembatalan oleh Kedai",
  LATE_DELIVERY: "Keterlambatan Pengiriman",
  WRONG_ORDER: "Kesalahan Pesanan",
  DAMAGED_FOOD: "Makanan Rusak/Cacat",
  MISSING_ITEM: "Item Kurang",
  OTHER: "Lain-lain",
};

export const refundStatusMapping = {
  PENDING: "Menunggu Konfirmasi Kedai",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  PROCESSED: "Telah Diproses",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan Pelanggan",
  ESCALATED: "Dieskalasi ke Admin",
};

export const refundDisbursementModeMapping = {
  CASH: "Tunai",
  TRANSFER: "Transfer",
};
