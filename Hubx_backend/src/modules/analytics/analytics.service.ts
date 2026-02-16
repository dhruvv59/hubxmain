import prisma from "@config/database"

export class AnalyticsService {
  async getTeacherAnalytics(teacherId: string) {
    // Get teacher's papers
    const papers = await prisma.paper.findMany({
      where: { teacherId },
      include: {
        examAttempts: true,
        _count: { select: { examAttempts: true } },
      },
    })

    // Calculate total earnings
    const purchases = await prisma.paperPurchase.findMany({
      where: { paper: { teacherId } },
    })

    const totalEarnings = purchases.reduce((sum, p) => sum + p.price, 0)

    // Calculate statistics
    const totalAttempts = papers.reduce((sum, p) => sum + (p._count.examAttempts || 0), 0)
    const averageScore =
      papers.length > 0 ? papers.reduce((sum, p) => sum + (p.averageScore || 0), 0) / papers.length : 0

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
      totalPapers: papers.length,
      totalAttempts,
      totalEarnings,
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
