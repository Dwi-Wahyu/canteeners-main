/**
 * Menghitung total komisi berdasarkan total kuantitas item.
 * Skema: 1000 per quantity, jika total quantity > 2 maka total komisi diskon 50%.
 */
export function calculateCommission(totalQty: number): number {
  const baseCommission = totalQty * 1000;
  if (totalQty > 2) {
    return baseCommission * 0.5;
  }
  return baseCommission;
}

/**
 * Menghitung komisi untuk suatu item berdasarkan total kuantitas di keranjang.
 * Digunakan untuk mendistribusikan komisi ke dalam subtotal item secara proporsional.
 */
export function calculateItemCommission(
  itemQuantity: number,
  totalCartQty: number,
): number {
  const totalCommission = calculateCommission(totalCartQty);
  // Distribusi proporsional: (itemQty / totalQty) * totalCommission
  // Karena rumusnya linear (per unit), kita bisa sederhanakan:
  const commissionPerUnit = totalCommission / totalCartQty;
  return itemQuantity * commissionPerUnit;
}
