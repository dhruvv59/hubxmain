import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "@config/database"
import { AppError } from "@utils/errors"
import { generateTokens } from "@utils/helpers"
import { ERROR_MESSAGES, ROLES } from "@utils/constants"

export class AuthService {
  async register(email: string, password: string, firstName: string, lastName: string, role: string) {
    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      throw new AppError(400, ERROR_MESSAGES.INVALID_ROLE)
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new AppError(409, ERROR_MESSAGES.EMAIL_EXISTS)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as any,
      },
    })

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role)

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar || null,
      },
      accessToken,
      refreshToken,
    }
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new AppError(401, ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new AppError(401, ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    // Role check removed to allow cross-role login (e.g. Teacher logging in via Student form)
    // Frontend handles redirection based on returned role

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role)

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar || null,
      },
      accessToken,
      refreshToken,
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const jwtSecret = process.env.JWT_REFRESH_SECRET
      if (!jwtSecret) {
        throw new AppError(500, "JWT_REFRESH_SECRET is not configured")
      }

      const decoded = jwt.verify(refreshToken, jwtSecret) as any

      if (!decoded.userId) {
        throw new AppError(401, ERROR_MESSAGES.UNAUTHORIZED)
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
      if (!user) {
        throw new AppError(401, ERROR_MESSAGES.UNAUTHORIZED)
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role)

      return {
        accessToken,
        refreshToken: newRefreshToken,
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(401, "Invalid or expired refresh token")
      }

      throw new AppError(401, ERROR_MESSAGES.UNAUTHORIZED)
    }
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new AppError(404, ERROR_MESSAGES.NOT_FOUND)
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar || null,
    }
  }

  async logout(userId: string) {
    // Future implementation options:

    // Option 1: Token Blacklisting (requires Redis)
    // await redisClient.set(`blacklist:${token}`, '1', 'EX', tokenExpirySeconds);

    // Option 2: Token Versioning (requires User.tokenVersion field in schema)
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { tokenVersion: { increment: 1 } }
    // });

    // For now, just return success (client-side token clearing is sufficient)
    return { success: true }
  }
}

export const authService = new AuthService()
