import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" }
    });

    for (const teacher of teachers) {
      const standards = await prisma.standard.findMany({
        where: { teacherId: teacher.id }
      });

      console.log(`\n👨‍🏫 ${teacher.firstName} (${teacher.email}):`);
      if (standards.length === 0) {
        console.log("   No standards created");
      } else {
        standards.forEach(std => {
          console.log(`   - ${std.name}`);
        });
      }
    }

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
