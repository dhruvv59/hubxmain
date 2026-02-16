import prisma from "@config/database"
import redis from "@config/redis"
import { AppError } from "@utils/errors"
import { ERROR_MESSAGES, PAPER_STATUS, EXAM_STATUS } from "@utils/constants"

export class StudentService {
  async getDashboard(studentId: string) {
    // Get performance metrics
    const attemptedPapers = await prisma.examAttempt.findMany({
      where: { studentId },
    })

    const totalAttempts = attemptedPapers.length
    const averageScore =
      totalAttempts > 0 ? attemptedPapers.reduce((sum, a) => sum + a.totalScore, 0) / totalAttempts : 0
    const averagePercentage =
      totalAttempts > 0 ? attemptedPapers.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts : 0
    const averageTime =
      totalAttempts > 0 ? attemptedPapers.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / totalAttempts : 0

    // Get purchase count
    const purchaseCount = await prisma.paperPurchase.count({
      where: { studentId },
    })

    // PERFORMANCE FIX: Get rank from Redis cache instead of real-time calculation
    // Cache is updated only when exams are submitted (see below)
    let rank = 0
    try {
      // Use a timeout for Redis operations to prevent blocking
      const cachedRank = await Promise.race([
        redis.get(`student:${studentId}:rank`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 2000))
      ]) as string | null

      rank = cachedRank ? parseInt(cachedRank) : 0
    } catch (err) {
      console.warn("Redis warning fetching rank (continuing without cache):", err)
      // Fallback to 0 is already set
    }

    // If no cached rank and student has attempts, calculate and cache it
    if (rank === 0 && totalAttempts > 0) {
      rank = await this.calculateAndCacheStudentRank(studentId, averagePercentage)
    }


    // Streak Logic - TIMEZONE SAFE (uses UTC)
    const user = await prisma.user.findUnique({
      where: { id: studentId },
      select: { streak: true, lastActiveAt: true }
    })

    let streak = user?.streak || 0
    const lastActive = user?.lastActiveAt ? new Date(user.lastActiveAt) : null
    const now = new Date()

    // TIMEZONE FIX: Normalize dates to UTC midnight for comparison
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const lastActiveUTC = lastActive
      ? new Date(Date.UTC(lastActive.getUTCFullYear(), lastActive.getUTCMonth(), lastActive.getUTCDate()))
      : null

