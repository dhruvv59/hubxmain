import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updatePrice() {
  const updated = await prisma.paper.update({
    where: { id: "cmlpnt23e00093l2bdyvzbosy" },
    data: { price: 0 },
  });

  console.log("✅ Updated paper to free:");
  console.log(`  Title: ${updated.title}`);
  console.log(`  Price: ${updated.price}`);

  await prisma.$disconnect();
}

updatePrice().catch(console.error);
