import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all standards with their teachers
    const standards = await prisma.standard.findMany({
      include: {
        teacher: { select: { firstName: true, email: true, id: true } }
      }
    });

    console.log("\n📚 All Standards in Database:\n");
    standards.forEach((std, idx) => {
      console.log(`${idx + 1}. "${std.name}" (ID: ${std.id})`);
      console.log(`   Teacher: ${std.teacher.firstName} (${std.teacher.email})`);
    });

    // Check which teacher is logged in (amit.sharma@hubx.in)
    const teacher = await prisma.user.findFirst({
      where: { email: "amit.sharma@hubx.in" },
      include: { standards: true }
    });

    console.log(`\n👨‍🏫 Teacher: ${teacher?.firstName} (${teacher?.email})`);
    console.log(`Standards: ${teacher?.standards.map(s => s.name).join(", ")}`);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
