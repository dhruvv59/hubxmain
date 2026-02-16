import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { sendError, JWT_SECRET } from "@utils/helpers"
import { ERROR_MESSAGES } from "@utils/constants"

export interface AuthRequest extends Request {
  user?: {
    userId: string
    role: string
  }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return sendError(res, 401, ERROR_MESSAGES.UNAUTHORIZED)
    }

    // JWT_SECRET is validated at startup in helpers.ts, guaranteed to exist
    const decoded = jwt.verify(token, JWT_SECRET!) as any

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    }

    next()
  } catch (error) {
    return sendError(res, 401, ERROR_MESSAGES.UNAUTHORIZED)
  }
}

export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, ERROR_MESSAGES.UNAUTHORIZED)
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, ERROR_MESSAGES.FORBIDDEN)
    }

    next()
  }
}

// Export alias for compatibility
export const authenticate = authMiddleware
