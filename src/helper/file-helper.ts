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

/**
 * Memotong nama file yang panjang dengan tetap menyertakan ekstensi.
 * Contoh: "nama-file-sangat-panjang.png" -> "nama-file-san...png"
 */
export function truncateFileName(filename: string, maxLength: number = 20): string {
  if (filename.length <= maxLength) return filename;

  const extension = getFileExtension(filename);
  const nameWithoutExtension = filename.substring(0, filename.lastIndexOf("."));
  
  const charsToShow = maxLength - extension.length - 3; // 3 for "..."
  
  if (charsToShow <= 0) {
    return filename.substring(0, maxLength - 3) + "...";
  }

  return nameWithoutExtension.substring(0, charsToShow) + "..." + (extension ? "." + extension : "");
}

/**
 * Menghapus file melalui API Backend.
 * @param filename Nama file (bukan full URL)
 */
export async function deleteFile(filename: string) {
  if (!filename) return;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/files/${filename}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      console.error("Failed to delete file:", filename);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}
