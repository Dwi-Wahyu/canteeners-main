import { Queue } from "bullmq";

const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

// Flag to detect if Redis is available
const isRedisAvailable = process.env.SKIP_REDIS !== "true";

if (!isRedisAvailable && process.env.NODE_ENV === "production") {
  console.error(
    "[Queue] CRITICAL: SKIP_REDIS=true di environment production. " +
      "Order dan refund queue tidak akan berfungsi!",
  );
}

// In-memory fallback queue for build-time or environments without Redis
class FallbackQueue {
  private jobs: Map<string, any[]> = new Map();

  async add(name: string, data: any, opts?: any) {
    console.error(
      `[FallbackQueue] WARNING: Job "${name}" ditambahkan ke in-memory fallback queue. ` +
        `Job ini TIDAK akan diproses oleh BullMQ Worker. Pastikan Redis tersedia dan SKIP_REDIS tidak di-set di production.`,
      { data, opts },
    );
    if (!this.jobs.has(name)) {
      this.jobs.set(name, []);
    }
    this.jobs.get(name)!.push({ data, opts, timestamp: Date.now() });
    return { id: `fallback-${Date.now()}` };
  }

  async process(name: string, handler: Function) {
    return;
  }

  async getJob(id: string) {
    return null;
  }

  async remove(id: string) {
    return 0;
  }

  get client(): Promise<any> {
    return Promise.resolve({
      get: async (key: string) => null,
      set: async (key: string, value: string, ...args: any[]) => "OK",
      del: async (key: string) => 0,
    });
  }

  async close() {
    return undefined;
  }
}

// Create real queue or fallback based on Redis availability
export const orderQueue: any = isRedisAvailable
  ? new Queue("order-queue", { connection: redisConnection })
  : new FallbackQueue();

Object.defineProperty(orderQueue, "_isFallback", {
  value: !isRedisAvailable,
  enumerable: false,
});

export const refundQueue: any = isRedisAvailable
  ? new Queue("refund-queue", { connection: redisConnection })
  : new FallbackQueue();

Object.defineProperty(refundQueue, "_isFallback", {
  value: !isRedisAvailable,
  enumerable: false,
});
