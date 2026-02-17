import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Adding sample public papers for testing...\n");

  try {
    // Get existing teachers
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      take: 3,
    });

    if (teachers.length === 0) {
      console.error("❌ No teachers found. Please seed teachers first.");
      return;
    }

    console.log(`Found ${teachers.length} teachers\n`);

    // Get existing subjects
    const subjects = await prisma.subject.findMany({ take: 10 });

    if (subjects.length === 0) {
      console.error("❌ No subjects found. Please create subjects first.");
      return;
    }

    console.log(`Found ${subjects.length} subjects\n`);

    // Array to track created papers for later use
    const createdPapers = [];

    // Sample paper templates with different prices, difficulties, and standards
    const paperTemplates = [
      // Teacher 1 Papers
      {
        teacherIndex: 0,
        title: "Class 9 Science - Motion & Force",
        standard: 9,
        difficulty: "EASY",
        price: 50,
        duration: 45,
        totalAttempts: 34,
        averageScore: 78,
      },
      {
        teacherIndex: 0,
        title: "Class 9 Mathematics - Algebra Advanced",
        standard: 9,
        difficulty: "ADVANCED",
        price: 100,
        duration: 90,
        totalAttempts: 56,
        averageScore: 68,
      },
      {
        teacherIndex: 0,
        title: "Class 9 English - Literature Basics",
        standard: 9,
        difficulty: "INTERMEDIATE",
        price: 75,
        duration: 60,
        totalAttempts: 28,
        averageScore: 75,
      },

      // Teacher 2 Papers
      {
        teacherIndex: 1,
        title: "Class 10 Mathematics - Geometry",
        standard: 10,
        difficulty: "INTERMEDIATE",
        price: 120,
        duration: 120,
        totalAttempts: 72,
        averageScore: 71,
      },
      {
        teacherIndex: 1,
        title: "Class 10 Science - Chemical Reactions",
        standard: 10,
        difficulty: "INTERMEDIATE",
        price: 100,
        duration: 90,
        totalAttempts: 45,
        averageScore: 72,
      },
      {
        teacherIndex: 1,
        title: "Class 10 History - Modern India",
        standard: 10,
        difficulty: "EASY",
        price: 50,
        duration: 45,
        totalAttempts: 62,
        averageScore: 80,
      },

      // Teacher 3 Papers
      {
        teacherIndex: 2,
        title: "Class 11 Physics - Mechanics",
        standard: 11,
        difficulty: "ADVANCED",
        price: 200,
        duration: 150,
        totalAttempts: 38,
        averageScore: 62,
      },
      {
        teacherIndex: 2,
        title: "Class 11 Chemistry - Organic Chemistry",
        standard: 11,
        difficulty: "ADVANCED",
        price: 180,
        duration: 120,
        totalAttempts: 44,
        averageScore: 65,
      },
      {
        teacherIndex: 2,
        title: "Class 11 Biology - Cell Structure",
        standard: 11,
        difficulty: "INTERMEDIATE",
        price: 120,
        duration: 90,
        totalAttempts: 50,
        averageScore: 74,
      },

      // Additional variety
      {
        teacherIndex: 0,
        title: "Class 8 Science - Matter & Properties",
        standard: 8,
        difficulty: "EASY",
        price: 40,
        duration: 40,
        totalAttempts: 28,
        averageScore: 82,
      },
      {
        teacherIndex: 1,
        title: "Class 12 Mathematics - Calculus",
        standard: 12,
        difficulty: "ADVANCED",
        price: 250,
        duration: 180,
        totalAttempts: 30,
        averageScore: 58,
      },
      {
        teacherIndex: 2,
        title: "Class 8 Mathematics - Basic Algebra",
        standard: 8,
        difficulty: "EASY",
        price: 45,
        duration: 45,
        totalAttempts: 55,
        averageScore: 85,
      },
    ];

    console.log(`📄 Creating ${paperTemplates.length} sample public papers...\n`);

    for (const template of paperTemplates) {
      const teacher = teachers[template.teacherIndex];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];

      try {
        // Create paper
        const paper = await prisma.paper.create({
          data: {
            title: template.title,
            description: `${template.title} - A comprehensive assessment covering key topics`,
            standard: template.standard,
            teacherId: teacher.id,
            subjectId: subject.id,
            difficulty: template.difficulty,
            type: "TIME_BOUND",
            duration: template.duration,
            status: "PUBLISHED",
            isPublic: true,
            price: template.price,
            totalAttempts: template.totalAttempts,
            averageScore: template.averageScore,
          },
        });

        createdPapers.push(paper);

        // Create sample questions for this paper
        const questionCount = Math.floor(Math.random() * 8) + 8; // 8-15 questions
        for (let i = 0; i < questionCount; i++) {
          await prisma.question.create({
            data: {
              paperId: paper.id,
              type: ["MCQ", "TEXT", "FILL_IN_THE_BLANKS"][Math.floor(Math.random() * 3)],
              difficulty: template.difficulty,
              questionText: `Question ${i + 1}: Sample question for ${template.title}`,
              options: JSON.stringify([
                "Option A",
                "Option B",
                "Option C",
                "Option D",
              ]),
              correctOption: 0,
              solutionText: "This is the solution for the question.",
              marks: 1,
              order: i,
            },
          });
        }

        // Create chat room for this paper
        await prisma.chatRoom.create({
          data: {
            paperId: paper.id,
          },
        });

        console.log(
          `✅ Created: "${paper.title}" by ${teacher.firstName} (₹${paper.price}, ${paper.difficulty})`
        );
      } catch (error) {
        console.error(`❌ Error creating paper: ${template.title}`, error.message);
      }
    }

    console.log(`\n✨ Successfully created ${createdPapers.length} public papers!\n`);

    // Summary
    console.log("📊 Summary of Created Papers:");
    console.log("================================");

    const groupedByTeacher = createdPapers.reduce((acc, paper) => {
      const teacherName = teachers[
        paperTemplates.findIndex((t) => t.title === paper.title)
      ]?.firstName;
      if (!acc[teacherName]) acc[teacherName] = [];
      acc[teacherName].push(paper);
      return acc;
    }, {});

    for (const [teacher, papers] of Object.entries(groupedByTeacher)) {
      console.log(`\n${teacher}'s Papers (${papers.length}):`);
      papers.forEach((p) => {
        console.log(
          `  • ${p.title} - ₹${p.price} (${papers.length} questions)`
        );
      });
    }

    // Price statistics
    const prices = createdPapers.map((p) => p.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    console.log("\n💰 Price Statistics:");
    console.log(`  Min Price: ₹${Math.min(...prices)}`);
    console.log(`  Max Price: ₹${Math.max(...prices)}`);
    console.log(`  Avg Price: ₹${avgPrice.toFixed(2)}`);

    // Standard distribution
    const standardCounts = {};
    createdPapers.forEach((p) => {
      standardCounts[p.standard] = (standardCounts[p.standard] || 0) + 1;
    });

    console.log("\n🎓 Standard Distribution:");
    Object.entries(standardCounts)
      .sort(([a], [b]) => a - b)
      .forEach(([std, count]) => {
        console.log(`  Class ${std}: ${count} papers`);
      });

    // Difficulty distribution
    const difficultyCounts = {};
    createdPapers.forEach((p) => {
      difficultyCounts[p.difficulty] = (difficultyCounts[p.difficulty] || 0) + 1;
    });

    console.log("\n⚡ Difficulty Distribution:");
    Object.entries(difficultyCounts).forEach(([diff, count]) => {
      console.log(`  ${diff}: ${count} papers`);
    });

    console.log(
      "\n🚀 Ready for testing! Visit: http://localhost:3000/teacher/public-papers\n"
    );
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
