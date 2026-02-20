import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...\n");

  // Clean existing data (optional - comment out if you want to keep existing data)
  console.log("Cleaning up existing data...");
  // await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=0;');
  // await prisma.$executeRawUnsafe('TRUNCATE TABLE User;');
  // ... truncate all tables

  try {
    // ============================================
    // 1. CREATE USERS
    // ============================================
    console.log("📝 Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    const users = await Promise.all([
      // Super Admin
      prisma.user.create({
        data: {
          email: "admin@hubx.com",
          password: hashedPassword,
          firstName: "Admin",
          lastName: "User",
          role: "SUPER_ADMIN",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
          streak: 0,
        },
      }),
      // Teachers
      prisma.user.create({
        data: {
          email: "teacher1@hubx.com",
          password: hashedPassword,
          firstName: "Rajesh",
          lastName: "Kumar",
          role: "TEACHER",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1",
          streak: 15,
        },
      }),
      prisma.user.create({
        data: {
          email: "teacher2@hubx.com",
          password: hashedPassword,
          firstName: "Priya",
          lastName: "Singh",
          role: "TEACHER",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2",
          streak: 8,
        },
      }),
      prisma.user.create({
        data: {
          email: "teacher3@hubx.com",
          password: hashedPassword,
          firstName: "Vikram",
          lastName: "Patel",
          role: "TEACHER",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher3",
          streak: 5,
        },
      }),
      // Students
      prisma.user.create({
        data: {
          email: "student1@hubx.com",
          password: hashedPassword,
          firstName: "Arjun",
          lastName: "Sharma",
          role: "STUDENT",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student1",
          streak: 12,
        },
      }),
      prisma.user.create({
        data: {
          email: "student2@hubx.com",
          password: hashedPassword,
          firstName: "Isha",
          lastName: "Desai",
          role: "STUDENT",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student2",
          streak: 7,
        },
      }),
      prisma.user.create({
        data: {
          email: "student3@hubx.com",
          password: hashedPassword,
          firstName: "Rohan",
          lastName: "Verma",
          role: "STUDENT",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student3",
          streak: 3,
        },
      }),
      prisma.user.create({
        data: {
          email: "student4@hubx.com",
          password: hashedPassword,
          firstName: "Anjali",
          lastName: "Gupta",
          role: "STUDENT",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student4",
          streak: 20,
        },
      }),
      prisma.user.create({
        data: {
          email: "student5@hubx.com",
          password: hashedPassword,
          firstName: "Nikhil",
          lastName: "Reddy",
          role: "STUDENT",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student5",
          streak: 9,
        },
      }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    const [admin, teacher1, teacher2, teacher3, student1, student2, student3, student4, student5] = users;

    // ============================================
    // 2. CREATE ORGANIZATIONS
    // ============================================
    console.log("🏢 Creating organizations...");
    const organizations = await Promise.all([
      prisma.organization.create({
        data: {
          name: "Delhi Public School",
          type: "SCHOOL",
          code: "DPS_DELHI",
          description: "Premium school in Delhi",
          email: "dps@school.com",
          phone: "011-1234-5678",
          address: "New Delhi, India",
        },
      }),
      prisma.organization.create({
        data: {
          name: "Mumbai University",
          type: "UNIVERSITY",
          code: "MU_MUMBAI",
          description: "Top university in Mumbai",
          email: "mu@university.com",
          phone: "022-9876-5432",
          address: "Mumbai, India",
        },
      }),
      prisma.organization.create({
        data: {
          name: "Bangalore Institute",
          type: "INSTITUTE",
          code: "BI_BANGALORE",
          description: "Technology institute",
          email: "bi@institute.com",
          phone: "080-5555-6666",
          address: "Bangalore, India",
        },
      }),
    ]);

    console.log(`✅ Created ${organizations.length} organizations`);

    const [org1, org2, org3] = organizations;

    // ============================================
    // 3. CREATE ORGANIZATION MEMBERS
    // ============================================
    console.log("👥 Creating organization members...");
    await Promise.all([
      prisma.organizationMember.create({
        data: {
          userId: teacher1.id,
          organizationId: org1.id,
          role: "TEACHER",
          employeeId: "EMP001",
          department: "Science",
        },
      }),
      prisma.organizationMember.create({
        data: {
          userId: teacher2.id,
          organizationId: org2.id,
          role: "TEACHER",
          employeeId: "EMP002",
          department: "Mathematics",
        },
      }),
      prisma.organizationMember.create({
        data: {
          userId: teacher3.id,
          organizationId: org3.id,
          role: "TEACHER",
          employeeId: "EMP003",
          department: "English",
        },
      }),
      prisma.organizationMember.create({
        data: {
          userId: student1.id,
          organizationId: org1.id,
          role: "STUDENT",
          studentId: "STU001",
          department: "Science",
        },
      }),
      prisma.organizationMember.create({
        data: {
          userId: student2.id,
          organizationId: org2.id,
          role: "STUDENT",
          studentId: "STU002",
          department: "Mathematics",
        },
      }),
      prisma.organizationMember.create({
        data: {
          userId: student3.id,
          organizationId: org1.id,
          role: "STUDENT",
          studentId: "STU003",
          department: "Science",
        },
      }),
      prisma.organizationMember.create({
        data: {
          userId: student4.id,
          organizationId: org2.id,
          role: "STUDENT",
          studentId: "STU004",
          department: "Mathematics",
        },
      }),
      prisma.organizationMember.create({
        data: {
          userId: student5.id,
          organizationId: org3.id,
          role: "STUDENT",
          studentId: "STU005",
          department: "English",
        },
      }),
    ]);

    console.log("✅ Created organization members");

    // ============================================
    // 4. CREATE STANDARDS (created by teachers)
    // ============================================
    console.log("📚 Creating standards...");
    const standards = await Promise.all([
      prisma.standard.create({
        data: {
          name: "9",
          teacherId: teacher1.id,
        },
      }),
      prisma.standard.create({
        data: {
          name: "10",
          teacherId: teacher1.id,
        },
      }),
      prisma.standard.create({
        data: {
          name: "11",
          teacherId: teacher2.id,
        },
      }),
      prisma.standard.create({
        data: {
          name: "12",
          teacherId: teacher2.id,
        },
      }),
      prisma.standard.create({
        data: {
          name: "8",
          teacherId: teacher3.id,
        },
      }),
      prisma.standard.create({
        data: {
          name: "Guni",
          description: "College-level custom standard",
          teacherId: teacher1.id,
        },
      }),
    ]);

    console.log(`✅ Created ${standards.length} standards`);

    const [std9, std10, std11, std12, std8, stdGuni] = standards;

    // ============================================
    // 5. CREATE SUBJECTS
    // ============================================
    console.log("🔬 Creating subjects...");
    const subjects = await Promise.all([
      // Standard 9 subjects
      prisma.subject.create({
        data: {
          name: "Science",
          standardId: std9.id,
        },
      }),
      prisma.subject.create({
        data: {
          name: "Mathematics",
          standardId: std9.id,
        },
      }),
      prisma.subject.create({
        data: {
          name: "English",
          standardId: std9.id,
        },
      }),
      // Standard 10 subjects
      prisma.subject.create({
        data: {
          name: "Science",
          standardId: std10.id,
        },
      }),
      prisma.subject.create({
        data: {
          name: "Mathematics",
          standardId: std10.id,
        },
      }),
      prisma.subject.create({
        data: {
          name: "History",
          standardId: std10.id,
        },
      }),
      // Standard 11 subjects
      prisma.subject.create({
        data: {
          name: "Physics",
          standardId: std11.id,
        },
      }),
      prisma.subject.create({
        data: {
          name: "Chemistry",
          standardId: std11.id,
        },
      }),
      prisma.subject.create({
        data: {
          name: "Biology",
          standardId: std11.id,
        },
      }),
      // Guni subjects
      prisma.subject.create({
        data: {
          name: "Data Structures",
          standardId: stdGuni.id,
        },
      }),
      prisma.subject.create({
        data: {
          name: "Web Development",
          standardId: stdGuni.id,
        },
      }),
      prisma.subject.create({
        data: {
          name: "Database Design",
          standardId: stdGuni.id,
        },
      }),
    ]);

    console.log(`✅ Created ${subjects.length} subjects`);

    const [sci9, math9, eng9, sci10, math10, hist10, phys11, chem11, bio11, ds, web, db] = subjects;

    // ============================================
    // 6. CREATE CHAPTERS
    // ============================================
    console.log("📖 Creating chapters...");
    const chapters = await Promise.all([
      // Science 9
      prisma.chapter.create({
        data: {
          name: "Matter and its Properties",
          subjectId: sci9.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Motion and Force",
          subjectId: sci9.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Energy and Work",
          subjectId: sci9.id,
        },
      }),
      // Math 9
      prisma.chapter.create({
        data: {
          name: "Algebra Basics",
          subjectId: math9.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Geometry and Shapes",
          subjectId: math9.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Trigonometry",
          subjectId: math9.id,
        },
      }),
      // Science 10
      prisma.chapter.create({
        data: {
          name: "Chemical Reactions",
          subjectId: sci10.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Electricity",
          subjectId: sci10.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Light and Sound",
          subjectId: sci10.id,
        },
      }),
      // Physics 11
      prisma.chapter.create({
        data: {
          name: "Mechanics",
          subjectId: phys11.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Thermodynamics",
          subjectId: phys11.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Waves and Oscillations",
          subjectId: phys11.id,
        },
      }),
      // Data Structures chapters
      prisma.chapter.create({
        data: {
          name: "Arrays and Lists",
          subjectId: ds.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Trees and Graphs",
          subjectId: ds.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Sorting and Searching",
          subjectId: ds.id,
        },
      }),
      // Web Development chapters
      prisma.chapter.create({
        data: {
          name: "HTML and CSS Basics",
          subjectId: web.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "JavaScript Fundamentals",
          subjectId: web.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "React Framework",
          subjectId: web.id,
        },
      }),
      // Database Design chapters
      prisma.chapter.create({
        data: {
          name: "SQL Basics",
          subjectId: db.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Normalization",
          subjectId: db.id,
        },
      }),
      prisma.chapter.create({
        data: {
          name: "Advanced Queries",
          subjectId: db.id,
        },
      }),
    ]);

    console.log(`✅ Created ${chapters.length} chapters`);

    // ============================================
    // 7. CREATE PAPERS
    // ============================================
    console.log("📄 Creating papers...");
    const papers = await Promise.all([
      // Teacher 1 papers
      prisma.paper.create({
        data: {
          title: "Class 9 Science - Unit Test",
          description: "Comprehensive test on Matter and Properties",
          standard: 9,
          teacherId: teacher1.id,
          subjectId: sci9.id,
          difficulty: "EASY",
          type: "TIME_BOUND",
          duration: 45,
          status: "PUBLISHED",
          isPublic: true,
          price: 50,
          totalAttempts: 23,
          averageScore: 75.5,
        },
      }),
      prisma.paper.create({
        data: {
          title: "Class 9 Mathematics - Half Yearly",
          description: "Half yearly exam covering algebra and geometry",
          standard: 9,
          teacherId: teacher1.id,
          subjectId: math9.id,
          difficulty: "INTERMEDIATE",
          type: "TIME_BOUND",
          duration: 90,
          status: "PUBLISHED",
          isPublic: true,
          price: 100,
          totalAttempts: 45,
          averageScore: 68.3,
        },
      }),
      prisma.paper.create({
        data: {
          title: "Class 9 Science - Practice Quiz",
          description: "Quick practice quiz on motion and force",
          standard: 9,
          teacherId: teacher1.id,
          subjectId: sci9.id,
          difficulty: "EASY",
          type: "NO_LIMIT",
          status: "DRAFT",
          isPublic: false,
          totalAttempts: 0,
          averageScore: 0,
        },
      }),
      // Teacher 2 papers
      prisma.paper.create({
        data: {
          title: "Class 10 Mathematics - Advanced",
          description: "Advanced problems for gifted students",
          standard: 10,
          teacherId: teacher2.id,
          subjectId: math10.id,
          difficulty: "ADVANCED",
          type: "TIME_BOUND",
          duration: 120,
          status: "PUBLISHED",
          isPublic: true,
          price: 150,
          totalAttempts: 56,
          averageScore: 72.1,
        },
      }),
      prisma.paper.create({
        data: {
          title: "Class 10 Science - Final Exam",
          description: "Complete science curriculum assessment",
          standard: 10,
          teacherId: teacher2.id,
          subjectId: sci10.id,
          difficulty: "INTERMEDIATE",
          type: "TIME_BOUND",
          duration: 180,
          status: "PUBLISHED",
          isPublic: true,
          price: 200,
          totalAttempts: 78,
          averageScore: 65.8,
        },
      }),
      prisma.paper.create({
        data: {
          title: "Class 10 History - Quick Test",
          description: "Brief assessment on historical events",
          standard: 10,
          teacherId: teacher2.id,
          subjectId: hist10.id,
          difficulty: "EASY",
          type: "TIME_BOUND",
          duration: 30,
          status: "DRAFT",
          isPublic: false,
          totalAttempts: 0,
          averageScore: 0,
        },
      }),
      // Teacher 3 papers
      prisma.paper.create({
        data: {
          title: "Class 11 Physics - Mechanics",
          description: "In-depth mechanics problem solving",
          standard: 11,
          teacherId: teacher3.id,
          subjectId: phys11.id,
          difficulty: "ADVANCED",
          type: "TIME_BOUND",
          duration: 150,
          status: "PUBLISHED",
          isPublic: true,
          price: 250,
          totalAttempts: 34,
          averageScore: 58.9,
        },
      }),
      prisma.paper.create({
        data: {
          title: "Class 11 Chemistry - Basics",
          description: "Fundamental chemistry concepts",
          standard: 11,
          teacherId: teacher3.id,
          subjectId: chem11.id,
          difficulty: "INTERMEDIATE",
          type: "TIME_BOUND",
          duration: 90,
          status: "PUBLISHED",
          isPublic: true,
          price: 120,
          totalAttempts: 42,
          averageScore: 71.4,
        },
      }),
      prisma.paper.create({
        data: {
          title: "Class 11 Biology - Revision",
          description: "Quick revision test for biology",
          standard: 11,
          teacherId: teacher3.id,
          subjectId: bio11.id,
          difficulty: "EASY",
          type: "NO_LIMIT",
          status: "DRAFT",
          isPublic: false,
          totalAttempts: 0,
          averageScore: 0,
        },
      }),
    ]);

    console.log(`✅ Created ${papers.length} papers`);

    // ============================================
    // 8. CREATE PAPER-CHAPTER ASSOCIATIONS
    // ============================================
    console.log("🔗 Creating paper-chapter associations...");
    await Promise.all([
      prisma.paperChapter.create({
        data: {
          paperId: papers[0].id,
          chapterId: chapters[0].id,
        },
      }),
      prisma.paperChapter.create({
        data: {
          paperId: papers[0].id,
          chapterId: chapters[1].id,
        },
      }),
      prisma.paperChapter.create({
        data: {
          paperId: papers[1].id,
          chapterId: chapters[3].id,
        },
      }),
      prisma.paperChapter.create({
        data: {
          paperId: papers[3].id,
          chapterId: chapters[4].id,
        },
      }),
      prisma.paperChapter.create({
        data: {
          paperId: papers[4].id,
          chapterId: chapters[6].id,
        },
      }),
    ]);

    console.log("✅ Created paper-chapter associations");

    // ============================================
    // 9. CREATE QUESTIONS
    // ============================================
    console.log("❓ Creating questions...");
    const questions = await Promise.all([
      // Paper 1 - Science questions
      prisma.question.create({
        data: {
          paperId: papers[0].id,
          type: "MCQ",
          difficulty: "EASY",
          questionText: "What is the smallest unit of matter?",
          options: JSON.stringify(["Atom", "Molecule", "Electron", "Nucleus"]),
          correctOption: 0,
          solutionText: "An atom is the smallest unit of matter that retains the properties of the element.",
          marks: 1,
          order: 1,
        },
      }),
      prisma.question.create({
        data: {
          paperId: papers[0].id,
          type: "FILL_IN_THE_BLANKS",
          difficulty: "EASY",
          questionText: "The process of ___ converts ice to water vapor.",
          options: JSON.stringify([["sublimation"]]),
          caseSensitive: false,
          solutionText: "Sublimation is the process where solid directly converts to gas.",
          marks: 1,
          order: 2,
        },
      }),
      prisma.question.create({
        data: {
          paperId: papers[0].id,
          type: "TEXT",
          difficulty: "INTERMEDIATE",
          questionText: "Explain the differences between physical and chemical changes.",
          solutionText: "Physical changes don't alter the substance's identity (e.g., melting). Chemical changes create new substances (e.g., burning).",
          marks: 3,
          order: 3,
        },
      }),
      // Paper 2 - Math questions
      prisma.question.create({
        data: {
          paperId: papers[1].id,
          type: "MCQ",
          difficulty: "INTERMEDIATE",
          questionText: "Solve for x: 2x + 5 = 15",
          options: JSON.stringify(["3", "5", "7", "10"]),
          correctOption: 1,
          solutionText: "2x + 5 = 15 → 2x = 10 → x = 5",
          marks: 1,
          order: 1,
        },
      }),
      prisma.question.create({
        data: {
          paperId: papers[1].id,
          type: "FILL_IN_THE_BLANKS",
          difficulty: "INTERMEDIATE",
          questionText: "The sum of angles in a triangle is ___°",
          options: JSON.stringify([["180", "180 degrees"]]),
          caseSensitive: false,
          solutionText: "The sum of all angles in any triangle is always 180 degrees.",
          marks: 1,
          order: 2,
        },
      }),
      prisma.question.create({
        data: {
          paperId: papers[1].id,
          type: "TEXT",
          difficulty: "ADVANCED",
          questionText: "Prove that the angles of a triangle sum to 180 degrees.",
          solutionText: "Using parallel line properties and alternate interior angles theorem.",
          marks: 5,
          order: 3,
        },
      }),
      // Paper 4 - Math Advanced
      prisma.question.create({
        data: {
          paperId: papers[3].id,
          type: "MCQ",
          difficulty: "ADVANCED",
          questionText: "What is the limit of (sin x)/x as x approaches 0?",
          options: JSON.stringify(["0", "1", "Undefined", "∞"]),
          correctOption: 1,
          solutionText: "This is a fundamental limit in calculus. Using L'Hôpital's rule or Taylor series, the limit is 1.",
          marks: 2,
          order: 1,
        },
      }),
      prisma.question.create({
        data: {
          paperId: papers[3].id,
          type: "TEXT",
          difficulty: "ADVANCED",
          questionText: "Solve the differential equation: dy/dx + y = e^(-x)",
          solutionText: "Using integrating factor method: y = (x + C)e^(-x)",
          marks: 5,
          order: 2,
        },
      }),
      prisma.question.create({
        data: {
          paperId: papers[3].id,
          type: "FILL_IN_THE_BLANKS",
          difficulty: "ADVANCED",
          questionText: "The derivative of x³ is ___",
          options: JSON.stringify([["3x^2", "3x²"]]),
          caseSensitive: false,
          solutionText: "Using the power rule: d/dx(x³) = 3x²",
          marks: 1,
          order: 3,
        },
      }),
      // Paper 7 - Physics
      prisma.question.create({
        data: {
          paperId: papers[6].id,
          type: "MCQ",
          difficulty: "ADVANCED",
          questionText: "What is the SI unit of force?",
          options: JSON.stringify(["Dyne", "Newton", "Joule", "Pascal"]),
          correctOption: 1,
          solutionText: "Newton (N) is the SI unit of force. 1 N = 1 kg⋅m/s²",
          marks: 1,
          order: 1,
        },
      }),
      prisma.question.create({
        data: {
          paperId: papers[6].id,
          type: "TEXT",
          difficulty: "ADVANCED",
          questionText: "A 5 kg object is accelerated at 2 m/s². Calculate the force applied.",
          solutionText: "F = ma = 5 × 2 = 10 N",
          marks: 2,
          order: 2,
        },
      }),
      prisma.question.create({
        data: {
          paperId: papers[6].id,
          type: "FILL_IN_THE_BLANKS",
          difficulty: "ADVANCED",
          questionText: "Newton's second law states F = ___",
          options: JSON.stringify([["ma", "m×a"]]),
          caseSensitive: false,
          solutionText: "F = ma (Force equals mass times acceleration)",
          marks: 1,
          order: 3,
        },
      }),
    ]);

    console.log(`✅ Created ${questions.length} questions`);

    // ============================================
    // 10. CREATE PAYMENTS
    // ============================================
    console.log("💳 Creating payments...");
    const payments = await Promise.all([
      prisma.payment.create({
        data: {
          userId: student1.id,
          orderId: "ORD_001",
          paymentId: "PAY_001",
          signature: "SIG_001",
          amount: 100,
          status: "SUCCESS",
        },
      }),
      prisma.payment.create({
        data: {
          userId: student2.id,
          orderId: "ORD_002",
          paymentId: "PAY_002",
          signature: "SIG_002",
          amount: 250,
          status: "SUCCESS",
        },
      }),
      prisma.payment.create({
        data: {
          userId: student3.id,
          orderId: "ORD_003",
          amount: 150,
          status: "PENDING",
        },
      }),
      prisma.payment.create({
        data: {
          userId: student4.id,
          orderId: "ORD_004",
          paymentId: "PAY_004",
          signature: "SIG_004",
          amount: 200,
          status: "SUCCESS",
        },
      }),
      prisma.payment.create({
        data: {
          userId: student5.id,
          orderId: "ORD_005",
          amount: 50,
          status: "FAILED",
        },
      }),
    ]);

    console.log(`✅ Created ${payments.length} payments`);

    // ============================================
    // 11. CREATE PAPER PURCHASES
    // ============================================
    console.log("🛒 Creating paper purchases...");
    await Promise.all([
      prisma.paperPurchase.create({
        data: {
          paperId: papers[0].id,
          studentId: student1.id,
          paymentId: payments[0].id,
          price: 50,
        },
      }),
      prisma.paperPurchase.create({
        data: {
          paperId: papers[3].id,
          studentId: student2.id,
          paymentId: payments[1].id,
          price: 150,
        },
      }),
      prisma.paperPurchase.create({
        data: {
          paperId: papers[4].id,
          studentId: student1.id,
          paymentId: payments[3].id,
          price: 200,
        },
      }),
      prisma.paperPurchase.create({
        data: {
          paperId: papers[1].id,
          studentId: student4.id,
          paymentId: payments[3].id,
          price: 100,
        },
      }),
    ]);

    console.log("✅ Created paper purchases");

    // ============================================
    // 12. CREATE EXAM ATTEMPTS
    // ============================================
    console.log("📊 Creating exam attempts...");
    const examAttempts = await Promise.all([
      prisma.examAttempt.create({
        data: {
          paperId: papers[0].id,
          studentId: student1.id,
          status: "SUBMITTED",
          startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
          totalScore: 20,
          totalMarks: 25,
          percentage: 80,
          timeSpent: 2700,
        },
      }),
      prisma.examAttempt.create({
        data: {
          paperId: papers[1].id,
          studentId: student1.id,
          status: "SUBMITTED",
          startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 85 * 60 * 1000),
          totalScore: 65,
          totalMarks: 100,
          percentage: 65,
          timeSpent: 5100,
        },
      }),
      prisma.examAttempt.create({
        data: {
          paperId: papers[0].id,
          studentId: student2.id,
          status: "SUBMITTED",
          startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000),
          totalScore: 18,
          totalMarks: 25,
          percentage: 72,
          timeSpent: 2400,
        },
      }),
      prisma.examAttempt.create({
        data: {
          paperId: papers[3].id,
          studentId: student2.id,
          status: "SUBMITTED",
          startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 110 * 60 * 1000),
          totalScore: 180,
          totalMarks: 250,
          percentage: 72,
          timeSpent: 6600,
        },
      }),
      prisma.examAttempt.create({
        data: {
          paperId: papers[4].id,
          studentId: student3.id,
          status: "SUBMITTED",
          startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 165 * 60 * 1000),
          totalScore: 145,
          totalMarks: 200,
          percentage: 72.5,
          timeSpent: 9900,
        },
      }),
    ]);

    console.log(`✅ Created ${examAttempts.length} exam attempts`);

    // ============================================
    // 13. CREATE STUDENT ANSWERS
    // ============================================
    console.log("📝 Creating student answers...");
    await Promise.all([
      // Answers for exam attempt 1
      prisma.studentAnswer.create({
        data: {
          attemptId: examAttempts[0].id,
          questionId: questions[0].id,
          studentId: student1.id,
          selectedOption: 0,
          isCorrect: true,
          marksObtained: 1,
        },
      }),
      prisma.studentAnswer.create({
        data: {
          attemptId: examAttempts[0].id,
          questionId: questions[1].id,
          studentId: student1.id,
          answerText: "sublimation",
          isCorrect: true,
          marksObtained: 1,
        },
      }),
      prisma.studentAnswer.create({
        data: {
          attemptId: examAttempts[0].id,
          questionId: questions[2].id,
          studentId: student1.id,
          answerText: "Physical changes don't alter substance identity while chemical changes do.",
          marksObtained: 2,
          isCorrect: true,
        },
      }),
      // Answers for exam attempt 2
      prisma.studentAnswer.create({
        data: {
          attemptId: examAttempts[1].id,
          questionId: questions[3].id,
          studentId: student1.id,
          selectedOption: 1,
          isCorrect: true,
          marksObtained: 1,
        },
      }),
      prisma.studentAnswer.create({
        data: {
          attemptId: examAttempts[1].id,
          questionId: questions[4].id,
          studentId: student1.id,
          answerText: "180",
          isCorrect: true,
          marksObtained: 1,
        },
      }),
      prisma.studentAnswer.create({
        data: {
          attemptId: examAttempts[1].id,
          questionId: questions[5].id,
          studentId: student1.id,
          answerText: "Using parallel lines and alternate interior angles.",
          marksObtained: 3,
          isCorrect: true,
        },
      }),
      // Answers for exam attempt 3
      prisma.studentAnswer.create({
        data: {
          attemptId: examAttempts[2].id,
          questionId: questions[0].id,
          studentId: student2.id,
          selectedOption: 0,
          isCorrect: true,
          marksObtained: 1,
        },
      }),
      prisma.studentAnswer.create({
        data: {
          attemptId: examAttempts[2].id,
          questionId: questions[1].id,
          studentId: student2.id,
          answerText: "sublimation",
          isCorrect: true,
          marksObtained: 1,
        },
      }),
      // Answers for exam attempt 4
      prisma.studentAnswer.create({
        data: {
          attemptId: examAttempts[3].id,
          questionId: questions[6].id,
          studentId: student2.id,
          selectedOption: 1,
          isCorrect: true,
          marksObtained: 2,
        },
      }),
      prisma.studentAnswer.create({
        data: {
          attemptId: examAttempts[3].id,
          questionId: questions[7].id,
          studentId: student2.id,
          answerText: "y = (x + C)e^(-x)",
          marksObtained: 3,
          isCorrect: true,
        },
      }),
    ]);

    console.log("✅ Created student answers");

    // ============================================
    // 14. CREATE DOUBTS
    // ============================================
    console.log("❔ Creating doubts...");
    const doubts = await Promise.all([
      prisma.doubt.create({
        data: {
          attemptId: examAttempts[0].id,
          questionId: questions[2].id,
          studentId: student1.id,
          doubtText: "Can you explain the difference with more examples?",
          isResolved: true,
          teacherReply: "Sure! Physical: ice melting (still water). Chemical: paper burning (becomes ash, new substance).",
          repliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          repliedBy: teacher1.id,
        },
      }),
      prisma.doubt.create({
        data: {
          attemptId: examAttempts[1].id,
          questionId: questions[5].id,
          studentId: student1.id,
          doubtText: "How to apply alternate interior angles theorem here?",
          isResolved: false,
        },
      }),
      prisma.doubt.create({
        data: {
          attemptId: examAttempts[2].id,
          questionId: questions[0].id,
          studentId: student2.id,
          doubtText: "Is electron not a valid answer?",
          isResolved: true,
          teacherReply: "Electrons are subatomic particles within atoms, not the smallest unit of matter.",
          repliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          repliedBy: teacher1.id,
        },
      }),
    ]);

    console.log(`✅ Created ${doubts.length} doubts`);

    // ============================================
    // 15. CREATE CHAT ROOMS
    // ============================================
    console.log("💬 Creating chat rooms...");
    const chatRooms = await Promise.all([
      prisma.chatRoom.create({
        data: {
          paperId: papers[0].id,
        },
      }),
      prisma.chatRoom.create({
        data: {
          paperId: papers[1].id,
        },
      }),
      prisma.chatRoom.create({
        data: {
          paperId: papers[3].id,
        },
      }),
    ]);

    console.log(`✅ Created ${chatRooms.length} chat rooms`);

    // ============================================
    // 16. CREATE CHAT MESSAGES
    // ============================================
    console.log("💭 Creating chat messages...");
    await Promise.all([
      prisma.chatMessage.create({
        data: {
          roomId: chatRooms[0].id,
          senderId: teacher1.id,
          message: "Welcome everyone! This paper covers the basics of matter.",
          isRead: true,
        },
      }),
      prisma.chatMessage.create({
        data: {
          roomId: chatRooms[0].id,
          senderId: student1.id,
          message: "Thanks! I have a question about sublimation.",
          isRead: true,
        },
      }),
      prisma.chatMessage.create({
        data: {
          roomId: chatRooms[0].id,
          senderId: teacher1.id,
          receiverId: student1.id,
          message: "Sublimation is when a solid directly becomes a gas without melting.",
          isRead: false,
        },
      }),
      prisma.chatMessage.create({
        data: {
          roomId: chatRooms[1].id,
          senderId: teacher2.id,
          message: "Start solving the algebra problems. You have 90 minutes.",
          isRead: true,
        },
      }),
      prisma.chatMessage.create({
        data: {
          roomId: chatRooms[1].id,
          senderId: student1.id,
          message: "Question 3 is difficult. Can I get a hint?",
          isRead: true,
        },
      }),
      prisma.chatMessage.create({
        data: {
          roomId: chatRooms[2].id,
          senderId: teacher2.id,
          message: "Advanced mathematics requires careful problem solving.",
          isRead: true,
        },
      }),
    ]);

    console.log("✅ Created chat messages");

    // ============================================
    // 17. CREATE PAPER COUPONS
    // ============================================
    console.log("🎟️ Creating paper coupons...");
    await Promise.all([
      prisma.paperCoupon.create({
        data: {
          paperId: papers[0].id,
          studentId: student1.id,
          code: "PAPER-SCI-001",
          isUsed: true,
          usedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.paperCoupon.create({
        data: {
          paperId: papers[1].id,
          studentId: student2.id,
          code: "PAPER-MATH-002",
          isUsed: false,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.paperCoupon.create({
        data: {
          paperId: papers[3].id,
          studentId: student3.id,
          code: "PAPER-ADV-003",
          isUsed: false,
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    console.log("✅ Created paper coupons");

    // ============================================
    // 18. CREATE NOTIFICATIONS
    // ============================================
    console.log("🔔 Creating notifications...");
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: student1.id,
          title: "Paper Assigned",
          message: "Your teacher assigned a new paper: Class 9 Science - Unit Test",
          type: "INFO",
          actionUrl: "/papers/1",
          isRead: true,
        },
      }),
      prisma.notification.create({
        data: {
          userId: student1.id,
          title: "Doubt Replied",
          message: "Your doubt about physical and chemical changes has been answered.",
          type: "SUCCESS",
          actionUrl: "/doubts/1",
          isRead: false,
        },
      }),
      prisma.notification.create({
        data: {
          userId: student2.id,
          title: "Payment Successful",
          message: "Your payment of ₹250 has been processed successfully.",
          type: "SUCCESS",
          isRead: true,
        },
      }),
      prisma.notification.create({
        data: {
          userId: student3.id,
          title: "Paper Available",
          message: "A new public paper is available for purchase.",
          type: "INFO",
          actionUrl: "/papers/3",
        },
      }),
      prisma.notification.create({
        data: {
          userId: student4.id,
          title: "Exam Submitted",
          message: "Your exam has been submitted. Results will be available soon.",
          type: "INFO",
        },
      }),
      prisma.notification.create({
        data: {
          userId: teacher1.id,
          title: "New Student Answer",
          message: "Student submitted answers for Class 9 Science test.",
          type: "INFO",
          actionUrl: "/results/1",
        },
      }),
    ]);

    console.log("✅ Created notifications");

    // ============================================
    // 19. CREATE ACHIEVEMENTS
    // ============================================
    console.log("🏆 Creating achievements...");
    const achievements = await Promise.all([
      prisma.achievement.create({
        data: {
          title: "First Steps",
          description: "Take your first assessment",
          icon: "star",
          color: "from-yellow-400 to-orange-500",
          type: "first_assessment",
        },
      }),
      prisma.achievement.create({
        data: {
          title: "Perfect Score",
          description: "Score 100% on any assessment",
          icon: "medal",
          color: "from-blue-400 to-purple-500",
          type: "perfect_score",
          threshold: 100,
        },
      }),
      prisma.achievement.create({
        data: {
          title: "Streak Master",
          description: "Maintain a 7-day streak",
          icon: "flame",
          color: "from-red-400 to-pink-500",
          type: "streak",
          threshold: 7,
        },
      }),
    ]);

    console.log(`✅ Created ${achievements.length} achievements`);

    // ============================================
    // 20. CREATE USER ACHIEVEMENTS
    // ============================================
    console.log("🎖️ Creating user achievements...");
    await Promise.all([
      prisma.userAchievement.create({
        data: {
          userId: student1.id,
          achievementId: achievements[0].id,
          earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.userAchievement.create({
        data: {
          userId: student1.id,
          achievementId: achievements[2].id,
          earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.userAchievement.create({
        data: {
          userId: student4.id,
          achievementId: achievements[0].id,
          earnedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.userAchievement.create({
        data: {
          userId: student4.id,
          achievementId: achievements[1].id,
          earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.userAchievement.create({
        data: {
          userId: student4.id,
          achievementId: achievements[2].id,
          earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    console.log("✅ Created user achievements");

    // ============================================
    // 21. CREATE STUDENT PROFILES
    // ============================================
    console.log("👤 Creating student profiles...");
    await Promise.all([
      prisma.studentProfile.create({
        data: {
          userId: student1.id,
          phone: "+91-9876543210",
          address: "123 School Street, Delhi",
          dateOfBirth: new Date("2008-05-15"),
        },
      }),
      prisma.studentProfile.create({
        data: {
          userId: student2.id,
          phone: "+91-9876543211",
          address: "456 College Road, Mumbai",
          dateOfBirth: new Date("2007-08-20"),
        },
      }),
      prisma.studentProfile.create({
        data: {
          userId: student3.id,
          phone: "+91-9876543212",
          address: "789 University Lane, Bangalore",
          dateOfBirth: new Date("2008-12-10"),
        },
      }),
      prisma.studentProfile.create({
        data: {
          userId: student4.id,
          phone: "+91-9876543213",
          address: "321 Campus Avenue, Pune",
          dateOfBirth: new Date("2007-03-25"),
        },
      }),
      prisma.studentProfile.create({
        data: {
          userId: student5.id,
          phone: "+91-9876543214",
          address: "654 Institute Building, Chennai",
          dateOfBirth: new Date("2008-07-18"),
        },
      }),
    ]);

    console.log("✅ Created student profiles");

    // ============================================
    // 22. CREATE STUDENT SETTINGS
    // ============================================
    console.log("⚙️ Creating student settings...");
    await Promise.all([
      prisma.studentSettings.create({
        data: {
          userId: student1.id,
          emailNotifications: true,
          pushNotifications: true,
          assignmentNotifications: true,
          assessmentNotifications: true,
          profileVisibility: "public",
          language: "en",
          theme: "light",
        },
      }),
      prisma.studentSettings.create({
        data: {
          userId: student2.id,
          emailNotifications: true,
          pushNotifications: false,
          assignmentNotifications: true,
          assessmentNotifications: false,
          profileVisibility: "friends",
          language: "gu",
          theme: "dark",
        },
      }),
      prisma.studentSettings.create({
        data: {
          userId: student3.id,
          emailNotifications: false,
          pushNotifications: true,
          assignmentNotifications: true,
          assessmentNotifications: true,
          profileVisibility: "private",
          language: "hi",
          theme: "light",
        },
      }),
      prisma.studentSettings.create({
        data: {
          userId: student4.id,
          emailNotifications: true,
          pushNotifications: true,
          assignmentNotifications: true,
          assessmentNotifications: true,
          profileVisibility: "public",
          language: "en",
          theme: "dark",
        },
      }),
      prisma.studentSettings.create({
        data: {
          userId: student5.id,
          emailNotifications: true,
          pushNotifications: true,
          assignmentNotifications: false,
          assessmentNotifications: true,
          profileVisibility: "friends",
          language: "en",
          theme: "light",
        },
      }),
    ]);

    console.log("✅ Created student settings");

    // ============================================
    // 23. CREATE QUESTION BANK
    // ============================================
    console.log("📚 Creating question bank...");
    const bankQuestions = await Promise.all([
      prisma.questionBank.create({
        data: {
          teacherId: teacher1.id,
          type: "MCQ",
          difficulty: "EASY",
          questionText: "Define velocity.",
          options: JSON.stringify([
            "Speed with direction",
            "Rate of change",
            "Distance traveled",
            "Time taken",
          ]),
          correctOption: 0,
          solutionText: "Velocity is speed in a specific direction.",
          marks: 1,
          subjectId: sci9.id,
          tags: JSON.stringify(["physics", "motion", "basics"]),
        },
      }),
      prisma.questionBank.create({
        data: {
          teacherId: teacher2.id,
          type: "FILL_IN_THE_BLANKS",
          difficulty: "INTERMEDIATE",
          questionText: "The area of a circle is π___²",
          options: JSON.stringify([["r", "R"]]),
          caseSensitive: false,
          solutionText: "Area = πr² where r is radius",
          marks: 1,
          subjectId: math10.id,
          tags: JSON.stringify(["geometry", "circle", "formulas"]),
        },
      }),
      prisma.questionBank.create({
        data: {
          teacherId: teacher3.id,
          type: "TEXT",
          difficulty: "ADVANCED",
          questionText: "Explain the concept of entropy.",
          solutionText: "Entropy measures disorder or randomness in a system.",
          marks: 3,
          subjectId: chem11.id,
          tags: JSON.stringify(["thermodynamics", "chemistry", "advanced"]),
        },
      }),
    ]);

    console.log(`✅ Created ${bankQuestions.length} question bank entries`);

    // ============================================
    // 24. CREATE QUESTION BANK CHAPTERS
    // ============================================
    console.log("🔗 Creating question bank chapters...");
    await Promise.all([
      prisma.questionBankChapter.create({
        data: {
          questionBankId: bankQuestions[0].id,
          chapterId: chapters[1].id,
        },
      }),
      prisma.questionBankChapter.create({
        data: {
          questionBankId: bankQuestions[1].id,
          chapterId: chapters[4].id,
        },
      }),
      prisma.questionBankChapter.create({
        data: {
          questionBankId: bankQuestions[2].id,
          chapterId: chapters[7].id,
        },
      }),
    ]);

    console.log("✅ Created question bank chapters");

    // ============================================
    // 25. CREATE QUESTION BANK PAPER LINKS
    // ============================================
    console.log("🔗 Creating question bank paper links...");
    await Promise.all([
      prisma.questionBankPaperLink.create({
        data: {
          questionBankId: bankQuestions[0].id,
          questionId: questions[0].id,
        },
      }),
      prisma.questionBankPaperLink.create({
        data: {
          questionBankId: bankQuestions[1].id,
          questionId: questions[4].id,
        },
      }),
    ]);

    console.log("✅ Created question bank paper links");

    // ============================================
    // 26. CREATE SUPPORT TICKETS
    // ============================================
    console.log("🎫 Creating support tickets...");
    const tickets = await Promise.all([
      prisma.supportTicket.create({
        data: {
          studentId: student1.id,
          subject: "Payment Issue",
          message: "I was charged twice for the same paper.",
          category: "PAYMENT",
          status: "RESOLVED",
          priority: "HIGH",
          assignedTo: teacher1.id,
          resolution: "Refund processed. Please check your account.",
          resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.supportTicket.create({
        data: {
          studentId: student2.id,
          subject: "Technical Issue",
          message: "Cannot submit answers. Page keeps refreshing.",
          category: "TECHNICAL",
          status: "IN_PROGRESS",
          priority: "CRITICAL",
          assignedTo: teacher2.id,
        },
      }),
      prisma.supportTicket.create({
        data: {
          studentId: student3.id,
          subject: "Content Question",
          message: "Chapter 5 material is incomplete.",
          category: "CONTENT",
          status: "OPEN",
          priority: "MEDIUM",
        },
      }),
      prisma.supportTicket.create({
        data: {
          studentId: student4.id,
          subject: "Account Issue",
          message: "Cannot reset my password.",
          category: "ACCOUNT",
          status: "RESOLVED",
          priority: "MEDIUM",
          resolution: "Password reset link sent to registered email.",
          resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.supportTicket.create({
        data: {
          studentId: student5.id,
          subject: "General Question",
          message: "How do I download certificates?",
          category: "OTHER",
          status: "OPEN",
          priority: "LOW",
        },
      }),
    ]);

    console.log(`✅ Created ${tickets.length} support tickets`);

    // ============================================
    // 27. CREATE SUPPORT TICKET REPLIES
    // ============================================
    console.log("💬 Creating support ticket replies...");
    await Promise.all([
      prisma.supportTicketReply.create({
        data: {
          ticketId: tickets[0].id,
          userId: teacher1.id,
          message: "We have processed your refund. It will appear in 3-5 business days.",
        },
      }),
      prisma.supportTicketReply.create({
        data: {
          ticketId: tickets[1].id,
          userId: teacher2.id,
          message: "We are investigating this issue. Can you try clearing your browser cache?",
        },
      }),
      prisma.supportTicketReply.create({
        data: {
          ticketId: tickets[1].id,
          userId: student2.id,
          message: "Cleared cache and it works now. Thank you!",
        },
      }),
      prisma.supportTicketReply.create({
        data: {
          ticketId: tickets[3].id,
          userId: teacher1.id,
          message: "Password reset instructions have been sent to your email address.",
        },
      }),
    ]);

    console.log("✅ Created support ticket replies");

    // ============================================
    // SUMMARY
    // ============================================
    console.log("\n✨ Database seeding completed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   ✅ Users: ${users.length}`);
    console.log(`   ✅ Organizations: ${organizations.length}`);
    console.log(`   ✅ Standards: ${standards.length}`);
    console.log(`   ✅ Subjects: ${subjects.length}`);
    console.log(`   ✅ Chapters: ${chapters.length}`);
    console.log(`   ✅ Papers: ${papers.length}`);
    console.log(`   ✅ Questions: ${questions.length}`);
    console.log(`   ✅ Exam Attempts: ${examAttempts.length}`);
    console.log(`   ✅ Payments: ${payments.length}`);
    console.log(`   ✅ Doubts: ${doubts.length}`);
    console.log(`   ✅ Chat Rooms: ${chatRooms.length}`);
    console.log(`   ✅ Achievements: ${achievements.length}`);
    console.log(`   ✅ Support Tickets: ${tickets.length}`);
    console.log(`   ✅ Question Bank: ${bankQuestions.length}`);
    console.log("\n🚀 Ready for testing!\n");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
