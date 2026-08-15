import { prisma } from "@/lib/prisma";
import { orderQueue } from "@/lib/queue";

/**
 * Mendapatkan nilai pengaturan global dengan caching Redis.
 * Jika tidak ada di Redis, ambil dari DB dan simpan ke Redis (TTL 1 jam).
 */
export async function getGlobalSetting(key: string, defaultValue: string): Promise<string> {
  const redis = await orderQueue.client;
  const cacheKey = `setting:${key}`;

  try {
    // 1. Coba ambil dari Redis
    const cachedValue = redis && typeof redis.get === "function" ? await redis.get(cacheKey) : null;
    if (cachedValue !== null) {
      return cachedValue;
    }

    // 2. Jika tidak ada di Redis, ambil dari Database
    const setting = await prisma.globalSetting.findUnique({
      where: { key },
    });

    const finalValue = setting ? setting.value : defaultValue;

    // 3. Simpan ke Redis untuk penggunaan berikutnya (TTL 1 jam)
    if (redis && typeof redis.set === "function") {
      await redis.set(cacheKey, finalValue, "EX", 3600);
    }

    return finalValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Mendapatkan batas waktu pembayaran dalam menit (default: 15 menit).
 */
export async function getPaymentTimeoutMinutes(): Promise<number> {
  const value = await getGlobalSetting("payment_timeout_minutes", "15");
  return parseInt(value) || 15;
}

/**
 * Mendapatkan batas waktu konfirmasi kedai dalam menit (default: 30 menit).
 */
export async function getShopConfirmationTimeoutMinutes(): Promise<number> {
  const value = await getGlobalSetting("shop_confirmation_timeout_minutes", "30");
  return parseInt(value) || 30;
}

/**
 * Mendapatkan batas waktu penerimaan pesanan baru oleh kedai dalam menit (default: 10 menit).
 */
export async function getShopOrderAcceptanceTimeoutMinutes(): Promise<number> {
  const value = await getGlobalSetting("shop_order_acceptance_timeout_minutes", "10");
  return parseInt(value) || 10;
}
