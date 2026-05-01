export const refundReasonMapping = {
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
  PROCESSED: "Dana Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan Pengguna",
  ESCALATED: "Dieskalasi ke Admin",
};

export const refundDisbursementModeMapping = {
  CASH: "Tunai",
  TRANSFER: "Transfer",
};
