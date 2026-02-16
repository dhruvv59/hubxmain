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

export default router
