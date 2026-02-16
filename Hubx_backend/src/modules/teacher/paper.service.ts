import prisma from "@config/database"
import { AppError } from "@utils/errors"
import { ERROR_MESSAGES, PAPER_STATUS } from "@utils/constants"

export class PaperService {
  async createPaper(
    teacherId: string,
    data: {
      title: string
      description?: string
      standard: number
      subjectId: string
      chapterIds?: string[]
      difficulty: string
      type: string
      duration?: number
      isPublic: boolean
      price?: number
    },
  ) {
    // Validate subject ownership
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
      include: { standard: true },
    })
    if (!subject || subject.standard.teacherId !== teacherId) {
      throw new AppError(404, "Subject not found")
    }

    // Validate chapters ownership if provided
    if (data.chapterIds && data.chapterIds.length > 0) {
      const chapters = await prisma.chapter.findMany({
        where: { id: { in: data.chapterIds } },
        include: { subject: { include: { standard: true } } },
      })

      if (chapters.length !== data.chapterIds.length) {
        throw new AppError(404, "One or more chapters not found")
      }

      // Verify all chapters belong to the subject and teacher
      for (const chapter of chapters) {
        if (chapter.subjectId !== data.subjectId || chapter.subject.standard.teacherId !== teacherId) {
          throw new AppError(404, "Chapter does not belong to the subject")
        }
      }
    }

    // Validate time bound paper has duration
    if (data.type === "TIME_BOUND" && !data.duration) {
      throw new AppError(400, ERROR_MESSAGES.TIME_BOUND_REQUIRES_DURATION)
    }

    // Validate public paper has price (allow 0)
    if (data.isPublic && data.price === undefined) {
      throw new AppError(400, ERROR_MESSAGES.PUBLIC_PAPER_REQUIRES_PRICE)
    }

    const paper = await prisma.paper.create({
      data: {
        title: data.title,
        description: data.description,
        standard: data.standard,
        teacherId,
        subjectId: data.subjectId,
        difficulty: data.difficulty as any,
        type: data.type as any,
        duration: data.duration,
        isPublic: data.isPublic,
        price: data.price,
        status: PAPER_STATUS.DRAFT as any,
      },
      include: { questions: true, subject: true },
    })

    // Create paper-chapter associations if provided
    if (data.chapterIds && data.chapterIds.length > 0) {
      await Promise.all(
        data.chapterIds.map((chapterId) =>
          prisma.paperChapter.create({
            data: {
              paperId: paper.id,
              chapterId,
            },
          }),
        ),
      )
    }

    // Create chat room for this paper
    await prisma.chatRoom.create({
      data: {
        paperId: paper.id,
      },
    })

    // Fetch paper with chapters
    return await prisma.paper.findUnique({
      where: { id: paper.id },
      include: {
        chapters: {
          include: { chapter: true },
        },
        questions: true,
        subject: true,
        chatRoom: true,
      },
    })
  }

  async getPapers(teacherId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const papers = await prisma.paper.findMany({
      where: { teacherId },
      include: { questions: true, subject: true, chapters: { include: { chapter: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    const total = await prisma.paper.count({ where: { teacherId } })

    return {
      papers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async getPaperById(paperId: string, teacherId: string) {
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: {
        questions: { orderBy: { order: "asc" } },
        subject: true,
        chapters: { include: { chapter: true } },
      },
    })

    if (!paper || paper.teacherId !== teacherId) {
      throw new AppError(404, ERROR_MESSAGES.PAPER_NOT_FOUND)
    }

    return paper
  }

  async updatePaper(paperId: string, teacherId: string, data: any) {
    const paper = await prisma.paper.findUnique({ where: { id: paperId } })
    if (!paper || paper.teacherId !== teacherId) {
      throw new AppError(404, ERROR_MESSAGES.PAPER_NOT_FOUND)
    }

    // Cannot update published papers
    if (paper.status === PAPER_STATUS.PUBLISHED) {
      throw new AppError(400, "Cannot update published paper")
    }

    const updatedPaper = await prisma.paper.update({
      where: { id: paperId },
      data: {
        title: data.title || paper.title,
        description: data.description || paper.description,
        standard: data.standard || paper.standard,
        difficulty: data.difficulty || paper.difficulty,
        type: data.type || paper.type,
        duration: data.duration || paper.duration,
        isPublic: data.isPublic !== undefined ? data.isPublic : paper.isPublic,
        price: data.price || paper.price,
      },
    })

    return updatedPaper
  }

  async publishPaper(paperId: string, teacherId: string) {
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: {
        questions: true,
        teacher: {
          include: {
            organizationMemberships: {
              where: { isActive: true }
            }
          }
        }
      },
    })

    if (!paper || paper.teacherId !== teacherId) {
      throw new AppError(404, ERROR_MESSAGES.PAPER_NOT_FOUND)
    }

    if (paper.questions.length === 0) {
      throw new AppError(400, ERROR_MESSAGES.INSUFFICIENT_QUESTIONS)
    }

    if (paper.isPublic && paper.price === null) {
      throw new AppError(400, ERROR_MESSAGES.PUBLIC_PAPER_REQUIRES_PRICE)
    }

    if (paper.type === "TIME_BOUND" && !paper.duration) {
      throw new AppError(400, ERROR_MESSAGES.TIME_BOUND_REQUIRES_DURATION)
    }

    const publishedPaper = await prisma.paper.update({
      where: { id: paperId },
      data: { status: PAPER_STATUS.PUBLISHED as any },
    })

    // If paper is public and teacher belongs to an organization, generate coupons
    if (paper.isPublic && paper.teacher.organizationMemberships.length > 0) {
      const teacherOrg = paper.teacher.organizationMemberships[0]

      // Import coupon service dynamically to avoid circular dependency
      import("@modules/coupon/coupon.service").then(({ couponService }) => {
        couponService.generateCouponsForPaper(
          paperId,
          teacherOrg.organizationId,
          paper.standard
        ).catch(err => {
          console.error("Failed to generate coupons:", err)
        })
      })
    }

    return publishedPaper
  }

  async deletePaper(paperId: string, teacherId: string) {
    const paper = await prisma.paper.findUnique({ where: { id: paperId } })
    if (!paper || paper.teacherId !== teacherId) {
      throw new AppError(404, ERROR_MESSAGES.PAPER_NOT_FOUND)
    }

    await prisma.paper.delete({ where: { id: paperId } })
    return { message: "Paper deleted successfully" }
  }

  async getPaperAnalytics(paperId: string, teacherId: string) {
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: {
        questions: true,
        examAttempts: {
          include: { answers: true },
        },
      },
    })

    if (!paper || paper.teacherId !== teacherId) {
      throw new AppError(404, ERROR_MESSAGES.PAPER_NOT_FOUND)
    }

    const totalAttempts = paper.examAttempts.length
    const averageScore =
      totalAttempts > 0 ? paper.examAttempts.reduce((sum, a) => sum + a.totalScore, 0) / totalAttempts : 0

    return {
      paperId,
      totalAttempts,
      averageScore,
      totalQuestions: paper.questions.length || 0,
      statistics: paper.examAttempts.map((attempt) => ({
        studentId: attempt.studentId,
        score: attempt.totalScore,
        percentage: attempt.percentage,
        timeSpent: attempt.timeSpent,
        submittedAt: attempt.submittedAt,
      })),
    }
  }

  async getPublicPapers(
    teacherId: string,
    page = 1,
    limit = 10,
    filters?: {
      subject?: string
      difficulty?: string
      search?: string
    }
  ) {
    const skip = (page - 1) * limit

    // Build where clause for public papers
    const publicPapersWhere: any = {
      isPublic: true,
      status: PAPER_STATUS.PUBLISHED,
    }

    // Apply filters
    if (filters?.subject) {
      publicPapersWhere.subject = {
        name: filters.subject,
      }
    }

    if (filters?.difficulty) {
      publicPapersWhere.difficulty = filters.difficulty
    }

    if (filters?.search) {
      publicPapersWhere.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ]
    }

    // Get teacher's own public papers (no pagination needed)
    const ownPapers = await prisma.paper.findMany({
      where: {
        ...publicPapersWhere,
        teacherId,
      },
      include: {
        subject: true,
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        questions: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Get other teachers' public papers (with pagination)
    const [otherPapers, totalOtherPapers] = await Promise.all([
      prisma.paper.findMany({
        where: {
          ...publicPapersWhere,
          teacherId: { not: teacherId },
        },
        include: {
          subject: true,
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          questions: {
            select: { id: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.paper.count({
        where: {
          ...publicPapersWhere,
          teacherId: { not: teacherId },
        },
      }),
    ])

    // Calculate ratings for all papers
    const ownPapersWithRatings = await Promise.all(
      ownPapers.map(async (paper) => {
        const { averagePercentage, rating } = await this.getPaperRating(paper.id)
        return {
          id: paper.id,
          title: paper.title,
          description: paper.description,
          standard: paper.standard,
          difficulty: paper.difficulty,
          type: paper.type,
          duration: paper.duration,
          isPublic: paper.isPublic,
          price: paper.price,
          status: paper.status,
          totalAttempts: paper.totalAttempts,
          averageScore: paper.averageScore,
          averagePercentage,
          rating,
          subject: paper.subject,
          teacher: paper.teacher,
          questionCount: paper.questions.length,
          createdAt: paper.createdAt,
        }
      })
    )

    const otherPapersWithRatings = await Promise.all(
      otherPapers.map(async (paper) => {
        const { averagePercentage, rating } = await this.getPaperRating(paper.id)
        return {
          id: paper.id,
          title: paper.title,
          description: paper.description,
          standard: paper.standard,
          difficulty: paper.difficulty,
          type: paper.type,
          duration: paper.duration,
          isPublic: paper.isPublic,
          price: paper.price,
          status: paper.status,
          totalAttempts: paper.totalAttempts,
          averageScore: paper.averageScore,
          averagePercentage,
          rating,
          subject: paper.subject,
          teacher: paper.teacher,
          questionCount: paper.questions.length,
          createdAt: paper.createdAt,
        }
      })
    )

    return {
      ownPapers: ownPapersWithRatings,
      otherPapers: otherPapersWithRatings,
      pagination: {
        page,
        limit,
        total: totalOtherPapers,
        pages: Math.ceil(totalOtherPapers / limit),
      },
    }
  }

  /**
   * Calculate rating (0-5 scale) from average percentage
   * Rating scale: 0-40% = 1 star, 40-55% = 2 stars, 55-70% = 3 stars, 70-85% = 4 stars, 85-100% = 5 stars
   */
  private calculateRating(averagePercentage: number): number {
    if (averagePercentage === 0) return 0
    if (averagePercentage < 40) return 1
    if (averagePercentage < 55) return 2
    if (averagePercentage < 70) return 3
    if (averagePercentage < 85) return 4
    return 5
  }

  /**
   * Get average percentage and rating for a paper
   */
  async getPaperRating(paperId: string): Promise<{ averagePercentage: number; rating: number }> {
    const attempts = await prisma.examAttempt.findMany({
      where: {
        paperId,
        status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] }
      },
      select: { percentage: true }
    })

    if (attempts.length === 0) {
      return { averagePercentage: 0, rating: 0 }
    }

    const averagePercentage = attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
    const rating = this.calculateRating(averagePercentage)

    return { averagePercentage, rating }
  }
}

export const paperService = new PaperService()
