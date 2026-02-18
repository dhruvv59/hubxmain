import redis from "@config/redis"
import { examService } from "@modules/exam/exam.service"

let isRedisConnected = true

// Monitor Redis connection status
redis.on("connect", () => {
  isRedisConnected = true
  console.log("[Exam Timer Worker] Redis reconnected")
})

redis.on("disconnect", () => {
  isRedisConnected = false
  console.warn("[Exam Timer Worker] Redis disconnected - timers won't process until reconnected")
})

redis.on("error", (err) => {
  console.error("[Exam Timer Worker] Redis error:", err.message)
})

export const startExamTimerWorker = (): NodeJS.Timeout => {
  console.log("[Exam Timer Worker] Started - checks for expired exams every 10 seconds")

  // Check for expired timers every 10 seconds
  return setInterval(async () => {
    // Skip if Redis is disconnected
    if (!isRedisConnected) {
      console.warn("[Exam Timer Worker] Skipping check - Redis not connected")
      return
    }

    try {
      const keys = await redis.keys("timer:*")

      if (keys.length === 0) {
        return // No active timers
      }

      for (const key of keys) {
        try {
          const timerData = await redis.get(key)
          if (!timerData) {
            continue // Key was deleted, skip
          }

          let timer: any
          try {
            timer = JSON.parse(timerData)
          } catch (parseError) {
            console.error(`[Exam Timer Worker] Failed to parse timer data for key ${key}`, parseError)
            // Delete malformed timer
            await redis.del(key)
            continue
          }

          const { attemptId, studentId, endTime } = timer
          const now = Date.now()

          if (now >= endTime) {
            console.log(`[Exam Timer Worker] Timer expired for attempt ${attemptId}, auto-submitting...`)

            try {
              // Auto-submit exam
              await examService.autoSubmitExam(attemptId, studentId)
              console.log(`[Exam Timer Worker] Successfully auto-submitted attempt ${attemptId}`)

              // Delete Redis key AFTER successful auto-submit
              await redis.del(key)
            } catch (submitError) {
              console.error(`[Exam Timer Worker] Failed to auto-submit attempt ${attemptId}:`, submitError)
              // Do NOT delete the key - let it retry next cycle
              // The Redis key will expire naturally after the duration
            }
          }
        } catch (timerError) {
          console.error(`[Exam Timer Worker] Error processing timer key ${key}:`, timerError)
          // Continue with next timer, don't stop the entire worker
        }
      }
    } catch (error) {
      console.error("[Exam Timer Worker] Fatal error in polling loop:", error)
      // Log but don't crash - worker will retry next cycle
    }
  }, 10000)
}
