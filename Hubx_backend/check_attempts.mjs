import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAttempts() {
  const paperId = "cmlpnt23e00093l2bdyvzbosy";
  const studentId = "cmlpnt22m00013l2bb7n70hr7";

  const attempts = await prisma.examAttempt.findMany({
    where: { paperId, studentId },
  });

  console.log("Existing attempts:", attempts.length);
  attempts.forEach((a) => {
    console.log(`  - Status: ${a.status}, Created: ${a.createdAt}`);
  });

  if (attempts.length > 0 && attempts[0].status === "ONGOING") {
    console.log("\n⚠️  There's an ONGOING attempt! startExam should return this.");
  }

  await prisma.$disconnect();
}

checkAttempts().catch(console.error);
