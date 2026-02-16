import jwt from "jsonwebtoken"
import type { Response } from "express"

// Validate JWT secrets on module load - fail fast if missing
const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

if (!JWT_SECRET) {
  console.error("❌ CRITICAL: JWT_SECRET environment variable is not set")
  console.error("   Application cannot start without a secure JWT secret")
  console.error("   Please set JWT_SECRET in your .env file")
  process.exit(1)
}

if (!JWT_REFRESH_SECRET) {
  console.error("❌ CRITICAL: JWT_REFRESH_SECRET environment variable is not set")
  console.error("   Application cannot start without a secure refresh token secret")
  console.error("   Please set JWT_REFRESH_SECRET in your .env file")
  process.exit(1)
}

// Export validated secrets for use in other modules
export { JWT_SECRET, JWT_REFRESH_SECRET }

export const generateTokens = (userId: string, role: string) => {
  const JWT_EXPIRE = process.env.JWT_EXPIRE || "15m"
  const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || "7d"

  const accessToken = jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE } as jwt.SignOptions
  )

  const refreshToken = jwt.sign(
    { userId, role },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRE } as jwt.SignOptions
  )

  return { accessToken, refreshToken }
}

export const sendResponse = (res: Response, statusCode: number, message: string, data?: any) => {
  res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data: data || null,
  })
}

export const sendError = (res: Response, statusCode: number, message: string) => {
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  })
}

export const generateExamKey = (attemptId: string): string => {
  return `exam:${attemptId}`
}

export const generateTimerKey = (attemptId: string): string => {
  return `timer:${attemptId}`
}
