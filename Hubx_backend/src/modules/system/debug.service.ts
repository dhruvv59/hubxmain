/**
 * Developer Debug Service
 * Provides comprehensive system audit and status information for developers
 */

import prisma from "@config/database"
import redis from "@config/redis"
import type { DebugInfo, FeatureStatus, DatabaseStats } from "./types"

export class DebugService {
  /**
   * Get comprehensive debug information for developers
   * Includes: System status, feature checklist, database stats, configuration status
   */
  async getDebugInfo(): Promise<DebugInfo> {
    const [
      systemHealth,
      features,
      database,
      redisStatus,
      environment,
    ] = await Promise.all([
      this.getSystemHealth(),
      this.getFeatureChecklist(),
      this.getDatabaseStats(),
      this.checkRedis(),
      this.getEnvironmentStatus(),
    ])

    return {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV || 'development',
      systemHealth,
      features,
      database,
      redis: redisStatus,
      environment,
    }
  }

  /**
   * Get system health metrics
   */
  private async getSystemHealth() {
    return {
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      database: await this.checkDatabaseHealth(),
      socket: {
        status: 'initialized',
        message: 'Socket.IO configured for real-time communication',
      },
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth() {
    try {
      const startTime = Date.now()
      await prisma.$queryRaw`SELECT 1`
      const latency = Date.now() - startTime

      return {
        status: 'connected',
        latency: `${latency}ms`,
        message: 'Database connection healthy',
      }
    } catch (error: any) {
      return {
        status: 'disconnected',
        latency: 'N/A',
        message: error.message,
      }
    }
  }

  /**
   * Get feature implementation checklist
   */
  private async getFeatureChecklist(): Promise<FeatureStatus[]> {
    const features: FeatureStatus[] = [
      {
        name: 'Authentication',
        status: 'completed',
        endpoints: ['POST /api/auth/login', 'POST /api/auth/signup', 'POST /api/auth/refresh'],
        implemented: true,
        productionReady: true,
      },
      {
        name: 'Student Dashboard',
        status: 'completed',
        endpoints: ['GET /api/student/dashboard', 'GET /api/student/papers'],
        implemented: true,
        productionReady: true,
      },
      {
        name: 'Exam Module',
        status: 'completed',
        endpoints: [
          'POST /api/exam/start/:paperId',
          'POST /api/exam/:attemptId/answer/:questionId',
          'POST /api/exam/:attemptId/submit',
        ],
        implemented: true,
        productionReady: true,
        notes: [
          '✅ OpenAI error handling',
          '✅ Redis-based auto-submit timers',
          '✅ Database transactions',
          '✅ Input validation',
          '✅ Rate limiting (30 saves/min, 5 submits/hour)',
        ],
      },
      {
        name: 'Adaptive Assessment Generator',
        status: 'completed',
        endpoints: ['POST /api/student/generate-assessment'],
        implemented: true,
        productionReady: true,
        notes: [
          '✅ Subject & chapter selection',
          '✅ Intelligent question balancing',
          '✅ Access control validation',
          '✅ Minimum 5 question requirement',
        ],
      },
      {
        name: 'Practice Papers & Filtering',
        status: 'completed',
        endpoints: ['GET /api/student/practice-exams'],
        implemented: true,
        productionReady: true,
        notes: [
          '✅ Subject filtering',
          '✅ Difficulty level filtering',
          '✅ Search functionality',
          '✅ Multi-attempt support',
          '✅ Status-aware pagination',
        ],
      },
      {
        name: 'Paper Assignments',
        status: 'completed',
        endpoints: ['POST /api/student/assign-paper', 'GET /api/student/assignments'],
        implemented: true,
        productionReady: true,
        notes: [
          '✅ Teacher assignment flow',
          '✅ Due date tracking',
          '✅ Completion status',
          '✅ Notification system',
        ],
      },
      {
        name: 'Bookmarking System',
        status: 'completed',
        endpoints: ['POST /api/student/toggle-bookmark', 'GET /api/student/bookmarks'],
        implemented: true,
        productionReady: true,
      },
      {
        name: 'Performance Analytics',
        status: 'completed',
        endpoints: [
          'GET /api/student/dashboard',
          'GET /api/student/subject-performance',
          'GET /api/analytics/teacher',
        ],
        implemented: true,
        productionReady: true,
        notes: [
          '✅ Real-time ranking (Redis cached)',
          '✅ Percentile calculation',
          '✅ Subject-wise performance',
          '✅ Streak tracking (timezone safe)',
          '✅ Syllabus coverage tracking',
        ],
      },
      {
        name: 'Chat System (Real-time)',
        status: 'completed',
        endpoints: ['Socket: chat:message', 'Socket: chat:typing', 'Socket: chat:online'],
        implemented: true,
        productionReady: true,
        notes: [
          '✅ WebSocket integration',
          '✅ Real-time messaging',
          '✅ Typing indicators',
          '✅ Online status',
        ],
      },
      {
        name: 'Doubt System',
        status: 'completed',
        endpoints: [
          'POST /api/exam/:attemptId/:questionId/doubt',
          'GET /api/teacher/doubts',
          'POST /api/teacher/doubt/:id/reply',
        ],
        implemented: true,
        productionReady: true,
        notes: ['✅ Doubt posting', '✅ Teacher responses', '✅ Resolution tracking'],
      },
      {
        name: 'Question Bank (Teacher)',
        status: 'completed',
        endpoints: ['POST /api/teacher/question-bank', 'GET /api/teacher/question-bank'],
        implemented: true,
        productionReady: true,
      },
      {
        name: 'OCR Integration',
        status: 'completed',
        endpoints: ['POST /api/ocr/extract-text'],
        implemented: true,
        productionReady: true,
        notes: ['✅ Tesseract integration for image text extraction'],
      },
      {
        name: 'Payment Gateway',
        status: 'completed',
        endpoints: ['POST /api/payment/create-order', 'POST /api/payment/verify'],
        implemented: true,
        productionReady: true,
        notes: ['✅ Razorpay integration', '✅ Order verification', '✅ Payment tracking'],
      },
      {
        name: 'Coupon System',
        status: 'completed',
        endpoints: ['POST /api/coupons/apply', 'GET /api/coupons/validate/:code'],
        implemented: true,
        productionReady: true,
      },
      {
        name: 'Notification System',
        status: 'completed',
        endpoints: ['GET /api/notifications', 'POST /api/notifications/:id/read'],
        implemented: true,
        productionReady: true,
        notes: [
          '✅ Real-time notifications',
          '✅ Email notifications',
          '✅ In-app notifications',
        ],
      },
      {
        name: 'Support Tickets',
        status: 'completed',
        endpoints: ['POST /api/support/ticket', 'GET /api/support/tickets'],
        implemented: true,
        productionReady: true,
      },
      {
        name: 'AI Features (Future)',
        status: 'planned',
        endpoints: ['POST /api/teacher/ai/generate-questions', 'POST /api/ai/analyze-performance'],
        implemented: false,
        productionReady: false,
        notes: ['Planned for v2.0', 'AI-powered question generation', 'Performance insights'],
      },
    ]

    return features
  }

  /**
   * Get database statistics
   */
  private async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      const [
        users,
        papers,
        questions,
        attempts,
        payments,
        notifications,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.paper.count(),
        prisma.question.count(),
        prisma.examAttempt.count(),
        prisma.payment.count(),
        (prisma as any).notification?.count().catch(() => 0),
      ])

      return {
        status: 'healthy',
        collections: {
          users,
          papers,
          questions,
          examAttempts: attempts,
          payments,
          notifications,
        },
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message,
        collections: {},
      }
    }
  }

  /**
   * Check Redis connection
   */
  private async checkRedis() {
    try {
      const ping = await redis.ping()
      const info = await redis.info()

      return {
        status: ping === 'PONG' ? 'connected' : 'disconnected',
        message: `Redis ${ping === 'PONG' ? 'healthy' : 'unhealthy'}`,
        version: info?.split('\r\n')[1] || 'unknown',
        usedMemory: info
          ? `${Math.round(parseInt(info.split('used_memory:')[1]?.split('\r')[0] || '0') / 1024 / 1024)}MB`
          : 'unknown',
      }
    } catch (error: any) {
      return {
        status: 'disconnected',
        message: `Redis unavailable: ${error.message}`,
      }
    }
  }

  /**
   * Get environment variable status
   */
  private getEnvironmentStatus() {
    const required = [
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'REDIS_URL',
      'PORT',
    ]
    const optional = [
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASS',
      'OPENAI_API_KEY',
      'FRONTEND_URL',
      'S3_BUCKET',
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
    ]

    const requiredStatus = required.map((key) => ({
      name: key,
      configured: !!process.env[key],
      required: true,
    }))

    const optionalStatus = optional.map((key) => ({
      name: key,
      configured: !!process.env[key],
      required: false,
    }))

    const allConfigured = requiredStatus.every((v) => v.configured)
    const missing = requiredStatus.filter((v) => !v.configured).map((v) => v.name)

    return {
      allRequiredConfigured: allConfigured,
      missingRequired: missing,
      required: requiredStatus,
      optional: optionalStatus,
    }
  }
}

export const debugService = new DebugService()
