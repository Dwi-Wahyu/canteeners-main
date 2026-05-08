// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema/",
  migrations: {
    path: "prisma/migrations",
    seed: "bun run prisma/seed",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://dummy:dummy@localhost:5432/dummy",
  },
});
