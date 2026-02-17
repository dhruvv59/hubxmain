import { PrismaClient, UserRole, PaperStatus, PaperType, Difficulty, QuestionType, ExamStatus, PaymentStatus, OrganizationType, TicketStatus, TicketPriority, TicketCategory } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// --- Helpers ---
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function cleanDatabase() {
  console.log('Cleaning database...');
  await prisma.studentAnswer.deleteMany();
  await prisma.doubt.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.questionBankPaperLink.deleteMany();
  await prisma.paperChapter.deleteMany();
  await prisma.question.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.paperCoupon.deleteMany();
  await prisma.paperPurchase.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.supportTicketAttachment.deleteMany();
  await prisma.supportTicketReply.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.studentSettings.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.paper.deleteMany();
  await prisma.questionBankChapter.deleteMany();
  await prisma.questionBank.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.standard.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
  console.log('Database cleaned.');
}

async function main() {
  await cleanDatabase();
  console.log('Seeding Enhanced Data for Teachers & Students...');

  const passwordHash = await bcrypt.hash("password123", 10);

  // --- 1. Organizations ---
  const orgs = [];
  const orgData = [
    { name: "Delhi Public School", code: "DPS_DELHI", type: OrganizationType.SCHOOL },
    { name: "Indian Institute of Technology", code: "IIT_BOMBAY", type: OrganizationType.INSTITUTE },
    { name: "Gujarat University", code: "GU_AHMEDABAD", type: OrganizationType.UNIVERSITY }
  ];
  for (const o of orgData) orgs.push(await prisma.organization.create({ data: o }));

  // --- 2. Users (Teachers & Students) ---
  const teacherNames = [
    { first: "Amit", last: "Sharma", email: "amit.sharma@hubx.in" },
    { first: "Priya", last: "Patel", email: "priya.patel@hubx.in" },
    { first: "Rajesh", last: "Verma", email: "rajesh.verma@hubx.in" }
  ];
  const teachers = [];
  for (const t of teacherNames) {
    const user = await prisma.user.create({
      data: {
        email: t.email, password: passwordHash, firstName: t.first, lastName: t.last, role: UserRole.TEACHER,
        notifications: {
          create: [
            { title: "Welcome Teacher", message: "Welcome to HubX! Start creating papers.", type: "INFO" },
            { title: "System Update", message: "New Question Bank features added.", type: "INFO" }
          ]
        }
      }
    });
    teachers.push(user);
    await prisma.organizationMember.create({
      data: { userId: user.id, organizationId: getRandomElement(orgs).id, role: UserRole.TEACHER, employeeId: `EMP${getRandomInt(1000, 9999)}` }
    });
  }

  const studentNames = [
    { first: "Rahul", last: "Singh", email: "rahul.singh@student.hubx.in" },
    { first: "Sneha", last: "Gupta", email: "sneha.gupta@student.hubx.in" },
    { first: "Vikram", last: "Rathore", email: "vikram.rathore@student.hubx.in" }
  ];
  const students = [];
  for (const s of studentNames) {
    const user = await prisma.user.create({
      data: {
        email: s.email, password: passwordHash, firstName: s.first, lastName: s.last, role: UserRole.STUDENT,
        profile: { create: { phone: `98765${getRandomInt(10000, 99999)}`, address: "123, Student Lane, India", dateOfBirth: new Date("2005-01-01") } },
        settings: { create: { theme: "light", language: "en" } },
        notifications: { create: { title: "Welcome Student", message: "Start your learning journey!", type: "SUCCESS" } }
      }
    });
    students.push(user);
    await prisma.organizationMember.create({
      data: { userId: user.id, organizationId: getRandomElement(orgs).id, role: UserRole.STUDENT, studentId: `STU${getRandomInt(1000, 9999)}` }
    });
  }

  // --- 3. Curriculum ---
  // Teacher 1: Math (Strandard 10), Teacher 2: Physics (Standard 11), Teacher 3: Chemistry (Standard 12)
  const curriculum = [
    { std: "10", sub: "Mathematics", ch: ["Real Numbers", "Polynomials", "Trigonometry"], teacher: teachers[0] },
    { std: "11", sub: "Physics", ch: ["Kinematics", "Laws of Motion", "Thermodynamics"], teacher: teachers[1] },
    { std: "12", sub: "Chemistry", ch: ["Solutions", "Electrochemistry", "Organic Chemistry"], teacher: teachers[2] }
  ];

  const subjectsMap: any[] = []; // To store created subjects for later use

  for (const curr of curriculum) {
    let std = await prisma.standard.create({ data: { name: curr.std, teacherId: curr.teacher.id } });
    let sub = await prisma.subject.create({ data: { name: curr.sub, standardId: std.id } });
    subjectsMap.push({ subject: sub, teacher: curr.teacher, chapters: [] });

    for (const chName of curr.ch) {
      const ch = await prisma.chapter.create({ data: { name: chName, subjectId: sub.id } });
      subjectsMap[subjectsMap.length - 1].chapters.push(ch);
    }
  }

  // --- 4. EXTENSIVE Question Bank (15 items per teacher) ---
  console.log("Seeding Question Bank...");
  const qBankTypes = [QuestionType.MCQ, QuestionType.TEXT, QuestionType.FILL_IN_THE_BLANKS];

  for (const item of subjectsMap) {
    const { teacher, subject } = item;
    for (let i = 1; i <= 15; i++) {
      const type = getRandomElement(qBankTypes);
      await prisma.questionBank.create({
        data: {
          teacherId: teacher.id,
          type: type,
          difficulty: getRandomElement([Difficulty.EASY, Difficulty.INTERMEDIATE, Difficulty.ADVANCED]),
          questionText: `[QB] ${subject.name} Question ${i}: What is the core concept of...`,
          options: type === QuestionType.MCQ ? ["Option A", "Option B", "Option C", "Option D"] : undefined,
          correctOption: type === QuestionType.MCQ ? 0 : undefined,
          marks: type === QuestionType.TEXT ? 5 : 1,
          subjectId: subject.id,
          tags: ["important", "2024-syllabus"],
          solutionText: "Detailed solution from question bank...",
          usageCount: getRandomInt(0, 10)
        }
      });
    }
  }

  // --- 5. Teacher Papers (Marketplace Simulation) ---
  console.log("Seeding Marketplace Papers...");
  const papers = [];
  const subjectsList = subjectsMap.flatMap(s => s.subject); // All created subjects

  // 1. Generate 30 Diverse Public Papers
  for (let i = 0; i < 30; i++) {
    const teacher = getRandomElement(teachers);
    const subjectItem = subjectsMap.find(s => s.teacher.id === teacher.id); // Get valid subject for teacher

    if (!subjectItem) continue;

    const { subject, chapters } = subjectItem;
    const isPublic = true;
    const price = getRandomInt(99, 999);

    const paper = await prisma.paper.create({
      data: {
        title: `${subject.name} - ${getRandomElement(["Unit Test", "Final Exam", "Practice Set", "Mock Test", "Olympiad Prep"])} ${i + 1}`,
        description: `Comprehensive ${subject.name} paper covering multiple chapters. Great for revision.`,
        standard: parseInt(curriculum.find(c => c.teacher.id === teacher.id)?.std || "10"),
        teacherId: teacher.id,
        subjectId: subject.id,
        difficulty: getRandomElement([Difficulty.EASY, Difficulty.INTERMEDIATE, Difficulty.ADVANCED]),
        type: PaperType.TIME_BOUND,
        duration: getRandomElement([30, 60, 90, 120, 180]),
        status: PaperStatus.PUBLISHED,
        isPublic: true,
        price: price,
        totalAttempts: getRandomInt(0, 500),
        averageScore: getRandomInt(30, 98),
        chapters: { create: [{ chapterId: getRandomElement(chapters).id }] },
        chatRoom: { create: {} }
      }
    });
    papers.push(paper);

    // Add 5-10 Questions per paper
    const qCount = getRandomInt(5, 10);
    for (let q = 1; q <= qCount; q++) {
      await prisma.question.create({
        data: {
          paperId: paper.id,
          type: QuestionType.MCQ,
          difficulty: Difficulty.INTERMEDIATE,
          questionText: `Sample Question ${q} for ${paper.title}?`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: 0,
          solutionText: "Explanation for the correct answer.",
          marks: 2,
          order: q
        }
      });
    }
  }

  // 2. Draft Papers (Private)
  for (const teacher of teachers) {
    const subjectItem = subjectsMap.find(s => s.teacher.id === teacher.id);
    if (subjectItem) {
      await prisma.paper.create({
        data: {
          title: `${subjectItem.subject.name} - Internal Draft`,
          description: "Private draft paper.",
          standard: 10,
          teacherId: teacher.id,
          subjectId: subjectItem.subject.id,
          difficulty: Difficulty.ADVANCED,
          type: PaperType.NO_LIMIT,
          status: PaperStatus.DRAFT,
          isPublic: false
        }
      });
    }
  }

  // --- 6. Exam Attempts & Analytics ---
  console.log("Seeding Analytics...");
  // Each student attempts 2 papers
  for (const student of students) {
    // Pick 2 random papers
    const papersToAttempt = papers.slice(0, 2);

    for (const paper of papersToAttempt) {
      // Purchase
      const payment = await prisma.payment.create({
        data: {
          userId: student.id, amount: paper.price || 499, status: PaymentStatus.SUCCESS,
          orderId: `ord_${getRandomInt(10000, 99999)}`, paymentId: `pay_${getRandomInt(10000, 99999)}`
        }
      });
      await prisma.paperPurchase.create({
        data: { paperId: paper.id, studentId: student.id, paymentId: payment.id, price: paper.price || 499 }
      });

      // Attempt
      const attempt = await prisma.examAttempt.create({
        data: {
          paperId: paper.id,
          studentId: student.id,
          status: ExamStatus.SUBMITTED,
          startedAt: new Date(Date.now() - 7200000), // 2 hours ago
          submittedAt: new Date(),
          totalMarks: 10,
          totalScore: getRandomInt(4, 10),
          percentage: getRandomInt(40, 100),
          timeSpent: getRandomInt(1200, 3600)
        }
      });

      // Create Notification for Teacher about this attempt
      await prisma.notification.create({
        data: {
          userId: paper.teacherId, // Notify the teacher
          title: "New Exam Submission",
          message: `${student.firstName} submitted ${paper.title}`,
          type: "SUCCESS",
          isRead: false
        }
      });
    }
  }

  // --- 7. Doubts & Teacher Replies ---
  console.log("Seeding Doubts...");
  for (let i = 0; i < 3; i++) {
    // Create a doubt
    // Need to find an attempt first
    const attempt = await prisma.examAttempt.findFirst();
    if (attempt) {
      const question = await prisma.question.findFirst({ where: { paperId: attempt.paperId } });
      if (question) {
        await prisma.doubt.create({
          data: {
            attemptId: attempt.id,
            questionId: question.id,
            studentId: attempt.studentId,
            doubtText: "Sir, I didn't understand why Option A is correct?",
            isResolved: true,
            teacherReply: "Option A is correct because of the formula X = Y + Z.",
            repliedBy: (await prisma.paper.findUnique({ where: { id: attempt.paperId } }))!.teacherId,
            repliedAt: new Date()
          }
        });
      }
    }
  }

  console.log('Seeding Completed! Teachers have extensive data: Drafts, Banks, Analytics.');
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
