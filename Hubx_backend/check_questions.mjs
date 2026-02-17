import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkQuestions() {
  const paper = await prisma.paper.findUnique({
    where: { id: "cmlpnt23e00093l2bdyvzbosy" },
    include: { questions: true },
  });

  console.log("Paper:", paper.title);
  console.log("Questions count:", paper.questions.length);
  
  if (paper.questions.length === 0) {
    console.log("❌ Paper has NO questions! This will cause an error.");
  } else {
    console.log("✅ Paper has questions:");
    paper.questions.forEach((q, i) => {
      console.log(`  ${i + 1}. ${q.questionText.substring(0, 50)}... (${q.marks} marks)`);
    });
  }

  await prisma.$disconnect();
}

checkQuestions().catch(console.error);
