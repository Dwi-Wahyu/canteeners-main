import { seedUsers } from "./seed-users";
import { seedCanteens } from "./seed-canteens";
import { seedCategories } from "./seed-categories";
import { prisma } from "@/lib/prisma";

async function main() {
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
