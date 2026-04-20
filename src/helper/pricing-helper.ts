/**
 * Menghitung total komisi berdasarkan total kuantitas item.
 * Skema: 1000 per quantity untuk 2 item pertama, 
 * kemudian diskon 50% (500 per quantity) untuk quantity berikutnya.
 */
export function calculateCommission(totalQty: number): number {
  if (totalQty <= 2) {
    return totalQty * 1000;
  }
  return 2000 + (totalQty - 2) * 500;
}

/**
 * Menghitung komisi untuk suatu item berdasarkan urutan/jumlah yang sudah diproses sebelumnya.
 * Digunakan untuk mendistribusikan komisi bertingkat ke dalam subtotal item secara sequential.
 */
export function calculateItemCommission(
  quantity: number,
  previousQtyProcessed: number
): number {
  let commission = 0;
  let currentTotal = previousQtyProcessed;
  for (let i = 0; i < quantity; i++) {
    currentTotal++;
    if (currentTotal <= 2) {
      commission += 1000;
    } else {
      commission += 500;
    }
  }
  return commission;
}