    if (!lastActiveUTC) {
      // First time activity
      streak = 1
      await prisma.user.update({
        where: { id: studentId },
        data: { streak: 1, lastActiveAt: now }
      })
    } else {
      const diffTime = Math.abs(todayUTC.getTime() - lastActiveUTC.getTime())
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        // Consecutive day
        streak += 1
        await prisma.user.update({
          where: { id: studentId },
          data: { streak, lastActiveAt: now }
        })
      } else if (diffDays > 1) {
        // Missed a day or more - reset streak
        streak = 1
        await prisma.user.update({
          where: { id: studentId },
          data: { streak: 1, lastActiveAt: now }
        })
      } else {
        // Same day - only update lastActiveAt
        await prisma.user.update({
          where: { id: studentId },
          data: { lastActiveAt: now }
        })
      }
    }

    return {
      performance: {
        rank,
        averageScore,
        averagePercentage,
        averageTime: Math.round(averageTime),
        totalAttempts,
        history: attemptedPapers
          .sort((a, b) => (a.submittedAt ? a.submittedAt.getTime() : 0) - (b.submittedAt ? b.submittedAt.getTime() : 0)) // Sort by date ascending
          .map((attempt, index) => ({
            x: index + 1, // Attempt number (1st, 2nd, 3rd...)
            y: attempt.percentage, // Score percentage
          })),
      },
      purchases: purchaseCount,
      streak,
    }
  }

  async getPublicPapers(studentId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    // Get purchased paper IDs
    const purchases = await prisma.paperPurchase.findMany({
      where: { studentId },
      select: { paperId: true },
    })
    const purchasedPaperIds = purchases.map((p) => p.paperId)

    // Get public papers
    const papers = await prisma.paper.findMany({
      where: {
        isPublic: true,
        status: PAPER_STATUS.PUBLISHED as any,
      },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        price: true,
        createdAt: true,
        _count: { select: { examAttempts: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    const total = await prisma.paper.count({
      where: {
        isPublic: true,
        status: PAPER_STATUS.PUBLISHED as any,
      },
    })

    // Check for coupons (will work after migration)
    const papersWithStatus = await Promise.all(
      papers.map(async (p: any) => {
        const purchased = purchasedPaperIds.includes(p.id)
        let hasCoupon = false
        let couponCode = null

        // Check if student has a coupon for this paper
        try {
          const coupon = await (prisma as any).paperCoupon?.findUnique({
            where: {
              paperId_studentId: {
                paperId: p.id,
                studentId,
              },
            },
          })
          if (coupon && !coupon.isUsed) {
            hasCoupon = true
            couponCode = coupon.code
          }
        } catch (err) {
          // Ignore error if table doesn't exist yet
        }

        return {
          ...p,
          purchased,
          hasCoupon,
          couponCode,
        }
      }),
    )

    return {
      papers: papersWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async getPracticeExams(studentId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    // Get all published papers (practice exams for free)
    const papers = await prisma.paper.findMany({
      where: {
        status: PAPER_STATUS.PUBLISHED as any,
        isPublic: false,
      },
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    const total = await prisma.paper.count({
      where: {
        status: PAPER_STATUS.PUBLISHED as any,
        isPublic: false,
      },
    })


    // Get stats
    const attemptStats = await prisma.examAttempt.groupBy({
      by: ["status"],
      where: { studentId },
      _count: true,
    })

    const completedCount = attemptStats.reduce((acc, curr) => {
      if (curr.status === EXAM_STATUS.SUBMITTED || curr.status === EXAM_STATUS.AUTO_SUBMITTED) {
        return acc + curr._count
      }
      return acc
    }, 0)

    const inProgressCount = attemptStats.find(
      (s) => s.status === EXAM_STATUS.ONGOING
    )?._count || 0

    return {
      papers,
      stats: {
        total,
        completed: completedCount,
        inProgress: inProgressCount,
        assigned: 0,
        notStarted: Math.max(0, total - (completedCount + inProgressCount)),
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async getExamHistory(studentId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const attempts = await prisma.examAttempt.findMany({
      where: { studentId },
      include: { paper: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    const total = await prisma.examAttempt.count({ where: { studentId } })

    return {
      attempts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async getExamResult(attemptId: string, studentId: string) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          include: { question: true },
        },
        paper: true,
      },
    })

    if (!attempt || attempt.studentId !== studentId) {
      throw new AppError(404, ERROR_MESSAGES.EXAM_NOT_FOUND)
    }

    return attempt
  }

  // --- New Dashboard Metric Methods ---

  async getPerformanceMetrics(studentId: string, from?: string, to?: string) {
    const whereClause: any = {
      studentId,
      status: "SUBMITTED" as any,
    }

    if (from && to) {
      // Assuming frontend sends YYYY-MM-DD or standard ISO
      const startDate = new Date(from)
      const endDate = new Date(to)

      // Set end date to end of day for inclusive search
      endDate.setHours(23, 59, 59, 999)

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        whereClause.submittedAt = {
          gte: startDate,
          lte: endDate,
        }
      }
    }

    const attempts = await prisma.examAttempt.findMany({
      where: whereClause,
      orderBy: { submittedAt: "desc" }, // Get latest attempts
      take: 20, // Limit to 20 recent attempts
      include: { paper: true },
    })

    // Reverse to show chronological order (Oldest -> Newest)
    return attempts.reverse().map((attempt) => ({
      name: attempt.paper.title,
      score: Math.round(attempt.percentage),
      fill: attempt.percentage >= 70 ? "#4ade80" : attempt.percentage >= 40 ? "#fbbf24" : "#f87171",
      date: attempt.submittedAt // useful for frontend debugging if needed
    }))
  }

  async getSubjectPerformance(studentId: string, from?: string, to?: string, subjectId?: string) {
    const whereClause: any = {
      studentId,
      status: "SUBMITTED" as any,
    }

    if (from && to) {
      const startDate = new Date(from)
      const endDate = new Date(to)
      endDate.setHours(23, 59, 59, 999)

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        whereClause.submittedAt = {
          gte: startDate,
          lte: endDate,
        }
      }
    }

    // 1. Get Metrics for ALL subjects (Date filtered)
    const attempts = await prisma.examAttempt.findMany({
      where: whereClause,
      include: {
        paper: {
          include: {
            subject: true,
          },
        },
      },
    })

    const subjectMap = new Map<string, { id: string; totalScore: number; count: number }>()

    attempts.forEach((attempt) => {
      const subjectName = attempt.paper.subject.name
      const subjId = attempt.paper.subject.id
      const current = subjectMap.get(subjectName) || { id: subjId, totalScore: 0, count: 0 }
      subjectMap.set(subjectName, {
        id: subjId,
        totalScore: current.totalScore + attempt.percentage,
        count: current.count + 1,
      })
    })

    const metrics: { subjectId: string; subject: string; score: number; count: number; color: string }[] = []
    const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]

    let i = 0
    subjectMap.forEach((value, key) => {
      metrics.push({
        subjectId: value.id,
        subject: key,
        score: Math.round(value.totalScore / value.count),
        count: value.count,
        color: colors[i % colors.length],
      })
      i++
    })

    // PERFORMANCE OPTIMIZATION (Fix O(N) issue)
    // Avoid calculating averages in JS logic if list is huge in future.
    // For now, map logic is OK, but for Rank calculation below we must optimize.

    // 2. Identify Target Subject
    let targetSubjectName = "Overall"
    let targetSubjectId = subjectId

    if (subjectId) {
      const found = metrics.find(m => m.subjectId === subjectId)
      if (found) targetSubjectName = found.subject
    } else if (metrics.length > 0) {
      // Default to best subject if none selected
      const bestSubject = [...metrics].sort((a, b) => b.score - a.score)[0]
      targetSubjectId = bestSubject.subjectId
      targetSubjectName = bestSubject.subject
    }

    // 3. Get Detailed Analysis for Target Subject (Rank & History)
    let analysis = {
      rank: 0,
      totalPeers: 0, // Total students in this subject
      history: [] as any[],
    }

    if (targetSubjectId) {
      // A. History (Trend)
      // Re-use attempts if possible, but we need Paper Details and max scores
      // It's cleaner to query specific attempts for this subject to include specific details
      const subjectAttempts = attempts
        .filter(a => a.paper.subject.id === targetSubjectId)
        .sort((a, b) => a.submittedAt!.getTime() - b.submittedAt!.getTime())

      // Get Max Scores for these papers (to show "Highest Rank/Score")
      const paperIds = [...new Set(subjectAttempts.map(a => a.paperId))]

      const maxScores = await prisma.examAttempt.groupBy({
        by: ["paperId"],
        _max: {
          percentage: true,
        },
        where: {
          paperId: { in: paperIds },
          status: "SUBMITTED" as any
        }
      })

      const maxScoreMap = new Map(maxScores.map(m => [m.paperId, m._max.percentage || 0]))

      analysis.history = subjectAttempts.map((attempt, idx) => ({
        x: idx + 1,
        y: attempt.percentage,
        date: attempt.submittedAt,
        highestScore: maxScoreMap.get(attempt.paperId) || 100
      }))

      // B. Rank Calculation (OPTIMIZED)
      // Rank of this student in this Subject (Average of all their tests vs others)

      // 1. Get average percentage for the current student in this subject
      // We can do this via aggregation or filtering the attempts we already have (if we trust 'attempts' includes all)
      // However, 'attempts' is filtered by DATE range if provided. If we want global rank, we should respect the dates too.
      // Filter 'attempts' for this subject and student -> calculate average
      const mySubjectAttempts = attempts.filter(a => a.paper.subject.id === targetSubjectId)
      let myTotal = 0
      mySubjectAttempts.forEach(a => myTotal += a.percentage)
      const myAvg = mySubjectAttempts.length > 0 ? myTotal / mySubjectAttempts.length : 0

      // 2. Count students with HIGHER average percentage in the same period
      // This requires grouping by studentId and averaging
      const betterStudents = await prisma.examAttempt.groupBy({
        by: ["studentId"],
        _avg: { percentage: true },
        where: {
          paper: { subjectId: targetSubjectId },
          status: "SUBMITTED" as any,
          ...(whereClause.submittedAt ? { submittedAt: whereClause.submittedAt } : {})
        },
        having: {
          percentage: { _avg: { gt: myAvg } }
        }
      })

      // 3. Get total peers count (groups)
      const totalPeersGroups = await prisma.examAttempt.groupBy({
        by: ["studentId"],
        where: {
          paper: { subjectId: targetSubjectId },
          status: "SUBMITTED" as any,
          ...(whereClause.submittedAt ? { submittedAt: whereClause.submittedAt } : {})
        },
      })

      analysis.totalPeers = totalPeersGroups.length
      analysis.rank = betterStudents.length + 1
    }

    return {
      currentSubject: targetSubjectName,
      currentSubjectId: targetSubjectId,
      metrics,
      analysis
    }
  }

  async getSyllabusCoverage(studentId: string) {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: { chapters: true },
        },
      },
    })

    const passedAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        status: "SUBMITTED" as any,
        percentage: { gt: 40 },
      },
      select: {
        paper: {
          select: {
            chapters: {
              select: { chapterId: true },
            },
            subjectId: true,
          },
        },
      },
    })

    const coveredChaptersBySubject = new Map<string, Set<string>>()

    passedAttempts.forEach((attempt) => {
      const subjectId = attempt.paper.subjectId
      if (!coveredChaptersBySubject.has(subjectId)) {
        coveredChaptersBySubject.set(subjectId, new Set())
      }

      const set = coveredChaptersBySubject.get(subjectId)!
      attempt.paper.chapters.forEach((pc) => set.add(pc.chapterId))
    })

    const colors = [
      { color: "bg-blue-500", hex: "#3b82f6" },
      { color: "bg-purple-500", hex: "#8b5cf6" },
      { color: "bg-pink-500", hex: "#ec4899" },
      { color: "bg-orange-500", hex: "#f97316" },
    ]

    return subjects.map((sub, idx) => {
      const coveredCount = coveredChaptersBySubject.get(sub.id)?.size || 0
      const colorSet = colors[idx % colors.length]
      const total = sub._count.chapters || 1

      return {
        subject: sub.name,
        completedChapters: coveredCount,
        totalChapters: total,
        color: colorSet.color,
        hexColor: colorSet.hex,
      }
    })
  }


  async getNotificationData(studentId: string) {
    const dbNotifications = await (prisma as any).notification.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    let notifications = dbNotifications.map((n: any) => ({
      id: n.id,
      avatar: "", // System default or specific icon
      author: "System",
      text: n.message,
      time: n.createdAt.toISOString(),
      type: n.type,
      isRead: n.isRead,
      actionUrl: n.actionUrl,
    }))

    // Fallback if no notifications
    if (notifications.length === 0) {
      notifications = [
        {
          id: "welcome-msg",
          avatar: "",
          author: "HubX Team",
          text: "Welcome to your new dashboard! Start by taking a practice test.",
          time: new Date().toISOString(),
          type: "INFO",
          isRead: false,
          actionUrl: "/practice-exams",
        },
      ]
    }

    const weakAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        status: "SUBMITTED" as any,
        percentage: { lt: 50 },
      },
      include: {
        paper: {
          include: {
            subject: true,
          },
        },
      },
      take: 3,
      orderBy: { percentage: "asc" },
    })

    const focusAreas = weakAttempts.map((attempt) => ({
      id: attempt.id,
      subject: attempt.paper.subject.name,
      topic: attempt.paper.title,
      score: Math.round(attempt.percentage),
      scoreColorClass: "text-red-500",
    }))

    return {
      notifications,
      focusAreas,
    }
  }

  async getUpcomingExams(studentId: string) {
    // 1. Get papers student has already attempted
    const attempts = await prisma.examAttempt.findMany({
      where: { studentId },
      select: { paperId: true },
    })
    const attemptedIds = attempts.map((a) => a.paperId)

    // 2. Find internal/practice exams (published, not public) that are not attempted
    // We treat "Upcoming" as "New Available Tests" (Unattempted Practice Papers) since there is no schedule in schema
    const upcomingPapers = await prisma.paper.findMany({
      where: {
        id: { notIn: attemptedIds },
        status: "PUBLISHED" as any,
        isPublic: false, // Internal papers (assigned or general practice)
      },
      include: {
        subject: true,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    })

    // 3. Map to UI format
    return upcomingPapers.map((paper) => ({
      id: paper.id,
      title: paper.title,
      date: paper.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).replace(',', ''),
      time: paper.duration ? `${paper.duration} mins` : "Anytime",
      subject: paper.subject.name,
      type: "Mock Test", // Default type since schema has different enum
    }))
  }

  async getTestRecommendations(studentId: string) {
    const attempted = await prisma.examAttempt.findMany({
      where: { studentId },
      select: { paperId: true },
    })
    const attemptedIds = attempted.map(a => a.paperId)

    const recommendations = await prisma.paper.findMany({
      where: {
        id: { notIn: attemptedIds },
        isPublic: true,
        status: "PUBLISHED" as any,
      },
      take: 3,
      orderBy: {
        totalAttempts: "desc",
      },
    })

    return recommendations
  }

  /**
   * PERFORMANCE OPTIMIZATION: Calculate rank once and cache in Redis
   * Called only when rank is not cached or student submits a new exam
   */
  private async calculateAndCacheStudentRank(studentId: string, studentAvgPercentage: number): Promise<number> {
    try {
      // Get all students' average percentages (expensive query)
      const ranking = await prisma.examAttempt.groupBy({
        by: ["studentId"],
        _avg: { percentage: true },
        orderBy: { _avg: { percentage: "desc" } },
      })

      // Find this student's rank
      const rank = ranking.findIndex((r) => r.studentId === studentId) + 1

      // Cache rank in Redis with 1 hour TTL (refreshed on exam submission)
      await redis.setex(`student:${studentId}:rank`, 3600, rank.toString())

      return rank
    } catch (error) {
      console.error("Error calculating student rank:", error)
      return 0
    }
  }

  /**
   * PERFORMANCE: Invalidate rankings cache when any exam is submitted
   * This ensures fresh rankings without real-time calculation overhead
   */
  async invalidateRankingsCache() {
    try {
      // Get all student IDs with cached ranks
      const keys = await redis.keys("student:*:rank")
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error("Error invalidating rankings cache:", error)
    }
  }

  /**
   * NEW: Get all available subjects with student's performance data
   * Solves: Cold start issue - returns common subjects even if student hasno history
   * 
   * @param studentId - Student's user ID
   * @returns Array of subjects with performance scores and metadata
   */
  async getAllAvailableSubjects(studentId: string) {
    // 1. Get student's performance data (if exists)
    const attempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } as any,
      },
      include: {
        paper: {
          include: {
            subject: {
              include: {
                chapters: true,
              },
            },
          },
        },
      },
    })

    // 2. Build performance map by subject
    const subjectPerformanceMap = new Map<string, {
      id: string
      name: string
      score: number
      count: number
      chapters: any[]
    }>()

    attempts.forEach((attempt) => {
      const subject = attempt.paper.subject
      const existing = subjectPerformanceMap.get(subject.id) || {
        id: subject.id,
        name: subject.name,
        score: 0,
        count: 0,
        chapters: subject.chapters,
      }

      subjectPerformanceMap.set(subject.id, {
        ...existing,
        score: existing.score + attempt.percentage,
        count: existing.count + 1,
      })
    })

    // 3. Get all distinct subjects from the system (to handle cold start)
    const allSubjects = await prisma.subject.findMany({
      include: {
        chapters: true,
      },
      distinct: ["name"], // Get unique subject names
      take: 20, // Limit to common subjects
    })

    // 4. Merge performance data with all subjects
    const subjectsList = allSubjects.map((subject) => {
      const performance = subjectPerformanceMap.get(subject.id)
      const avgScore = performance ? Math.round(performance.score / performance.count) : 0

      // Determine performance level
      let performanceLevel: "Excellent" | "Average" | "Poor" = "Poor"
      if (avgScore >= 70) performanceLevel = "Excellent"
      else if (avgScore >= 40) performanceLevel = "Average"

      // Assign color based on performance
      const colorMap = {
        Excellent: "#4ade80",
        Average: "#f59e0b",
        Poor: "#f87171",
      }

      return {
        id: subject.id,
        name: subject.name,
        score: avgScore,
        performance: performanceLevel,
        color: colorMap[performanceLevel],
        chapters: subject.chapters.map((ch) => ({
          id: ch.id,
          name: ch.name,
          questionCount: 0, // Will be populated if needed
        })),
      }
    })

    return subjectsList
  }

  /**
   * NEW: Generate adaptive assessment based on student selections
   * Solves: Custom assessment creation with intelligent question selection
   * 
   * @param studentId - Student's user ID
   * @param config - Assessment configuration (subjects, chapters, difficulty, duration)
   * @returns Created paper attempt ID ready for exam start
   */
  async generateAdaptiveAssessment(
    studentId: string,
    config: {
      subjectIds: string[]
      chapterIds: string[]
      difficulty: "EASY" | "INTERMEDIATE" | "ADVANCED"
      duration: number | null
    }
  ) {
    const { subjectIds, chapterIds, difficulty, duration } = config

    // 1. Validate subjects exist
    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      include: { chapters: true },
    })

    if (subjects.length === 0) {
      throw new AppError(404, "Selected subjects not found")
    }

    // 2. Determine chapter selection strategy
    let targetChapterIds = chapterIds

    // If no chapters selected, use ALL chapters from selected subjects
    if (targetChapterIds.length === 0) {
      targetChapterIds = subjects.flatMap(s => s.chapters.map(c => c.id))
    }

    // 3. Find available questions matching criteria
    // Strategy: Select from Question Bank OR existing papers
    const availableQuestions = await prisma.question.findMany({
      where: {
        difficulty: difficulty as any,
        paper: {
          chapters: {
            some: {
              chapterId: { in: targetChapterIds },
            },
          },
        },
      },
      include: {
        paper: {
          include: {
            chapters: true,
          },
        },
      },
      take: 100, // Limit initial fetch
    })

    // 4. Intelligent question selection
    // Goal: ~10-20 questions, balanced across selected chapters
    const questionsPerChapter = Math.ceil(15 / targetChapterIds.length)
    const chapterQuestionMap = new Map<string, typeof availableQuestions>()

    availableQuestions.forEach((q) => {
      q.paper.chapters.forEach((pc) => {
        if (targetChapterIds.includes(pc.chapterId)) {
          const existing = chapterQuestionMap.get(pc.chapterId) || []
          chapterQuestionMap.set(pc.chapterId, [...existing, q])
        }
      })
    })

    const selectedQuestions: typeof availableQuestions = []
    chapterQuestionMap.forEach((questions) => {
      const shuffled = questions.sort(() => Math.random() - 0.5)
      selectedQuestions.push(...shuffled.slice(0, questionsPerChapter))
    })

    // Ensure minimum 5 questions
    if (selectedQuestions.length < 5) {
      throw new AppError(400, "Not enough questions available for selected criteria. Try selecting more chapters or different difficulty.")
    }

    // 5. Create adaptive paper
    const paper = await prisma.paper.create({
      data: {
        title: `Custom ${difficulty} Assessment - ${new Date().toLocaleDateString()}`,
        description: "AI-generated adaptive assessment based on your selections",
        standard: 10, // Default standard
        teacherId: studentId, // Use student as "creator" for tracking
        subjectId: subjectIds[0], // Primary subject
        difficulty: difficulty as any,
        type: duration ? "TIME_BOUND" : "NO_LIMIT",
        duration: duration,
        status: "PUBLISHED" as any,
        isPublic: false,
      },
    })

    // 6. Clone selected questions into the new paper
    const questionPromises = selectedQuestions.map((q, index) =>
      prisma.question.create({
        data: {
          paperId: paper.id,
          type: q.type,
          difficulty: q.difficulty,
          questionText: q.questionText,
          questionImage: q.questionImage,
          options: q.options as any, // Prisma JsonValue type compatibility
          correctOption: q.correctOption,
          caseSensitive: q.caseSensitive,
          solutionText: q.solutionText,
          solutionImage: q.solutionImage,
          marks: q.marks,
          order: index + 1,
        },
      })
    )

    await Promise.all(questionPromises)

    // 7. Link selected chapters to paper
    const chapterLinkPromises = targetChapterIds.map((chapterId) =>
      prisma.paperChapter.create({
        data: {
          paperId: paper.id,
          chapterId,
        },
      })
    )

    await Promise.all(chapterLinkPromises)

    // 8. Return paper info for frontend to start exam
    return {
      paperId: paper.id,
      title: paper.title,
      questionCount: selectedQuestions.length,
      duration: paper.duration,
      totalMarks: selectedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0),
    }
  }
}

export const studentService = new StudentService()
