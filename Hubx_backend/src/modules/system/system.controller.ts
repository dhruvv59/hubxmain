/**
 * System Status Controller
 * Handles system health monitoring endpoints
 */

import type { Request, Response } from "express"
import { systemService } from "./system.service"
import { debugService } from "./debug.service"
import { sendResponse } from "@utils/helpers"
import { asyncHandler } from "@utils/errors"

export class SystemController {
  /**
   * GET /api/system/status
   * Public endpoint - no authentication required
   * Returns comprehensive system health status
   */
  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const status = await systemService.getSystemStatus()

    // Return 200 OK regardless of system health
    // Client will check the 'overall' field to determine actual status
    sendResponse(res, 200, "System status retrieved successfully", status)
  })

  /**
   * GET /api/system/debug
   * Developer/Admin only endpoint
   * Returns comprehensive debug information for developers
   * Includes: Feature checklist, database stats, environment status, performance metrics
   */
  getDebug = asyncHandler(async (req: Request, res: Response) => {
    // In production, you may want to check for admin/developer authorization here
    // For now, it's only recommended for internal development and staging
    if (process.env.NODE_ENV === 'production' && !req.user?.role?.includes('SUPER_ADMIN')) {
      return sendResponse(res, 403, "Access denied", null)
    }

    const debug = await debugService.getDebugInfo()
    sendResponse(res, 200, "Debug information retrieved successfully", debug)
  })
}

export const systemController = new SystemController()
