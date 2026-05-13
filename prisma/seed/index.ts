import { seedUsers } from "./seed-users";
import { seedOwners } from "./seed-owners";
import { seedCanteens } from "./seed-canteens";
import { seedCategories } from "./seed-categories";
import { prisma } from "@/lib/prisma";
import { seedShops } from "./seed-shops";
import { seedSuperAdmin } from "./seed-superadmin";

async function main() {
  // Guard: Cek apakah database sudah berisi data (berdasarkan jumlah user)
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log("⚠️  Database sudah memiliki data. Seeding dibatalkan untuk mencegah kehilangan data.");
    return;
  }

  console.log("🌱 Memulai proses seeding database...");
  await prisma.canteenMap.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shopTestimony.deleteMany();
  await prisma.shopComplaint.deleteMany();
  await prisma.shopBilling.deleteMany();
  await prisma.productOptionValue.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shopCart.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();
  await prisma.canteen.deleteMany();
  await prisma.category.deleteMany();

  await seedCanteens();
  await seedCategories();
  await seedUsers();
  await seedOwners();
  await seedSuperAdmin();
  await seedShops();
  console.log("✅ Seeding selesai dengan sukses.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
