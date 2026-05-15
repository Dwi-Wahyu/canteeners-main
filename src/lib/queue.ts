// src/lib/queue.ts (or wherever your queue file is)
import { Queue } from "bullmq";

const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

// Flag to detect if Redis is available
const isRedisAvailable = process.env.SKIP_REDIS !== "true";

// In-memory fallback queue for build-time
class FallbackQueue {
  private jobs: Map<string, any[]> = new Map();

  async add(name: string, data: any, opts?: any) {
    if (!this.jobs.has(name)) {
      this.jobs.set(name, []);
    }
    this.jobs.get(name)!.push({ data, opts, timestamp: Date.now() });
    return { id: `fallback-${Date.now()}` };
  }

  async process(name: string, handler: Function) {
    // No-op during build
    return;
  }

  async getJob(id: string) {
    return null;
  }

  async remove() {
    return 0;
  }

  async close() {
    return undefined;
  }
}

// Create real queue or fallback based on Redis availability
export const orderQueue: any = isRedisAvailable
  ? new Queue("order-queue", { connection: redisConnection })
  : new FallbackQueue();

// Mark fallback so you can detect it if needed
Object.defineProperty(orderQueue, "_isFallback", {
  value: !isRedisAvailable,
  enumerable: false,
});
