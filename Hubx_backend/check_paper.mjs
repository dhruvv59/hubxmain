import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkPaper() {
  const paper = await prisma.paper.findFirst({
    where: { id: "cmlpnt23e00093l2bdyvzbosy" },
  });

  console.log("Paper data:", JSON.stringify(paper, null, 2));

  const allPapers = await prisma.paper.findMany({
    select: { id: true, title: true, price: true, isPublic: true },
  });

  console.log("\nAll papers:");
  allPapers.forEach((p) => {
    console.log(`- ${p.title}: price=${p.price}, isPublic=${p.isPublic}`);
  });

  await prisma.$disconnect();
}

checkPaper().catch(console.error);
