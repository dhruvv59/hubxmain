import type { Request, Response, NextFunction } from "express"
import { AppError } from "@utils/errors"
import { sendError } from "@utils/helpers"

export const errorHandler = (error: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString()
  const requestId = req.headers["x-request-id"] || "unknown"
  const method = req.method
  const path = req.path

  // Structured error logging
  const errorLog = {
    timestamp,
    requestId,
    method,
    path,
    errorName: error.name,
    errorMessage: error.message,
    errorType: error instanceof AppError ? "AppError" : "SystemError",
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  }

  if (error instanceof AppError) {
    // Expected application errors
    console.warn("[AppError]", JSON.stringify(errorLog))
    return sendError(res, error.statusCode, error.message)
  }

  // Unexpected system errors
  console.error("[SystemError]", JSON.stringify(errorLog))

  // Don't expose internal error details in production
  const message = process.env.NODE_ENV === "production"
    ? "Internal server error"
    : error.message

  sendError(res, 500, message)
}
