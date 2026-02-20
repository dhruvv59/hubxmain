import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Find teacher1
    const teacher = await prisma.user.findFirst({
      where: { email: "teacher1@hubx.com" }
    });

    if (!teacher) {
      console.error("❌ Teacher not found");
      return;
    }

    console.log("✅ Found teacher:", teacher.email);

    // Check if Guni standard already exists
    const existingGuni = await prisma.standard.findFirst({
      where: {
        name: "Guni",
        teacherId: teacher.id
      }
    });

    if (existingGuni) {
      console.log("✅ Guni standard already exists!");
      return;
    }

    // Create Guni standard
    const guniStandard = await prisma.standard.create({
      data: {
        name: "Guni",
        description: "College-level custom standard",
        teacherId: teacher.id,
      },
    });

    console.log("✅ Created Guni standard:", guniStandard.id);

    // Create subjects for Guni
    const subjects = await Promise.all([
      prisma.subject.create({
        data: {
          name: "Data Structures",
          standardId: guniStandard.id,
        },
      }),
      prisma.subject.create({
        data: {
          name: "Web Development",
          standardId: guniStandard.id,
        },
      }),
      prisma.subject.create({
        data: {
          name: "Database Design",
          standardId: guniStandard.id,
        },
      }),
    ]);

    console.log("✅ Created subjects:", subjects.map(s => s.name).join(", "));

    // Create chapters for subjects
    const chapters = await Promise.all([
      prisma.chapter.create({
        data: {
          name: "Arrays and Lists",
          subjectId: subjects[0].id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Trees and Graphs",
          subjectId: subjects[0].id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Sorting and Searching",
          subjectId: subjects[0].id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "HTML and CSS Basics",
          subjectId: subjects[1].id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "JavaScript Fundamentals",
          subjectId: subjects[1].id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "React Framework",
          subjectId: subjects[1].id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "SQL Basics",
          subjectId: subjects[2].id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Normalization",
          subjectId: subjects[2].id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Advanced Queries",
          subjectId: subjects[2].id,
        },
      }),
    ]);

    console.log(`✅ Created ${chapters.length} chapters`);
    console.log("\n🎉 Guni standard with subjects and chapters added successfully!");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
