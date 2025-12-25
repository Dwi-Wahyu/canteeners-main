import { format } from "date-fns";

const generateRandomSuffix = (length: number = 8) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
};

export const getFileExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");

  // Jika tidak ada titik, atau titik berada di awal (file tersembunyi)
  if (lastDotIndex === -1) return "";

  return filename.substring(lastDotIndex + 1).toLowerCase();
};

/**
 * Menghasilkan nama file yang ringkas dan unik.
 * Format: [prefix]/[YYYY-MM-dd]-[random-suffix].[ext]
 * Contoh: pay-2025-12-25-a1b2c3d4.jpg
 */
export function generateFileName(originalName: string, prefix: string): string {
  const extension = getFileExtension(originalName);

  // Format tanggal sesuai permintaan: YYYY-MM-dd
  const dateStr = format(new Date(), "yyyy-MM-dd");

  const randomSuffix = generateRandomSuffix();

  return `${prefix}/${dateStr}_${randomSuffix}.${extension}`;
}
