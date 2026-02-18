import prisma from "@config/database"

export class AnalyticsService {
  async getTeacherAnalytics(teacherId: string) {
    // Get teacher's papers
    const papers = await prisma.paper.findMany({
      where: { teacherId },
      include: {
        examAttempts: {
          include: {
            student: true
          }
        },
        subject: true,
        _count: { select: { examAttempts: true } },
      },
    })

    // Calculate total earnings
    const purchases = await prisma.paperPurchase.findMany({
      where: { paper: { teacherId } },
    })

    const totalEarnings = purchases.reduce((sum, p) => sum + p.price, 0)
    const totalPurchases = purchases.length  // Actual purchase count

    // Calculate statistics
    const totalAttempts = papers.reduce((sum, p) => sum + (p._count.examAttempts || 0), 0)

    // Trending Papers: papers that have at least 1 attempt in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const trendingPapersCount = await prisma.paper.count({
      where: {
        teacherId,
        examAttempts: {
          some: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }
      }
    })

    // Average score across all attempts (percentage)
    let totalScoreSum = 0;
    let totalScoreCount = 0;
    papers.forEach(p => {
      p.examAttempts.forEach(a => {
        totalScoreSum += a.percentage;
        totalScoreCount++;
      });
    });
    const averageScore = totalScoreCount > 0 ? totalScoreSum / totalScoreCount : 0;

    // Total Unique Students
    const uniqueStudents = new Set<string>();
    papers.forEach(p => {
      p.examAttempts.forEach(a => {
        uniqueStudents.add(a.studentId);
      });
    });

    // Student Performance by Subject
    const subjectStats = new Map<string, { totalScore: number; count: number }>();
    papers.forEach(p => {
      if (!p.subject) return;
      const subjectName = p.subject.name;

      p.examAttempts.forEach(a => {
        const current = subjectStats.get(subjectName) || { totalScore: 0, count: 0 };
        current.totalScore += a.percentage;
        current.count += 1;
        subjectStats.set(subjectName, current);
      });
    });

    const studentPerformance = Array.from(subjectStats.entries()).map(([subject, stats]) => ({
      subject,
      averageScore: stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0,
      totalAttempts: stats.count
    }));

    // Recent Activities (Recent exam submissions)
    const recentAttempts = await prisma.examAttempt.findMany({
      where: { paper: { teacherId }, status: "SUBMITTED" },
      orderBy: { submittedAt: 'desc' },
      take: 5,
      include: { paper: true, student: true }
    });

    const recentActivities = recentAttempts.map(a => ({
      id: a.id,
      type: 'EXAM_ATTEMPT',
      description: `${a.student.firstName} ${a.student.lastName} attempted ${a.paper.title} - Scored ${Math.round(a.percentage)}%`,
      timestamp: a.submittedAt ? a.submittedAt.toISOString() : new Date().toISOString()
    }));

    // --- REVENEU DATA (Monthly) ---
    const monthlyRevenue = new Map<string, number>()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    purchases.forEach((p) => {
      const date = new Date(p.createdAt)
      const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}` // Key: "Jan 2024"
      const current = monthlyRevenue.get(monthYear) || 0
      monthlyRevenue.set(monthYear, current + p.price)
    })

    // Sort by date logic
    const sortedRevenueKeys = Array.from(monthlyRevenue.keys()).sort((a, b) => {
      return new Date("01 " + a).getTime() - new Date("01 " + b).getTime()
    })

    const revenueData = sortedRevenueKeys.map((key) => ({
      name: key.split(" ")[0], // "Jan"
      value: monthlyRevenue.get(key) || 0,
      fullDate: key // Keep full date for sorting/debugging if needed
    }))

    // --- LIKEABILITY DATA (Monthly Average Percentage) ---
    // We proxy "Likeability" as the average percentage score of students
    const monthlyPerformance = new Map<string, { total: number; count: number }>()

    papers.forEach(paper => {
      paper.examAttempts.forEach(attempt => {
        const date = new Date(attempt.createdAt)
        const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`

        const current = monthlyPerformance.get(monthYear) || { total: 0, count: 0 }
        current.total += attempt.percentage
        current.count += 1
        monthlyPerformance.set(monthYear, current)
      })
    })

    const sortedPerformanceKeys = Array.from(monthlyPerformance.keys()).sort((a, b) => {
      return new Date("01 " + a).getTime() - new Date("01 " + b).getTime()
    })

    const likeabilityData = sortedPerformanceKeys.map(key => {
      const data = monthlyPerformance.get(key) || { total: 0, count: 0 }
      return {
        name: key.split(" ")[0], // "Jan"
        value: data.count > 0 ? Math.round(data.total / data.count) : 0, // Average percentage
      }
    })

    return {
      totalStudents: uniqueStudents.size,
      totalPapers: papers.length,
      totalPurchases,       // Actual paper purchase count
      trendingPapersCount,  // Papers with attempts in last 30 days
      averageRating: Math.round((averageScore / 20) * 10) / 10,
      totalEarnings,
      studentPerformance,
      recentActivities,

      // Keep old fields just in case
      totalAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      revenueData,
      likeabilityData,
      topPerformingPapers: papers
        .sort((a, b) => (b._count.examAttempts || 0) - (a._count.examAttempts || 0))
        .slice(0, 5)
        .map((p) => ({
          id: p.id,
          title: p.title,
          attempts: p._count.examAttempts,
          averageScore: p.averageScore,
        })),
    }
  }

  async getStudentAnalytics(studentId: string) {
    // Get student's attempts
    const attempts = await prisma.examAttempt.findMany({
      where: { studentId },
      include: {
        paper: {
          include: {
            subject: true,
          },
        },
      },
    })

    const totalAttempts = attempts.length
    const totalScore = attempts.reduce((sum, a) => sum + a.totalScore, 0)
    const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0
    const averagePercentage = totalAttempts > 0 ? attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts : 0
    const highestScore = totalAttempts > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0
    const totalTimeSpent = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0)

    // Calculate subject-wise performance
    const subjectStats: Record<string, { totalMarks: number; obtainedMarks: number }> = {}

    attempts.forEach((attempt) => {
      const subjectName = attempt.paper.subject.name
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = { totalMarks: 0, obtainedMarks: 0 }
      }
      subjectStats[subjectName].totalMarks += attempt.totalMarks
      subjectStats[subjectName].obtainedMarks += attempt.totalScore
    })

    const subjectPerformance = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      percentage: stats.totalMarks > 0 ? Math.round((stats.obtainedMarks / stats.totalMarks) * 100) : 0,
    }))

    // Get rank
    const ranking = await prisma.examAttempt.groupBy({
      by: ["studentId"],
      _avg: { percentage: true },
      orderBy: { _avg: { percentage: "desc" } },
    })

    const rank = ranking.findIndex((r) => r.studentId === studentId) + 1

    // Get category-wise performance
    const answers = await prisma.studentAnswer.findMany({
      where: { studentId },
      include: { question: true },
    })

    const difficultyStats: Record<string, { total: number; obtained: number }> = {
      EASY: { total: 0, obtained: 0 },
      INTERMEDIATE: { total: 0, obtained: 0 },
      ADVANCED: { total: 0, obtained: 0 },
    }

    answers.forEach((ans) => {
      const diff = ans.question.difficulty
      if (difficultyStats[diff]) {
        difficultyStats[diff].total += ans.question.marks
        difficultyStats[diff].obtained += ans.marksObtained
      }
    })

    const performanceByDifficulty = Object.entries(difficultyStats).map(([level, stats]) => ({
      level,
      score: Math.round(stats.obtained * 100) / 100,
      total: Math.round(stats.total * 100) / 100,
      percentage: stats.total > 0 ? Math.round((stats.obtained / stats.total) * 100) : 0,
    }))

    return {
      totalAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      highestScore: Math.round(highestScore * 100) / 100,
      totalTimeSpent,
      subjectPerformance,
      rank,
      performanceByDifficulty,
      recentAttempts: attempts
        .filter((a) => a.submittedAt !== null)
        .sort((a, b) => b.submittedAt!.getTime() - a.submittedAt!.getTime())
        .slice(0, 5)
        .map((a) => ({
          id: a.id,
          paperTitle: a.paper.title,
          score: a.totalScore,
          percentage: a.percentage,
          submittedAt: a.submittedAt,
        })),
    }
  }

  async getPaperAnalytics(paperId: string, userId: string, userRole: string) {
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: {
        examAttempts: {
          include: { answers: true },
        },
        questions: true,
      },
    })

    if (!paper) {
      throw new Error("Paper not found")
    }

    // Role-based Access Control
    if (userRole === "STUDENT") {
      throw new Error("Unauthorized: Students cannot access paper analytics")
    }

    if (userRole === "TEACHER" && paper.teacherId !== userId) {
      throw new Error("Unauthorized: You do not own this paper")
    }

    const totalAttempts = paper.examAttempts.length
    const averageScore =
      totalAttempts > 0 ? paper.examAttempts.reduce((sum, a) => sum + a.totalScore, 0) / totalAttempts : 0
    const averagePercentage =
      totalAttempts > 0 ? paper.examAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts : 0

    // Question-wise analysis
    const questionAnalysis = paper.questions.map((q) => {
      const questionAnswers = paper.examAttempts.flatMap((a) => a.answers.filter((ans) => ans.questionId === q.id))
      const correctAnswers = questionAnswers.filter((a) => a.isCorrect).length
      const accuracy = questionAnswers.length > 0 ? (correctAnswers / questionAnswers.length) * 100 : 0

      return {
        questionId: q.id,
        questionText: q.questionText.substring(0, 100),
        type: q.type,
        difficulty: q.difficulty,
        attempts: questionAnswers.length,
        correctAnswers,
        accuracy: Math.round(accuracy * 100) / 100,
      }
    })

    return {
      paperId,
      paperTitle: paper.title,
      totalAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      totalQuestions: paper.questions.length,
      questionAnalysis,
      scoreDistribution: {
        excellent: paper.examAttempts.filter((a) => a.percentage >= 80).length,
        good: paper.examAttempts.filter((a) => a.percentage >= 60 && a.percentage < 80).length,
        average: paper.examAttempts.filter((a) => a.percentage >= 40 && a.percentage < 60).length,
        poor: paper.examAttempts.filter((a) => a.percentage < 40).length,
      },
    }
  }
}

export const analyticsService = new AnalyticsService()
