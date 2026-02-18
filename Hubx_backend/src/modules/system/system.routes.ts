/**
 * System Status Routes
 * Public routes for system health monitoring
 */

import { Router } from "express"
import { systemController } from "./system.controller"

const router = Router()

/**
 * GET /api/system/status
 * Public endpoint - NO authentication required
 * Returns system health status for all modules
 */
router.get("/status", systemController.getStatus)

/**
 * GET /api/system/debug
 * Developer endpoint - shows comprehensive debug information
 * For development/staging only (restricted in production)
 */
router.get("/debug", systemController.getDebug)

export default router
