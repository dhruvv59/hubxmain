import prisma from "@config/database"
import { AppError } from "@utils/errors"
import { ERROR_MESSAGES, PAPER_STATUS } from "@utils/constants"

export class PaperService {
  /**
   * Validate paper access configuration based on isPublic and isFreeAccess flags
   * Rules:
   * - If isPublic: true → price MUST be set (regardless of isFreeAccess)
   *   - When isFreeAccess also true: Students from this school get free, others pay
   *   - When isFreeAccess false: Everyone pays
   * - If isPublic: false + isFreeAccess: true → price MUST be null (free for school only)
   * - If isPublic: false + isFreeAccess: false → price MUST be null (private draft)
   */
  private validatePaperAccessConfig(
    isPublic: boolean,
    isFreeAccess: boolean,
    price: number | undefined | null,
  ): void {
    // Public paper - must have price (whether free for school or not)
    if (isPublic) {
      if (price === undefined || price === null) {
        throw new AppError(400, ERROR_MESSAGES.PUBLIC_PAPER_REQUIRES_PRICE)
      }
      return
    }

    // Private/Draft paper - cannot have a price
    if (price !== undefined && price !== null && price > 0) {
      throw new AppError(400, ERROR_MESSAGES.FREE_ACCESS_CANNOT_HAVE_PRICE)
    }
  }

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
      isFreeAccess?: boolean
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

    // Validate paper access configuration (public/free access/private)
    this.validatePaperAccessConfig(
      data.isPublic,
      data.isFreeAccess || false,
      data.price,
    )

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
        isFreeAccess: data.isFreeAccess || false,
        price: data.isPublic ? data.price : null, // Only store price if public
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

