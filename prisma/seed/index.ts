import { seedShops } from "./seed-shops";
import { prisma } from "@/lib/prisma";

async function main() {
  await seedShops();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
