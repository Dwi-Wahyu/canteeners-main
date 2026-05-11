// prisma.config.ts
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema/",
  migrations: {
    path: "prisma/migrations",
    seed: "bun run prisma/seed",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/canteeners",
  },
});
