import type { Request, Response, NextFunction } from "express"
import { AppError } from "@utils/errors"
import { sendError } from "@utils/helpers"

export const errorHandler = (error: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", error)

  if (error instanceof AppError) {
    return sendError(res, error.statusCode, error.message)
  }

  sendError(res, 500, "Internal server error")
}
