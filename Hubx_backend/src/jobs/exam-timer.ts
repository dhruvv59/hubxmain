import redis from "@config/redis"
import { examService } from "@modules/exam/exam.service"

export const startExamTimerWorker = () => {
  // Check for expired timers every 10 seconds
  setInterval(async () => {
    try {
      const keys = await redis.keys("timer:*")

      for (const key of keys) {
        const timerData = await redis.get(key)
        if (!timerData) continue

        const timer = JSON.parse(timerData)
        if (Date.now() >= timer.endTime) {
          // Auto-submit exam
          await examService.autoSubmitExam(timer.attemptId, timer.studentId)
          await redis.del(key)
        }
      }
    } catch (error) {
      console.error("Exam timer worker error:", error)
    }
  }, 10000)
}
