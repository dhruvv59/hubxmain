import { startExamTimerWorker } from "./exam-timer"

let jobIntervals: NodeJS.Timeout[] = []

export const startBackgroundJobs = () => {
  console.log("Starting background jobs...")
  const examTimerInterval = startExamTimerWorker()
  if (examTimerInterval) {
    jobIntervals.push(examTimerInterval)
  }
  console.log("Background jobs started successfully")
}

/**
 * Gracefully stop all background jobs
 * Call this during server shutdown
 */
export const stopBackgroundJobs = () => {
  console.log("[Background Jobs] Shutting down gracefully...")
  for (const interval of jobIntervals) {
    clearInterval(interval)
  }
  jobIntervals = []
  console.log("[Background Jobs] All jobs stopped")
}
