import type { Request, Response } from "express"
import { authService } from "./auth.service"
import { sendResponse, sendError } from "@utils/helpers"
import { asyncHandler } from "@utils/errors"
import type { AuthRequest } from "@middlewares/auth"

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role } = req.body

    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return sendError(res, 400, "Missing required fields")
    }

    const result = await authService.register(email, password, firstName, lastName, role)
    sendResponse(res, 201, "User registered successfully", result)
  })

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role } = req.body

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required")
    }


    const result = await authService.login(email, password)
    sendResponse(res, 200, "Login successful", result)
  })

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return sendError(res, 400, "Refresh token is required")
    }

    const result = await authService.refreshToken(refreshToken)
    sendResponse(res, 200, "Token refreshed successfully", result)
  })

  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized")
    }

    const user = await authService.getProfile(req.user.userId)
    sendResponse(res, 200, "Profile fetched successfully", user)
  })

  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized")
    }

    // Optional: Log logout event for analytics/audit
    console.log(`[Auth] User ${req.user.userId} logged out`)

    // Future: Call authService.logout() for token blacklisting or version increment
    // await authService.logout(req.user.userId)

    sendResponse(res, 200, "Logged out successfully", null)
  })
}

export const authController = new AuthController()
