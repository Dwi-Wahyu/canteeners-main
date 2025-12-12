/**
 * Format harga menjadi Rupiah dengan pemisah ribuan dan maksimal 3 digit desimal
 * Contoh: 100000400 → "Rp 100.000.400"
 * Contoh: 100000400.456 → "Rp 100.000.400,456"
 *
 * @param price - Harga dalam angka
 * @returns String format Rupiah
 */
export function formatRupiah(price: number | string): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return "Rp 0";
  }

  // Pisahkan bagian integer dan desimal
  const [integerPart, decimalPart] = numPrice.toString().split(".");

  // Format bagian integer dengan titik sebagai pemisah ribuan
  const formattedInteger = parseInt(integerPart)
    .toLocaleString("id-ID")
    .replace(/,/g, ".");

  // Handle bagian desimal (maksimal 2 digit)
  let formattedDecimal = "";
  if (decimalPart) {
    // Ambil maksimal 2 digit pertama, hilangkan trailing zero
    const limitedDecimal = decimalPart.slice(0, 2).replace(/0+$/, "");
    if (limitedDecimal) {
      formattedDecimal = `,${limitedDecimal}`;
    }
  }

  // Gabungkan dan tambah simbol Rp
  return `Rp ${formattedInteger}${formattedDecimal}`;
}
