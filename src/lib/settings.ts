import { prisma } from "@/lib/prisma";
import { orderQueue } from "@/lib/queue";

/**
 * Mendapatkan nilai pengaturan global dengan caching Redis.
 * Jika tidak ada di Redis, ambil dari DB dan simpan ke Redis.
 */
export async function getGlobalSetting(key: string, defaultValue: string): Promise<string> {
  const redis = await orderQueue.client;
  const cacheKey = `setting:${key}`;

  try {
    // 1. Coba ambil dari Redis
    const cachedValue = await redis.get(cacheKey);
    if (cachedValue !== null) {
      return cachedValue;
    }

    // 2. Jika tidak ada, ambil dari Database
    const setting = await prisma.globalSetting.findUnique({
      where: { key },
    });

    const finalValue = setting ? setting.value : defaultValue;

    // 3. Simpan ke Redis untuk penggunaan berikutnya (TTL 1 jam sebagai safety)
    await redis.set(cacheKey, finalValue, "EX", 3600);

    return finalValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Mendapatkan batas waktu pembayaran dalam menit (angka).
 */
export async function getPaymentTimeoutMinutes(): Promise<number> {
  const value = await getGlobalSetting("payment_timeout_minutes", "15");
  return parseInt(value) || 15;
}
