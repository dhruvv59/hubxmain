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

    // Calculate total number of students with exam attempts
    const totalStudents = await prisma.examAttempt.groupBy({
      by: ["studentId"],
    }).then(results => results.length)

    // Calculate percentile rank (what % of students is this student better than)
    const percentile = totalStudents > 0 ? await this.calculatePercentile(rank, totalStudents) : 0

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
        percentile, // Percentile rank among all students (0-100)
        averageScore,
        averagePercentage,
        averageTime: Math.round(averageTime),
        totalAttempts,
        totalStudents, // Total number of students for percentile calculation
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
        duration: true,
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: { select: { examAttempts: true, questions: true } },
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

  async getPracticeExams(
    studentId: string,
    page = 1,
    limit = 10,
    filters: {
      subject?: string
      search?: string
      difficulty?: string
      type?: string // 'all' | 'assigned' | 'practice' | 'bookmarked'
      status?: string // 'all' | 'not-started' | 'in-progress' | 'completed'
    } = {}
  ) {
    const skip = (page - 1) * limit

    // ==========================================
    // 1. BUILD WHERE CLAUSE (SERVER-SIDE FILTERING)
    // ==========================================
    const whereClause: any = {
      status: PAPER_STATUS.PUBLISHED as any,
      isPublic: false,
    }

    // Subject filter (by subject name)
    if (filters.subject && filters.subject !== 'All') {
      whereClause.subject = {
        name: filters.subject,
      }
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty !== 'all') {
      whereClause.difficulty = filters.difficulty.toUpperCase()
    }

    // Search filter (title or subject name)
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim()
      whereClause.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { subject: { name: { contains: searchTerm } } },
      ]
    }

    // Type filter: 'assigned' means only papers assigned to this student
    if (filters.type === 'assigned') {
      whereClause.assignments = {
        some: { studentId },
      }
    }

    // Type filter: 'bookmarked' means only bookmarked papers
    if (filters.type === 'bookmarked') {
      whereClause.bookmarks = {
        some: { studentId },
      }
    }

    // ==========================================
    // 2. FETCH PAPERS WITH STATUS-AWARE PAGINATION
    // ==========================================

    // If filtering by studentStatus, we need to fetch all matching papers first,
    // then filter by status and paginate
    const needsStatusFilter = filters.status && filters.status !== 'all'

    const fetchLimit = needsStatusFilter ? 1000 : limit  // If status filter, fetch more then filter
    const fetchSkip = needsStatusFilter ? 0 : skip

    const papers = await prisma.paper.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        type: true,
        duration: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
        questions: {
          select: {
            marks: true,
          },
        },
        // Include assignments for this student
        assignments: {
          where: { studentId },
          select: {
            id: true,
            dueDate: true,
            note: true,
            isCompleted: true,
            assignedBy: true,
            teacher: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            createdAt: true,
          },
        },
        // Include bookmarks for this student
        bookmarks: {
          where: { studentId },
          select: { id: true },
        },
      },
      skip: fetchSkip,
      take: fetchLimit,
      orderBy: { createdAt: "desc" },
    })

    // ==========================================
    // 3. FETCH STUDENT ATTEMPTS (MULTI-ATTEMPT SUPPORT)
    // ==========================================
    const paperIds = papers.map((p) => p.id)
    const studentAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        paperId: { in: paperIds },
      },
      select: {
        paperId: true,
        id: true,
        status: true,
        totalScore: true,
        totalMarks: true,
        percentage: true,
        attemptNumber: true,
        startedAt: true,
        submittedAt: true,
      },
      orderBy: { createdAt: "desc" }, // Latest attempt first
    })

    // Build attempt lookup map: paperId -> ALL attempts (sorted most recent first)
    const attemptMap = new Map<string, typeof studentAttempts>()
    studentAttempts.forEach((attempt) => {
      const existing = attemptMap.get(attempt.paperId) || []
      existing.push(attempt)
      attemptMap.set(attempt.paperId, existing)
    })

    // ==========================================
    // 4. MAP PAPERS WITH STATUS & ENRICHED DATA
    // ==========================================
    const papersWithStatus = papers.map((paper) => {
      const attempts = attemptMap.get(paper.id) || []
      const latestAttempt = attempts[0] // Most recent attempt
      const assignment = paper.assignments[0] // Assignment for this student (if any)
      const isBookmarked = paper.bookmarks.length > 0

      let studentStatus: "not-started" | "in-progress" | "completed" = "not-started"
      let score: number | undefined
      let percentage: number | undefined
      let attemptId: string | undefined
      let lastAttemptedAt: string | undefined
      let bestScore: number | undefined
      let bestPercentage: number | undefined

      if (latestAttempt) {
        attemptId = latestAttempt.id
        if (latestAttempt.status === EXAM_STATUS.SUBMITTED || latestAttempt.status === EXAM_STATUS.AUTO_SUBMITTED) {
          studentStatus = "completed"
          score = latestAttempt.totalScore
          percentage = latestAttempt.percentage
          lastAttemptedAt = latestAttempt.submittedAt?.toISOString()
        } else if (latestAttempt.status === EXAM_STATUS.ONGOING) {
          studentStatus = "in-progress"
          lastAttemptedAt = latestAttempt.startedAt?.toISOString()
        }
      }

      // Calculate best score across all completed attempts
      const completedAttempts = attempts.filter(
        (a) => a.status === EXAM_STATUS.SUBMITTED || a.status === EXAM_STATUS.AUTO_SUBMITTED
      )
      if (completedAttempts.length > 0) {
        bestScore = Math.max(...completedAttempts.map((a) => a.totalScore))
        bestPercentage = Math.max(...completedAttempts.map((a) => a.percentage))
      }

      const totalMarks = paper.questions.reduce((sum, q) => sum + q.marks, 0)

      // Determine paper category for frontend
      let paperCategory: "practice" | "assigned" | "previous" = "practice"
      if (assignment) {
        paperCategory = "assigned"
      }

      return {
        id: paper.id,
        title: paper.title,
        description: paper.description,
        difficulty: paper.difficulty,
        type: paper.type,
        paperCategory, // 'practice' | 'assigned' | 'previous'
        duration: paper.duration,
        price: paper.price,
        createdAt: paper.createdAt,
        updatedAt: paper.updatedAt,
        subject: paper.subject,
        questionsCount: paper._count.questions,
        totalMarks,
        // Student-specific status
        studentStatus,
        score,
        percentage,
        attemptId,
        lastAttemptedAt,
        // Multi-attempt data
        totalAttempts: attempts.length,
        bestScore,
        bestPercentage,
        // Assignment data
        isAssigned: !!assignment,
        dueDate: assignment?.dueDate?.toISOString(),
        assignedBy: assignment ? `${assignment.teacher.firstName} ${assignment.teacher.lastName}` : undefined,
        assignedByAvatar: assignment?.teacher.avatar,
        assignmentNote: assignment?.note,
        assignmentCompleted: assignment?.isCompleted || false,
        // Bookmark data
        isBookmarked,
      }
    })

    // ==========================================
    // 5. APPLY STATUS FILTER (post-query, pre-pagination)
    // ==========================================
    let filteredPapers = papersWithStatus
    if (needsStatusFilter) {
      filteredPapers = papersWithStatus.filter((p) => p.studentStatus === filters.status)
    }

    // Manual pagination after status filtering
    const totalFiltered = needsStatusFilter ? filteredPapers.length : undefined
    if (needsStatusFilter) {
      filteredPapers = filteredPapers.slice(skip, skip + limit)
    }

    // ==========================================
    // 6. COLLECT UNIQUE SUBJECTS (for filter pills)
    // ==========================================
    const allSubjects = await prisma.paper.findMany({
      where: {
        status: PAPER_STATUS.PUBLISHED as any,
        isPublic: false,
      },
      select: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      distinct: ["subjectId"],
    })

    const uniqueSubjects = allSubjects.map((p) => p.subject)

    // ==========================================
    // 7. CALCULATE STATS (real data, not hardcoded)
    // ==========================================

    // Total published private papers (unfiltered count)
    const totalPapers = await prisma.paper.count({
      where: {
        status: PAPER_STATUS.PUBLISHED as any,
        isPublic: false,
      },
    })

    // Count papers filtered by the where clause (for pagination)
    const totalForPagination = needsStatusFilter
      ? totalFiltered!
      : await prisma.paper.count({ where: whereClause })

    // Get attempt stats for THIS student across ALL papers (not just current page)
    const attemptStats = await prisma.examAttempt.groupBy({
      by: ["status"],
      where: {
        studentId,
        paper: {
          status: PAPER_STATUS.PUBLISHED as any,
          isPublic: false,
        },
      },
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

    // Get assigned count for this student (real data)
    const assignedCount = await prisma.paperAssignment.count({
      where: {
        studentId,
        isCompleted: false,
        paper: {
          status: PAPER_STATUS.PUBLISHED as any,
        },
      },
    })

    return {
      papers: filteredPapers,
      subjects: uniqueSubjects,
      stats: {
        total: totalPapers,
        completed: completedCount,
        inProgress: inProgressCount,
        assigned: assignedCount,
        notStarted: Math.max(0, totalPapers - (completedCount + inProgressCount)),
      },
      pagination: {
        page,
        limit,
        total: totalForPagination,
        pages: Math.ceil(totalForPagination / limit),
      },
    }
  }

  // ==========================================
  // BOOKMARK MANAGEMENT
  // ==========================================

  async toggleBookmark(studentId: string, paperId: string) {
    // Check if paper exists
    const paper = await prisma.paper.findUnique({ where: { id: paperId } })
    if (!paper) {
      throw new AppError(404, ERROR_MESSAGES.PAPER_NOT_FOUND)
    }

    // Check if already bookmarked
    const existing = await prisma.paperBookmark.findUnique({
      where: {
        paperId_studentId: { paperId, studentId },
      },
    })

    if (existing) {
      // Remove bookmark
      await prisma.paperBookmark.delete({
        where: { id: existing.id },
      })
      return { bookmarked: false }
    } else {
      // Add bookmark
      await prisma.paperBookmark.create({
        data: { paperId, studentId },
      })
      return { bookmarked: true }
    }
  }

  async getBookmarks(studentId: string) {
    const bookmarks = await prisma.paperBookmark.findMany({
      where: { studentId },
      select: { paperId: true },
    })
    return bookmarks.map((b) => b.paperId)
  }

  // ==========================================
  // PAPER ASSIGNMENT (Teacher → Student)
  // ==========================================

  async assignPaper(
    teacherId: string,
    paperId: string,
    studentIds: string[],
    dueDate?: string,
    note?: string
  ) {
    // Validate paper exists and belongs to teacher
    const paper = await prisma.paper.findFirst({
      where: {
        id: paperId,
        teacherId,
        status: PAPER_STATUS.PUBLISHED as any,
      },
    })

    if (!paper) {
      throw new AppError(404, "Paper not found or not published")
    }

    // Validate student IDs
    const students = await prisma.user.findMany({
      where: {
        id: { in: studentIds },
        role: "STUDENT",
      },
      select: { id: true },
    })

    const validStudentIds = students.map((s) => s.id)

    // Create assignments (skip duplicates)
    const assignments = await Promise.all(
      validStudentIds.map(async (sid) => {
        try {
          return await prisma.paperAssignment.create({
            data: {
              paperId,
              studentId: sid,
              assignedBy: teacherId,
              dueDate: dueDate ? new Date(dueDate) : null,
              note,
            },
          })
        } catch (err: any) {
          // Skip duplicate assignments (unique constraint violation)
          if (err?.code === "P2002") return null
          throw err
        }
      })
    )

    // Create notifications for assigned students
    await Promise.all(
      validStudentIds.map((sid) =>
        prisma.notification.create({
          data: {
            userId: sid,
            title: "New Paper Assigned",
            message: `You have been assigned "${paper.title}". ${dueDate ? `Due: ${new Date(dueDate).toLocaleDateString()}` : ""}`,
            type: "INFO",
            actionUrl: "/practice-papers",
          },
        })
      )
    )

    return {
      assigned: assignments.filter(Boolean).length,
      total: studentIds.length,
      skipped: studentIds.length - validStudentIds.length,
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

  /**
   * Calculate percentile rank for a student within a specific date range
   * Returns the student's percentile among all students for the given period
   */
  async getPercentileForDateRange(studentId: string, from?: string, to?: string) {
    try {
      const whereClause: any = {
        status: "SUBMITTED" as any,
      }

      // Build date filter for all students
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

      // Get this student's average score for the period
      const studentAttempts = await prisma.examAttempt.findMany({
        where: {
          ...whereClause,
          studentId,
        },
      })

      if (studentAttempts.length === 0) {
        return 0 // No data for this period
      }

      const studentAvgScore =
        studentAttempts.reduce((sum, a) => sum + a.percentage, 0) / studentAttempts.length

      // Get all students' average scores for comparison
      const allStudentsData = await prisma.examAttempt.groupBy({
        by: ["studentId"],
        where: whereClause,
        _avg: { percentage: true },
      })

      if (allStudentsData.length === 0) {
        return 0
      }

      // Count how many students scored better than this student
      const betterCount = allStudentsData.filter(
        (s) => (s._avg.percentage || 0) > studentAvgScore
      ).length

      const totalStudents = allStudentsData.length

      // Calculate percentile: what percentage of students are you better than
      // Edge case: if only 1 student, they're at 100th percentile
      if (totalStudents === 1) {
        return 100
      }

      // Standard calculation: (number of students you're better than / total) * 100
      const percentile = Math.round(((totalStudents - betterCount - 1) / (totalStudents - 1)) * 100)

      return Math.max(0, Math.min(100, percentile)) // Clamp between 0-100
    } catch (error) {
      console.error("Error calculating percentile for date range:", error)
      return 0
    }
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

  /**
   * FEATURE 1: SYLLABUS COVERAGE
   * Tracks chapter progress across subjects for student
   *
   * Algorithm:
   * 1. Get all subjects from student's attempted papers
   * 2. Count total chapters per subject
   * 3. Count completed chapters (score >= 40%)
   * 4. Assign colors dynamically
   * 5. Filter to only subjects attempted
   */
  async getSyllabusCoverage(studentId: string) {
    try {
      // Step 1: Get all subjects from student's attempted papers
      const studentPapers = await prisma.paper.findMany({
        where: {
          examAttempts: {
            some: { studentId },
          },
        },
        select: {
          subjectId: true,
          subject: {
            select: {
              id: true,
              name: true,
              chapters: { select: { id: true } },
            },
          },
        },
        distinct: ["subjectId"],
      })

      if (studentPapers.length === 0) {
        return [] // Student hasn't attempted anything yet
      }

      // Step 2: Get all passed attempts (score >= 40%) with chapters
      const passedAttempts = await prisma.examAttempt.findMany({
        where: {
          studentId,
          status: "SUBMITTED" as any,
          percentage: { gte: 40 }, // Only count passed attempts
        },
        select: {
          paperId: true,
          percentage: true,
          paper: {
            select: {
              subjectId: true,
              chapters: {
                select: { chapterId: true },
              },
            },
          },
        },
      })

      // Step 3: Aggregate chapters covered per subject
      const coverageMap = new Map<
        string,
        {
          name: string
          totalChapters: number
          coveredChapters: Set<string>
        }
      >()

      // Initialize with all subjects and their chapter counts
      studentPapers.forEach((paper) => {
        const subjectId = paper.subject.id
        if (!coverageMap.has(subjectId)) {
          coverageMap.set(subjectId, {
            name: paper.subject.name,
            totalChapters: paper.subject.chapters.length || 1,
            coveredChapters: new Set<string>(),
          })
        }
      })

      // Add covered chapters from passed attempts
      passedAttempts.forEach((attempt) => {
        const subject = coverageMap.get(attempt.paper.subjectId)
        if (subject) {
          attempt.paper.chapters.forEach((pc) => {
            subject.coveredChapters.add(pc.chapterId)
          })
        }
      })

      // Step 4: Transform to frontend format with colors
      const colors = [
        { hex: "#86efac", tailwind: "bg-green-400" },
        { hex: "#60a5fa", tailwind: "bg-blue-400" },
        { hex: "#c084fc", tailwind: "bg-purple-400" },
        { hex: "#f472b6", tailwind: "bg-pink-400" },
        { hex: "#fb923c", tailwind: "bg-orange-400" },
        { hex: "#34d399", tailwind: "bg-emerald-400" },
      ]

      const result = Array.from(coverageMap.values())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((subject, index) => {
          const color = colors[index % colors.length]
          return {
            subject: subject.name,
            totalChapters: subject.totalChapters,
            completedChapters: subject.coveredChapters.size,
            hexColor: color.hex,
            color: color.tailwind,
          }
        })

      return result
    } catch (error) {
      console.error("[SyllabusCoverage] Error:", error)
      throw new AppError(500, "Failed to fetch syllabus coverage")
    }
  }


  /**
   * FEATURE 4: NOTIFICATIONS & FOCUS AREAS (ENHANCED)
   * Shows real notifications + AI-detected weak areas
   *
   * Algorithm:
   * 1. Fetch real notifications from DB
   * 2. Detect weak areas from exam performance
   * 3. Assign colors based on severity
   * 4. Return formatted data
   */
  async getNotificationData(studentId: string) {
    try {
      // Step 1: Fetch real notifications
      const dbNotifications = await (prisma as any).notification.findMany({
        where: { userId: studentId },
        orderBy: { createdAt: "desc" },
        take: 10,
      })

      const notifications = dbNotifications.map((n: any) => ({
        id: n.id,
        avatar: n.senderAvatar || undefined,
        author: n.senderName || "HubX System",
        text: n.message,
      }))

      // Step 2: Detect focus areas from weak performance
      const focusAreas = await this.detectWeakAreas(studentId)

      return {
        notifications: notifications.length > 0 ? notifications : [],
        focusAreas,
      }
    } catch (error) {
      console.error("[NotificationData] Error:", error)
      return {
        notifications: [],
        focusAreas: [],
      }
    }
  }

  /**
   * Helper: Detect student's weak areas using AI-like logic
   *
   * Algorithm:
   * 1. Get all submitted attempts
   * 2. Calculate chapter-wise performance
   * 3. Find chapters with score < 50%
   * 4. Sort by severity (lowest score first)
   * 5. Assign colors based on score
   * 6. Return top 3-5 focus areas
   */
  private async detectWeakAreas(studentId: string) {
    try {
      // Step 1: Get all submitted attempts with details
      const attempts = await prisma.examAttempt.findMany({
        where: {
          studentId,
          status: "SUBMITTED" as any,
        },
        include: {
          paper: {
            include: {
              chapters: {
                include: {
                  chapter: { select: { name: true } },
                },
              },
              subject: { select: { name: true, id: true } },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        take: 20,
      })

      if (attempts.length === 0) {
        return []
      }

      // Step 2: Analyze chapter-wise performance
      const chapterPerformance = new Map<
        string,
        {
          chapterName: string
          subjectId: string
          subjectName: string
          totalScore: number
          count: number
          avgScore: number
        }
      >()

      attempts.forEach((attempt) => {
        attempt.paper.chapters.forEach((pc) => {
          const key = `${pc.chapter.name}|${attempt.paper.subjectId}`
          const current = chapterPerformance.get(key) || {
            chapterName: pc.chapter.name,
            subjectId: attempt.paper.subjectId,
            subjectName: attempt.paper.subject.name,
            totalScore: 0,
            count: 0,
            avgScore: 0,
          }

          current.totalScore += attempt.percentage
          current.count += 1
          current.avgScore = current.totalScore / current.count

          chapterPerformance.set(key, current)
        })
      })

      // Step 3: Filter weak areas (score < 50%)
      const weakAreas = Array.from(chapterPerformance.values())
        .filter((c) => c.avgScore < 50)
        .sort((a, b) => a.avgScore - b.avgScore)

      // Step 4: Assign colors based on severity
      const focusAreas = weakAreas.slice(0, 5).map((area) => {
        let colorClass = "text-red-600" // Critical < 30%
        if (area.avgScore >= 30) {
          colorClass = "text-orange-600" // Warning 30-40%
        }
        if (area.avgScore >= 40) {
          colorClass = "text-yellow-600" // Improvement 40-50%
        }

        return {
          id: `${area.subjectId}|${area.chapterName}`,
          subject: area.subjectName,
          topic: area.chapterName,
          score: `${Math.round(area.avgScore)}%`,
          scoreColorClass: colorClass,
        }
      })

      return focusAreas
    } catch (error) {
      console.error("[DetectWeakAreas] Error:", error)
      return []
    }
  }

  /**
   * FEATURE 3: UPCOMING EXAMS (ENHANCED)
   * Shows available unattempted papers that student can take
   *
   * Algorithm:
   * 1. Get all attempted paper IDs
   * 2. Find published unattempted papers
   * 3. Format with proper date/time
   * 4. Sort by recency
   * 5. Return top 5
   */
  async getUpcomingExams(studentId: string) {
    try {
      // Step 1: Get attempted papers
      const attemptedPaperIds = await prisma.examAttempt.findMany({
        where: { studentId },
        select: { paperId: true },
      }).then(a => a.map(x => x.paperId))

      // Step 2: Find unattempted, published papers
      const upcomingPapers = await prisma.paper.findMany({
        where: {
          id: { notIn: attemptedPaperIds },
          status: "PUBLISHED" as any,
        },
        include: {
          subject: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })

      // Step 3: Format for frontend
      const result = upcomingPapers.map((paper) => {
        // Format date as "12 Oct" (day and month only)
        const dateStr = new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "short",
        }).format(paper.createdAt)

        // Format time: either "45 mins" or "Anytime"
        const timeStr = paper.duration ? `${paper.duration} mins` : "Anytime"

        return {
          id: paper.id,
          title: paper.title,
          date: dateStr,
          time: timeStr,
          subject: paper.subject.name,
          type: paper.isPublic ? "Full Mock" : "Practice",
        }
      })

      return result
    } catch (error) {
      console.error("[UpcomingExams] Error:", error)
      throw new AppError(500, "Failed to fetch upcoming exams")
    }
  }

  /**
   * FEATURE 2: TEST RECOMMENDATIONS (ENHANCED)
   * Recommends tests based on student's weak areas
   *
   * Algorithm:
   * 1. Analyze subject-wise performance
   * 2. Identify weak subjects (avg score < 60%)
   * 3. Find unattempted papers in weak subjects
   * 4. Rank by: relevance score (weakness + popularity + difficulty + recency)
   * 5. Return top 5 recommendations
   *
   * Ranking Score Formula:
   * score = weakness_bonus (0-3) + popularity (0-2) + difficulty_match (0-1.5) + recency (0-1)
   */
  async getTestRecommendations(studentId: string) {
    try {
      // Step 1: Get student's performance by subject
      const performanceBySubject = await this.getSubjectPerformance(studentId)

      if (!performanceBySubject || performanceBySubject.metrics.length === 0) {
        // Cold start: student hasn't attempted anything, recommend popular papers
        return await this.getPopularPapersForNewStudent()
      }

      // Step 2: Identify weak subjects (score < 60%)
      const weakSubjects = performanceBySubject.metrics
        .filter((m: any) => m.score < 60)
        .map((m: any) => m.subjectId)

      // Step 3: Get unattempted papers
      const attemptedPaperIds = await prisma.examAttempt.findMany({
        where: { studentId },
        select: { paperId: true },
      }).then(a => a.map(x => x.paperId))

      // Step 4: Find papers in weak subjects or high-attempt papers
      const candidatePapers = await prisma.paper.findMany({
        where: {
          id: { notIn: attemptedPaperIds },
          status: "PUBLISHED" as any,
          isPublic: true,
          OR: [
            { subjectId: { in: weakSubjects } },
            { totalAttempts: { gte: 10 } },
          ],
        },
        include: {
          subject: { select: { name: true } },
          _count: { select: { questions: true } },
        },
        take: 20,
      })

      if (candidatePapers.length === 0) {
        return []
      }

      // Step 5: Score and rank papers
      const scoredPapers = candidatePapers.map((paper) => {
        let score = 0

        // Bonus: In weak subject (3 points)
        if (weakSubjects.includes(paper.subjectId)) {
          score += 3
        }

        // Bonus: Popular (0-2 points)
        score += Math.min(paper.totalAttempts / 20, 2)

        // Bonus: Difficulty match - medium for practice (0-1.5 points)
        if (paper.difficulty === "INTERMEDIATE") {
          score += 1.5
        } else if (paper.difficulty === "EASY") {
          score += 0.5
        }

        // Bonus: Recent papers (0-1 point)
        const daysSinceCreation = Math.floor(
          (Date.now() - paper.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSinceCreation < 7) score += 1
        if (daysSinceCreation < 30) score += 0.5

        return { ...paper, _score: score }
      })

      // Step 6: Sort by score and return top 5
      const recommendations = scoredPapers
        .sort((a, b) => b._score - a._score)
        .slice(0, 5)
        .map((paper) => ({
          id: paper.id,
          title: paper.title,
          subject: paper.subject.name,
          difficulty: paper.difficulty as "EASY" | "INTERMEDIATE" | "ADVANCED",
          questions: paper._count.questions,
          time: paper.duration || 0,
          type: this.getPaperType(paper.difficulty),
        }))

      return recommendations
    } catch (error) {
      console.error("[TestRecommendations] Error:", error)
      return await this.getPopularPapersForNewStudent()
    }
  }

  /**
   * Helper: Get popular papers for students with no history
   */
  private async getPopularPapersForNewStudent() {
    const papers = await prisma.paper.findMany({
      where: {
        isPublic: true,
        status: "PUBLISHED" as any,
      },
      include: {
        subject: { select: { name: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { totalAttempts: "desc" },
      take: 5,
    })

    return papers.map((p) => ({
      id: p.id,
      title: p.title,
      subject: p.subject.name,
      difficulty: p.difficulty as "EASY" | "INTERMEDIATE" | "ADVANCED",
      questions: p._count.questions,
      time: p.duration || 0,
      type: this.getPaperType(p.difficulty),
    }))
  }

  /**
   * Helper: Map difficulty to paper type
   */
  private getPaperType(difficulty: string): string {
    const typeMap: Record<string, string> = {
      EASY: "Practice",
      INTERMEDIATE: "Full Mock",
      ADVANCED: "Challenge",
    }
    return typeMap[difficulty] || "Practice"
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
   * Calculate percentile rank for a student
   * Percentile = (number of students you're better than / total students) * 100
   * If there's only 1 student, they're at the 100th percentile (top)
   */
  private async calculatePercentile(rank: number, totalStudents: number): Promise<number> {
    if (totalStudents === 0) return 0
    if (totalStudents === 1) return 100 // Only student = 100th percentile

    // Percentile: how many students are you better than / total students * 100
    // If rank = 1 and totalStudents = 100: you're better than 99 students = 99th percentile
    const percentile = Math.round(((totalStudents - rank) / totalStudents) * 100)
    return Math.max(0, Math.min(100, percentile)) // Clamp between 0-100
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

    // 4. Fetch question counts for all chapters in parallel
    const chapterQuestionCounts = new Map<string, number>()
    const allChapters = allSubjects.flatMap((s) => s.chapters)

    const countPromises = allChapters.map((chapter) =>
      prisma.question.count({
        where: {
          paper: {
            chapters: {
              some: {
                chapterId: chapter.id,
              },
            },
          },
        },
      }).then((count) => {
        chapterQuestionCounts.set(chapter.id, count)
      })
    )

    await Promise.all(countPromises)

    // 5. Merge performance data with all subjects
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
          questionCount: chapterQuestionCounts.get(ch.id) || 0,
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

    // 3. Get student's purchased papers (for access control)
    const purchases = await prisma.paperPurchase.findMany({
      where: { studentId },
      select: { paperId: true },
    })
    const purchasedPaperIds = purchases.map((p) => p.paperId)

    // 4. Find available questions matching criteria (only from accessible papers)
    // ✅ Access Rule: Private papers (free) OR purchased public papers
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
          // ✅ Access control: Only fetch from PUBLIC papers (free or purchased)
          isPublic: true, // Only public papers (NOT private/draft)
          OR: [
            { price: null },                                    // Free public papers
            { price: 0 },                                       // Free public papers (price = 0)
            { id: { in: purchasedPaperIds } },                 // Purchased public papers
          ],
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

    // 5. Intelligent question selection
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

    // 6. Create adaptive paper
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

    // 7. Clone selected questions into the new paper
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

    // 8. Link selected chapters to paper
    const chapterLinkPromises = targetChapterIds.map((chapterId) =>
      prisma.paperChapter.create({
        data: {
          paperId: paper.id,
          chapterId,
        },
      })
    )

    await Promise.all(chapterLinkPromises)

    // 9. Return paper info for frontend to start exam
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
