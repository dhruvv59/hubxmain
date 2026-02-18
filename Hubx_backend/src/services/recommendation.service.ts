import prisma from "@config/database"
import { AppError } from "@utils/errors"

/**
 * RecommendationService
 * Handles intelligent test recommendations for students
 *
 * Separating recommendation logic allows for:
 * - Easy A/B testing different algorithms
 * - Reuse across multiple endpoints
 * - Caching and analytics
 * - ML model integration in future
 */
export class RecommendationService {
  /**
   * Get recommendations for a specific student
   *
   * Algorithm:
   * 1. Analyze student performance (subject, chapter, difficulty level)
   * 2. Identify weak areas (score < 60%)
   * 3. Find papers that cover weak areas
   * 4. Score papers based on relevance
   * 5. Return top-ranked papers
   */
  async getPersonalizedRecommendations(
    studentId: string,
    limit: number = 5
  ) {
    try {
      // Get student's performance analysis
      const performance = await this.analyzeStudentPerformance(studentId)

      if (!performance.hasAttempts) {
        return await this.getNewStudentRecommendations(limit)
      }

      // Find papers in weak areas
      const recommendations = await this.findRelevantPapers(
        studentId,
        performance.weakSubjectIds,
        performance.averageDifficulty
      )

      // Score and rank papers
      const scored = this.scoreRecommendations(recommendations, performance)

      // Return top matches
      return scored.slice(0, limit).map(p => ({
        id: p.id,
        title: p.title,
        subject: p.subject.name,
        difficulty: p.difficulty,
        relevanceScore: p._score,
        questions: p._count.questions,
        duration: p.duration || 0,
      }))
    } catch (error) {
      console.error("[RecommendationService] Error:", error)
      throw error
    }
  }

  /**
   * Analyze student's performance across subjects and chapters
   */
  private async analyzeStudentPerformance(studentId: string) {
    const attempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        status: "SUBMITTED" as any,
      },
      include: {
        paper: {
          select: {
            subjectId: true,
            difficulty: true,
            chapters: true,
          },
        },
      },
    })

    if (attempts.length === 0) {
      return {
        hasAttempts: false,
        weakSubjectIds: [],
        averageDifficulty: "INTERMEDIATE",
      }
    }

    // Calculate subject-wise averages
    const subjectStats = new Map<
      string,
      { totalScore: number; count: number; difficulty: string[] }
    >()

    attempts.forEach(a => {
      const current = subjectStats.get(a.paper.subjectId) || {
        totalScore: 0,
        count: 0,
        difficulty: [],
      }
      current.totalScore += a.percentage
      current.count += 1
      current.difficulty.push(a.paper.difficulty)
      subjectStats.set(a.paper.subjectId, current)
    })

    // Identify weak subjects
    const weakSubjectIds: string[] = []
    const avgDifficulties: string[] = []

    subjectStats.forEach((stats, subjectId) => {
      const avg = stats.totalScore / stats.count

      if (avg < 60) {
        weakSubjectIds.push(subjectId)
      }

      const difficultyCounts = stats.difficulty.reduce(
        (acc, d) => ({ ...acc, [d]: (acc[d as any] || 0) + 1 }),
        {} as Record<string, number>
      )
      const mostCommon = Object.entries(difficultyCounts).sort(
        (a, b) => b[1] - a[1]
      )[0]
      if (mostCommon) {
        avgDifficulties.push(mostCommon[0])
      }
    })

    return {
      hasAttempts: true,
      weakSubjectIds,
      averageDifficulty: avgDifficulties[0] || "INTERMEDIATE",
      totalAttempts: attempts.length,
      overallAverage:
        attempts.reduce((sum, a) => sum + a.percentage, 0) /
        attempts.length,
    }
  }

  /**
   * Get recommendations for brand new students
   */
  private async getNewStudentRecommendations(limit: number) {
    return await prisma.paper.findMany({
      where: {
        isPublic: true,
        status: "PUBLISHED" as any,
        difficulty: "EASY" as any,
      },
      include: {
        subject: { select: { name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { totalAttempts: "desc" },
      take: limit,
    })
  }

  /**
   * Find papers relevant to student's weak areas
   */
  private async findRelevantPapers(
    studentId: string,
    weakSubjectIds: string[],
    difficulty: string
  ) {
    const attemptedIds = await prisma.examAttempt.findMany({
      where: { studentId },
      select: { paperId: true },
    }).then(a => a.map(x => x.paperId))

    const papers = await prisma.paper.findMany({
      where: {
        id: { notIn: attemptedIds },
        status: "PUBLISHED" as any,
        OR: [
          { subjectId: { in: weakSubjectIds } },
          { totalAttempts: { gte: 20 } },
        ],
      },
      include: {
        subject: true,
        _count: { select: { questions: true } },
      },
      take: 20,
    })

    return papers
  }

  /**
   * Score papers based on relevance to student
   */
  private scoreRecommendations(papers: any[], performance: any) {
    return papers.map(paper => {
      let score = 0

      // Score factor 1: In weak subject (3 points)
      if (performance.weakSubjectIds.includes(paper.subjectId)) {
        score += 3
      }

      // Score factor 2: Popularity (0-2 points)
      const popularityScore = Math.min(
        (paper.totalAttempts / 100) * 2,
        2
      )
      score += popularityScore

      // Score factor 3: Difficulty match (1.5 points)
      if (paper.difficulty === performance.averageDifficulty) {
        score += 1.5
      } else if (
        (performance.averageDifficulty === "EASY" &&
          paper.difficulty === "INTERMEDIATE") ||
        (performance.averageDifficulty === "INTERMEDIATE" &&
          paper.difficulty === "ADVANCED")
      ) {
        score += 0.5
      }

      // Score factor 4: Recency (0-1 point)
      const daysSinceCreation = Math.floor(
        (Date.now() - paper.createdAt.getTime()) /
        (1000 * 60 * 60 * 24)
      )
      if (daysSinceCreation < 7) {
        score += 1
      } else if (daysSinceCreation < 30) {
        score += 0.5
      }

      return { ...paper, _score: score }
    })
  }
}

export const recommendationService = new RecommendationService()
