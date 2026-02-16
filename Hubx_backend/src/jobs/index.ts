import { startExamTimerWorker } from "./exam-timer"

export const startBackgroundJobs = () => {
  console.log("Starting background jobs...")
  startExamTimerWorker()
  console.log("Background jobs started successfully")
}
