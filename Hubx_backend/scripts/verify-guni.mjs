import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const teacher = await prisma.user.findFirst({
      where: { email: "teacher1@hubx.com" }
    });

    console.log("\n📚 Standards for teacher1@hubx.com:\n");

    const standards = await prisma.standard.findMany({
      where: { teacherId: teacher.id },
      include: { subjects: true }
    });

    standards.forEach((std, index) => {
      console.log(`${index + 1}. Standard ID: ${std.id}`);
      console.log(`   Name: "${std.name}"`);
      console.log(`   Description: ${std.description || "N/A"}`);
      console.log(`   Subjects (${std.subjects.length}): ${std.subjects.map(s => s.name).join(", ")}`);
      console.log();
    });

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
