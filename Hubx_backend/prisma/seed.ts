import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create sample users
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@example.com" },
    update: {},
    create: {
      email: "teacher@example.com",
      password: await bcrypt.hash("password123", 10),
      firstName: "John",
      lastName: "Doe",
      role: "TEACHER",
    },
  })

  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      password: await bcrypt.hash("password123", 10),
      firstName: "Jane",
      lastName: "Smith",
      role: "STUDENT",
    },
  })

  // Create sample standard (Required by Subject and Paper)
  const standard = await prisma.standard.upsert({
    where: {
      teacherId_name: {
        teacherId: teacher.id,
        name: "10",
      }
    },
    update: {},
    create: {
      name: "10",
      teacherId: teacher.id,
    }
  });

  // Create sample subject (Linked to Standard)
  const subject = await prisma.subject.upsert({
    where: {
      standardId_name: {
        standardId: standard.id,
        name: "Mathematics",
      }
    },
    update: {},
    create: {
      name: "Mathematics",
      standardId: standard.id,
    },
  })

  // Create sample chapter (Linked to Subject)
  const chapter = await prisma.chapter.upsert({
    where: {
      subjectId_name: {
        subjectId: subject.id,
        name: "Algebra",
      }
    },
    update: {},
    create: {
      name: "Algebra",
      subjectId: subject.id,
    },
  })

  // Create sample paper
  const paper = await prisma.paper.create({
    data: {
      title: "Math Mid-Term Exam",
      description: "Comprehensive mathematics examination",
      standard: 10,
      teacherId: teacher.id,
      subjectId: subject.id,
      difficulty: "INTERMEDIATE",
      type: "TIME_BOUND",
      duration: 120,
      status: "PUBLISHED",
      isPublic: true,
      price: 99.99,
      // Link chapter using relation table
      chapters: {
        create: {
          chapterId: chapter.id
        }
      }
    },
  })

  // Create sample questions (Saved in 'questions' variable for linking)
  const questions = await Promise.all([
    prisma.question.create({
      data: {
        paperId: paper.id,
        type: "MCQ",
        difficulty: "EASY",
        questionText: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctOption: 1,
        solutionText: "2 + 2 = 4",
        marks: 1,
        order: 1,
      }
    }),
    prisma.question.create({
      data: {
        paperId: paper.id,
        type: "TEXT",
        difficulty: "INTERMEDIATE",
        questionText: "Solve the equation: 2x + 5 = 13",
        solutionText: "2x + 5 = 13\n2x = 8\nx = 4",
        marks: 2,
        order: 2,
      }
    })
  ]);

  // Create a DUMMY completed exam attempt for the student (To show charts)
  await prisma.examAttempt.create({
    data: {
      studentId: student.id,
      paperId: paper.id,
      status: "SUBMITTED",
      startedAt: new Date(Date.now() - 1000 * 60 * 60), // Started 1 hour ago
      submittedAt: new Date(), // Just finished
      totalScore: 3, // Full marks
      totalMarks: 3,
      percentage: 100,
      timeSpent: 300, // 5 minutes
      answers: {
        create: [
          {
            questionId: questions[0].id,
            studentId: student.id,
            selectedOption: 1,
            isCorrect: true,
            marksObtained: 1,
          },
          {
            questionId: questions[1].id,
            studentId: student.id,
            answerText: "x = 4",
            isCorrect: true, // Manual check simulated as correct
            marksObtained: 2,
          }
        ]
      }
    }
  });

  console.log({ teacher, student, subject, chapter, paper })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
