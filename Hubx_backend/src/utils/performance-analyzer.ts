import prisma from "@config/database"

/**
 * PerformanceAnalyzer
 * Provides deep analysis of student performance
 * Used by recommendation engine and focus area detection
 */
export class PerformanceAnalyzer {
  /**
   * Get comprehensive performance summary
   */
  static async analyzeStudent(studentId: string) {
    const attempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        status: "SUBMITTED" as any,
      },
      include: {
        paper: {
          include: {
            subject: true,
            chapters: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    })

    if (attempts.length === 0) {
      return {
        status: "NO_DATA",
        message: "Student has no completed attempts",
      }
    }

    const overallAverage =
      attempts.reduce((sum, a) => sum + a.percentage, 0) /
      attempts.length

    const subjectMetrics = this.calculateSubjectMetrics(attempts)
    const chapterMetrics = this.calculateChapterMetrics(attempts)
    const trend = this.calculateTrend(attempts)
    const weakAreas = this.identifyWeakAreas(
      attempts,
      chapterMetrics
    )

    return {
      status: "SUCCESS",
      overallAverage,
      totalAttempts: attempts.length,
      subjectMetrics,
      chapterMetrics,
      trend,
      weakAreas,
      recommendations: this.generateRecommendations(
        overallAverage,
        weakAreas,
        trend
      ),
    }
  }

  /**
   * Calculate performance by subject
   */
  private static calculateSubjectMetrics(attempts: any[]) {
    const subjectMap = new Map<
      string,
      { totalScore: number; count: number }
    >()

    attempts.forEach(a => {
      const subjectName = a.paper.subject.name
      const current = subjectMap.get(subjectName) || {
        totalScore: 0,
        count: 0,
      }
      current.totalScore += a.percentage
      current.count += 1
      subjectMap.set(subjectName, current)
    })

    const metrics: any[] = []
    subjectMap.forEach((value, subject) => {
      const avg = value.totalScore / value.count
      metrics.push({
        subject,
        average: Math.round(avg),
        totalTests: value.count,
        status:
          avg >= 70
            ? "Excellent"
            : avg >= 50
            ? "Good"
            : "Needs Improvement",
      })
    })

    return metrics.sort((a, b) => b.average - a.average)
  }

  /**
   * Calculate performance by chapter
   */
  private static calculateChapterMetrics(attempts: any[]) {
    const chapterMap = new Map<
      string,
      { totalScore: number; count: number }
    >()

    attempts.forEach(a => {
      a.paper.chapters.forEach((pc: any) => {
        const chapterName = pc.name || "Unknown"
        const current = chapterMap.get(chapterName) || {
          totalScore: 0,
          count: 0,
        }
        current.totalScore += a.percentage
        current.count += 1
        chapterMap.set(chapterName, current)
      })
    })

    const metrics: any[] = []
    chapterMap.forEach((value, chapter) => {
      const avg = value.totalScore / value.count
      metrics.push({
        chapter,
        average: Math.round(avg),
        totalTests: value.count,
      })
    })

    return metrics.sort((a, b) => a.average - b.average)
  }

  /**
   * Calculate performance trend
   */
  private static calculateTrend(attempts: any[]) {
    if (attempts.length < 2) return "No trend yet"

    const recent = attempts.slice(0, 5)
    const older = attempts.slice(5, 10)

    const recentAvg =
      recent.reduce((sum, a) => sum + a.percentage, 0) /
      recent.length
    const olderAvg =
      older.length > 0
        ? older.reduce((sum, a) => sum + a.percentage, 0) /
          older.length
        : recentAvg

    const improvement = recentAvg - olderAvg

    if (improvement > 5) return "Improving"
    if (improvement < -5) return "Declining"
    return "Stable"
  }

  /**
   * Identify weak areas
   */
  private static identifyWeakAreas(
    attempts: any[],
    chapterMetrics: any[]
  ) {
    return chapterMetrics
      .filter(c => c.average < 50)
      .slice(0, 3)
      .map(c => ({
        chapter: c.chapter,
        score: c.average,
        severity:
          c.average < 30
            ? "Critical"
            : c.average < 40
            ? "High"
            : "Medium",
      }))
  }

  /**
   * Generate actionable recommendations
   */
  private static generateRecommendations(
    overallAverage: number,
    weakAreas: any[],
    trend: string
  ): string[] {
    const recommendations: string[] = []

    if (overallAverage < 40) {
      recommendations.push(
        "Focus on fundamentals. Start with easy difficulty papers."
      )
    }

    if (weakAreas.length > 0) {
      recommendations.push(
        `Review weak areas: ${weakAreas
          .slice(0, 2)
          .map(w => w.chapter)
          .join(", ")}`
      )
    }

    if (trend === "Declining") {
      recommendations.push(
        "Your scores are declining. Take a break and review concepts."
      )
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Keep practicing! Try harder difficulty papers."
      )
    }

    return recommendations
  }
}