  async getPapers(
    teacherId: string,
    page = 1,
    limit = 10,
    filters?: {
      search?: string
      subject?: string
      difficulty?: string
      sort?: string
      std?: string
    }
  ) {
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = { teacherId }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ]
    }

    if (filters?.subject && filters.subject !== "All") {
      where.subject = {
        name: filters.subject,
      }
    }

    if (filters?.difficulty && filters.difficulty !== "All") {
      // Map frontend difficulty to database format
      const difficultyMap: Record<string, string> = {
        "Beginner": "EASY",
        "Intermediate": "INTERMEDIATE",
        "Advanced": "ADVANCED",
        "EASY": "EASY",
        "INTERMEDIATE": "INTERMEDIATE",
        "ADVANCED": "ADVANCED",
      }
      where.difficulty = difficultyMap[filters.difficulty] || filters.difficulty
    }

    if (filters?.std && filters.std !== "All") {
      // Extract number from "8th", "9th", "10th", etc.
      const stdNum = parseInt(filters.std.replace(/\D/g, ''), 10)
      if (!isNaN(stdNum)) {
        where.standard = stdNum
      }
    }

    // Determine sort order
    let orderBy: any = { createdAt: "desc" }
    if (filters?.sort === "Most Popular") {
      orderBy = { totalAttempts: "desc" }
    } else if (filters?.sort === "Highest Rated") {
      orderBy = { averageScore: "desc" }
    }

    const papers = await prisma.paper.findMany({
      where,
      include: { questions: true, subject: true, chapters: { include: { chapter: true } } },
      skip,
      take: limit,
      orderBy,
    })

    const total = await prisma.paper.count({ where })

    // Calculate ratings for each paper
    const papersWithRatings = await Promise.all(
      papers.map(async (paper) => {
        const { rating } = await this.getPaperRating(paper.id)
        return {
          ...paper,
          rating,
        }
      })
    )

    // Get available filters (subjects and standards) from all teacher's papers
    const distinctSubjects = await prisma.paper.findMany({
      where: { teacherId },
      select: {
        subject: {
          select: { name: true }
        }
      },
      distinct: ['subjectId']
    })

    const distinctStandards = await prisma.paper.findMany({
      where: { teacherId },
      select: { standard: true },
      distinct: ['standard']
    })

    const availableSubjects = distinctSubjects
      .map(p => p.subject.name)
      .filter((value, index, self) => self.indexOf(value) === index) // Unique just in case
      .sort()

    const availableStandards = distinctStandards
      .map(p => p.standard)
      .sort((a, b) => a - b)
      .map(s => `${s}th`) // Format as "8th", "9th", etc.

    return {
      papers: papersWithRatings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      filters: {
        subjects: availableSubjects,
        standards: availableStandards
      }
    }
  }

  async getPaperById(paperId: string, teacherId: string) {
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: {
        questions: { orderBy: { order: "asc" } },
        subject: {
          include: { standard: true }
        },
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

    // Prepare update data with defaults
    const updateData: any = {
      title: data.title !== undefined ? data.title : paper.title,
      description: data.description !== undefined ? data.description : paper.description,
      standard: data.standard !== undefined ? data.standard : paper.standard,
      difficulty: data.difficulty !== undefined ? data.difficulty : paper.difficulty,
      type: data.type !== undefined ? data.type : paper.type,
      duration: data.duration !== undefined ? data.duration : paper.duration,
    }

    // Handle paper access configuration updates
    const isPublic = data.isPublic !== undefined ? data.isPublic : paper.isPublic
    const isFreeAccess = data.isFreeAccess !== undefined ? data.isFreeAccess : paper.isFreeAccess
    const price = data.price !== undefined ? data.price : paper.price

    // Validate new access configuration
    this.validatePaperAccessConfig(isPublic, isFreeAccess, price)

    // Set access fields
    updateData.isPublic = isPublic
    updateData.isFreeAccess = isFreeAccess
    updateData.price = isPublic ? price : null // Only store price if public

    // Validate time bound changes
    if (updateData.type === "TIME_BOUND" && !updateData.duration) {
      throw new AppError(400, ERROR_MESSAGES.TIME_BOUND_REQUIRES_DURATION)
    }

    const updatedPaper = await prisma.paper.update({
      where: { id: paperId },
      data: updateData,
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

    // Paper must have at least one question
    if (paper.questions.length === 0) {
      throw new AppError(400, ERROR_MESSAGES.INSUFFICIENT_QUESTIONS)
    }

    // Validate public paper has price
    if (paper.isPublic && paper.price === null) {
      throw new AppError(400, ERROR_MESSAGES.PUBLIC_PAPER_REQUIRES_PRICE)
    }

    // Validate time bound paper has duration
    if (paper.type === "TIME_BOUND" && !paper.duration) {
      throw new AppError(400, ERROR_MESSAGES.TIME_BOUND_REQUIRES_DURATION)
    }

    // Validate access configuration before publishing
    this.validatePaperAccessConfig(paper.isPublic, (paper as any).isFreeAccess || false, paper.price)

    const publishedPaper = await prisma.paper.update({
      where: { id: paperId },
      data: { status: PAPER_STATUS.PUBLISHED as any },
    })

    // If paper is public or free access and teacher belongs to an organization, generate coupons
    const shouldGenerateCoupons = (paper.isPublic || (paper as any).isFreeAccess) && paper.teacher.organizationMemberships.length > 0

    if (shouldGenerateCoupons) {
      const teacherOrg = paper.teacher.organizationMemberships[0]
      const paperType = paper.isPublic ? "paid public" : "free access"

      // Import coupon service dynamically to avoid circular dependency
      import("@modules/coupon/coupon.service").then(({ couponService }) => {
        couponService.generateCouponsForPaper(
          paperId,
          teacherOrg.organizationId,
          paper.standard
        ).catch(err => {
          console.error(`Failed to generate coupons for ${paperType} paper:`, err)
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
      std?: string
    }
  ) {
    // Build where clause for public papers
    const publicPapersWhere: any = {
      isPublic: true,
      status: PAPER_STATUS.PUBLISHED,
    }

    // Apply filters
    if (filters?.subject) {
      publicPapersWhere.subject = { name: filters.subject }
    }

    if (filters?.std) {
      const stdNum = parseInt(filters.std, 10)
      if (!isNaN(stdNum)) {
        publicPapersWhere.standard = stdNum
      }
    }

    if (filters?.difficulty) {
      const difficultyMap: Record<string, string> = {
        "Beginner": "EASY",
        "Intermediate": "INTERMEDIATE",
        "Advanced": "ADVANCED",
        "EASY": "EASY",
        "INTERMEDIATE": "INTERMEDIATE",
        "ADVANCED": "ADVANCED",
      }
      publicPapersWhere.difficulty = difficultyMap[filters.difficulty] || filters.difficulty
    }

    if (filters?.search) {
      publicPapersWhere.AND = [
        { OR: [{ title: { contains: filters.search } }, { description: { contains: filters.search } }] }
      ]
    }

    const paperInclude = {
      subject: true,
      teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
      questions: { select: { id: true } },
    }

    // Count own and other papers
    const totalOwn = await prisma.paper.count({ where: { ...publicPapersWhere, teacherId } })
    const totalOther = await prisma.paper.count({ where: { ...publicPapersWhere, teacherId: { not: teacherId } } })
    const totalAll = totalOwn + totalOther
    const totalPages = Math.ceil(totalAll / limit)

    // Own papers come first. Figure out which own/other papers belong to this page.
    const globalStart = (page - 1) * limit  // 0-indexed start index in the combined list
    const globalEnd = globalStart + limit    // exclusive end

    // Own papers occupy indices 0..totalOwn-1, others occupy totalOwn..totalAll-1
    const ownStart = Math.min(globalStart, totalOwn)
    const ownEnd = Math.min(globalEnd, totalOwn)
    const ownTake = ownEnd - ownStart

    const otherStart = Math.max(0, globalStart - totalOwn)
    const otherEnd = Math.max(0, globalEnd - totalOwn)
    const otherTake = otherEnd - otherStart

    const ownPapersRaw = ownTake > 0
      ? await prisma.paper.findMany({
          where: { ...publicPapersWhere, teacherId },
          include: paperInclude,
          orderBy: { createdAt: "desc" },
          skip: ownStart,
          take: ownTake,
        })
      : []

    const otherPapersRaw = otherTake > 0
      ? await prisma.paper.findMany({
          where: { ...publicPapersWhere, teacherId: { not: teacherId } },
          include: paperInclude,
          orderBy: { createdAt: "desc" },
          skip: otherStart,
          take: otherTake,
        })
      : []

    const mapPaper = async (paper: any, isOwn: boolean) => {
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
        isOwnPaper: isOwn,
      }
    }

    const ownPapersWithRatings = await Promise.all(ownPapersRaw.map(p => mapPaper(p, true)))
    const otherPapersWithRatings = await Promise.all(otherPapersRaw.map(p => mapPaper(p, false)))

    // Get teacher's available subjects and standards for filters
    const teacherStandards = await prisma.standard.findMany({ where: { teacherId }, orderBy: { name: "asc" } })
    const teacherSubjects = await prisma.subject.findMany({
      where: { standard: { teacherId } },
      select: { name: true },
      distinct: ['name'],
      orderBy: { name: "asc" }
    })

    return {
      ownPapers: ownPapersWithRatings,
      otherPapers: otherPapersWithRatings,
      pagination: {
        page,
        limit,
        total: totalAll,
        pages: totalPages,
      },
      filters: {
        subjects: teacherSubjects.map(s => s.name),
        standards: teacherStandards.map(s => `${s.name}th`),
      }
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
