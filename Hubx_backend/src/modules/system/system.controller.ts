/**
 * System Status Controller
 * Handles system health monitoring endpoints
 */

import type { Request, Response } from "express"
import { systemService } from "./system.service"
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
}

export const systemController = new SystemController()
